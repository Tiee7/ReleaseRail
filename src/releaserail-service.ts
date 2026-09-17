import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { idempotencyKey } from './domain/ids.js'
import type { PayoutIntent, PayoutPolicy, ReleaseCandidate } from './domain/types.js'
import { IntentStore, IntentStoreConflictError } from './intents/intent-store.js'
import { GitHubClient } from './github/github-client.js'
import { buildReleaseCandidate, type ReleaseCandidateInput } from './github/release-evidence.js'
import { KeeperHubClient, type ExecutionStatus, type SimulationResult } from './keeperhub/client.js'
import { validatePayout } from './policy/policy.js'
import { readProof, writeProof } from './proof/proof-store.js'
import { SUPPORTED_RECEIPT_CHAIN_IDS, verifyNativeTransfer, ViemReceiptSource, type ReceiptSource, type ReceiptVerification } from './chain/receipt-verifier.js'
import type { DashboardCandidate, DashboardPayout, DashboardSnapshot } from './web/types.js'

type CandidateState = { candidates: Record<string, ReleaseCandidate> }

export type PreparePayoutRequest = {
  candidateId: string
  policyId: string
  recipientAddress: `0x${string}`
  amountBaseUnits: string
  reason: string
}

export type PayoutExecutionResult = {
  intent: PayoutIntent
  execution: ExecutionStatus
  verification?: ReceiptVerification
  proofPath?: string
}

export type ReleaseRailServiceOptions = {
  stateDirectory: string
  proofDirectory: string
  policies: Record<string, PayoutPolicy>
  github?: GitHubClient
  keeperHub?: KeeperHubClient
  receiptSourceFactory?: (chainId: number) => ReceiptSource
  now?: () => string
}

export class ReleaseRailService {
  private readonly stateDirectory: string
  private readonly candidatePath: string
  private readonly proofDirectory: string
  private readonly policies: Record<string, PayoutPolicy>
  private readonly github: GitHubClient
  private readonly keeperHub: KeeperHubClient
  private readonly intents: IntentStore
  private readonly receiptSourceFactory: ((chainId: number) => ReceiptSource) | undefined
  private readonly now: () => string

  constructor(options: ReleaseRailServiceOptions) {
    this.stateDirectory = options.stateDirectory
    this.candidatePath = join(options.stateDirectory, 'candidates.json')
    this.proofDirectory = options.proofDirectory
    this.policies = options.policies
    this.github = options.github ?? new GitHubClient()
    this.keeperHub = options.keeperHub ?? new KeeperHubClient()
    this.intents = new IntentStore(options.stateDirectory, options.now)
    this.receiptSourceFactory = options.receiptSourceFactory
    this.now = options.now ?? (() => new Date().toISOString())
  }

  async releaseCandidate(input: ReleaseCandidateInput): Promise<ReleaseCandidate> {
    const candidate = await buildReleaseCandidate(input, this.github)
    const state = await this.readCandidates()
    const existing = state.candidates[candidate.candidateId]
    if (existing !== undefined) return existing
    state.candidates[candidate.candidateId] = candidate
    await this.writeCandidates(state)
    return candidate
  }

  async preparePayout(input: PreparePayoutRequest): Promise<PayoutIntent> {
    const candidate = await this.getCandidate(input.candidateId)
    const policy = this.policies[input.policyId]
    if (policy === undefined) throw new Error(`policy not found: ${input.policyId}`)
    const intent = validatePayout({ candidate, policy, recipientAddress: input.recipientAddress, amountBaseUnits: input.amountBaseUnits, reason: input.reason, now: this.now })
    try {
      return await this.intents.create(intent)
    } catch (error) {
      if (!(error instanceof IntentStoreConflictError)) throw error
      const existing = await this.intents.get(intent.intentId)
      if (existing === undefined) throw error
      return existing
    }
  }

  async approvePayout(intentIdValue: string, expectedIntentHash: string): Promise<PayoutIntent> {
    const intent = await this.requireIntent(intentIdValue)
    this.assertHash(intent, expectedIntentHash)
    return this.intents.transition(intent.intentId, 'prepared', 'approved')
  }

  async simulatePayout(intentIdValue: string): Promise<{ intent: PayoutIntent; simulation: SimulationResult }> {
    let intent = await this.requireIntent(intentIdValue)
    if (intent.status === 'blocked' && this.isRetryableFundingBlock(intent.blockedReason)) {
      intent = await this.intents.transition(intent.intentId, 'blocked', 'approved', { blockedReason: null })
    }
    if (intent.status !== 'approved') throw new Error(`intent must be approved before simulation, found ${intent.status}`)
    try {
      const simulation = await this.keeperHub.simulateTransfer({ chainId: intent.chainId, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits })
      if (simulation.wouldRevert || simulation.status === 'failed' || simulation.status === 'unknown') {
        const blocked = await this.intents.transition(intent.intentId, 'approved', 'blocked', { blockedReason: simulation.error ?? `simulation status: ${simulation.status}` })
        return { intent: blocked, simulation }
      }
      const simulated = await this.intents.transition(intent.intentId, 'approved', 'simulated')
      return { intent: simulated, simulation }
    } catch (error) {
      const blocked = await this.intents.transition(intent.intentId, 'approved', 'blocked', { blockedReason: error instanceof Error ? error.message : 'simulation failed' })
      return { intent: blocked, simulation: { status: 'failed', wouldRevert: true, ...(blocked.blockedReason === undefined || blocked.blockedReason === null ? {} : { error: blocked.blockedReason }) } }
    }
  }

  async executePayout(intentIdValue: string, expectedIntentHash: string): Promise<PayoutExecutionResult> {
    let intent = await this.requireIntent(intentIdValue)
    this.assertHash(intent, expectedIntentHash)
    if (intent.status === 'settled') {
      const proof = await readProof(this.proofDirectory, intent.intentId)
      return { intent, execution: this.executionFromIntent(intent), ...(proof === undefined ? {} : { proofPath: join(this.proofDirectory, `${intent.intentId}.json`) }) }
    }
    if (intent.status === 'blocked') {
      if (intent.executionId !== undefined && intent.transactionHash !== undefined) return this.reconcileBlockedPayout(intent)
      throw new Error(`intent is blocked: ${intent.blockedReason ?? 'unknown reason'}`)
    }
    if (intent.status !== 'simulated' && intent.status !== 'executing') throw new Error(`intent must be simulated before execution, found ${intent.status}`)

    let execution: ExecutionStatus
    if (intent.status === 'executing' && intent.executionId !== undefined) {
      try {
        execution = await this.reconcile(intent.executionId)
      } catch (error) {
        const unknown = await this.intents.transition(intent.intentId, 'executing', 'executing', { executionOutcome: 'unknown' })
        return { intent: unknown, execution: { executionId: intent.executionId, status: 'unknown' }, ...(error instanceof Error ? { verification: { verified: false, chainId: intent.chainId, transactionHash: intent.transactionHash ?? ('0x' + '0'.repeat(64)) as `0x${string}`, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits, reason: `reconciliation unavailable: ${error.message}` } } : {}) }
      }
    } else {
      const accepted = await this.keeperHub.executeTransfer({ chainId: intent.chainId, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits }, idempotencyKey(intent.canonicalPayloadHash))
      intent = await this.intents.transition(intent.intentId, 'simulated', 'executing', {
        executionId: accepted.executionId,
        ...(accepted.transactionHash === undefined ? {} : { transactionHash: accepted.transactionHash }),
        ...(accepted.transactionLink === undefined ? {} : { transactionLink: accepted.transactionLink }),
      })
      try {
        execution = { ...accepted, ...(await this.reconcile(accepted.executionId)) }
      } catch (error) {
        const unknown = await this.intents.transition(intent.intentId, 'executing', 'executing', { executionOutcome: 'unknown', ...(accepted.transactionHash === undefined ? {} : { transactionHash: accepted.transactionHash }) })
        return { intent: unknown, execution: { ...accepted, status: 'unknown' }, ...(error instanceof Error && accepted.transactionHash === undefined ? {} : error instanceof Error ? { verification: { verified: false, chainId: intent.chainId, transactionHash: accepted.transactionHash!, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits, reason: `reconciliation unavailable: ${error.message}` } } : {}) }
      }
    }

    if (execution.status === 'failed') {
      const blocked = await this.intents.transition(intent.intentId, 'executing', 'blocked', { executionId: execution.executionId, blockedReason: 'KeeperHub execution failed', executionOutcome: 'failed', ...(execution.transactionHash === undefined ? {} : { transactionHash: execution.transactionHash }), ...(execution.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink }) })
      return { intent: blocked, execution }
    }
    if (execution.transactionHash === undefined) {
      const unknown = await this.intents.transition(intent.intentId, 'executing', 'executing', { executionOutcome: 'unknown' })
      return { intent: unknown, execution }
    }
    let source: ReceiptSource | undefined
    try {
      source = this.receiptSourceFactory?.(intent.chainId)
    } catch (error) {
      const unknown = await this.intents.transition(intent.intentId, 'executing', 'executing', { executionOutcome: 'unknown', transactionHash: execution.transactionHash, ...(execution.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink }) })
      return { intent: unknown, execution, verification: { verified: false, chainId: intent.chainId, transactionHash: execution.transactionHash, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits, reason: `receipt source unavailable: ${error instanceof Error ? error.message : 'unknown error'}` } }
    }
    if (source === undefined) {
      const unknown = await this.intents.transition(intent.intentId, 'executing', 'executing', { executionOutcome: 'unknown', transactionHash: execution.transactionHash, ...(execution.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink }) })
      return { intent: unknown, execution }
    }
    const verification = await verifyNativeTransfer(source, { chainId: intent.chainId, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits, transactionHash: execution.transactionHash })
    if (!verification.verified) {
      const blocked = await this.intents.transition(intent.intentId, 'executing', 'blocked', { transactionHash: execution.transactionHash, ...(execution.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink }), blockedReason: verification.reason ?? 'receipt verification failed' })
      return { intent: blocked, execution, verification }
    }
    const candidate = await this.getCandidate(intent.candidateId)
    const policy = this.policies[intent.policyId]
    if (policy === undefined) throw new Error(`policy not found: ${intent.policyId}`)
    const proofPath = await writeProof(this.proofDirectory, {
      intentId: intent.intentId,
      candidate: { repository: candidate.repository, tag: candidate.tag, releaseUrl: candidate.releaseUrl, commitUrl: candidate.commitUrl, evidenceHash: candidate.evidenceHash },
      policy: { policyId: policy.policyId, policyVersion: policy.policyVersion, chainId: policy.chainId, asset: policy.asset },
      recipientAddress: intent.recipientAddress,
      amountBaseUnits: intent.amountBaseUnits,
      canonicalPayloadHash: intent.canonicalPayloadHash,
      keeperHubExecutionId: execution.executionId,
      transactionHash: execution.transactionHash,
      ...(execution.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink }),
      receiptVerified: true,
      ...(execution.idempotentReplay === true ? { duplicateReplay: true } : {}),
      recordedAt: this.now(),
    })
    const settled = await this.intents.transition(intent.intentId, 'executing', 'settled', { transactionHash: execution.transactionHash, ...(execution.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink }) })
    return { intent: settled, execution, verification, proofPath }
  }

  async getPayoutProof(intentIdValue: string): Promise<Awaited<ReturnType<typeof readProof>>> {
    return readProof(this.proofDirectory, intentIdValue)
  }

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    const [intents, candidates] = await Promise.all([this.intents.list(), this.readCandidates()])
    const payouts = await Promise.all(intents.map(async (intent): Promise<DashboardPayout> => {
      const candidate = candidates.candidates[intent.candidateId]
      const proof = await readProof(this.proofDirectory, intent.intentId)
      const dashboardCandidate: DashboardCandidate | undefined = candidate === undefined ? undefined : {
        repository: candidate.repository,
        tag: candidate.tag,
        releaseUrl: candidate.releaseUrl,
        commitUrl: candidate.commitUrl,
        evidenceHash: candidate.evidenceHash,
      }
      return {
        intent,
        ...(dashboardCandidate === undefined ? {} : { candidate: dashboardCandidate }),
        ...(proof === undefined ? {} : { proof }),
      }
    }))
    const settled = intents.filter((intent) => intent.status === 'settled').length
    const blocked = intents.filter((intent) => intent.status === 'blocked').length
    const verified = payouts.filter((payout) => payout.proof?.receiptVerified === true).length
    return {
      generatedAt: this.now(),
      summary: { total: intents.length, settled, pending: intents.length - settled - blocked, blocked, verified },
      payouts,
    }
  }

  private async reconcile(executionId: string): Promise<ExecutionStatus> {
    return this.keeperHub.waitForExecution(executionId, { maxPolls: 12 })
  }

  private async reconcileBlockedPayout(intent: PayoutIntent): Promise<PayoutExecutionResult> {
    const execution = await this.reconcile(intent.executionId as string)
    const transactionHash = execution.transactionHash ?? intent.transactionHash
    if (execution.status === 'failed' || transactionHash === undefined) return { intent, execution }
    let source: ReceiptSource | undefined
    try {
      source = this.receiptSourceFactory?.(intent.chainId)
    } catch (error) {
      return { intent, execution, verification: { verified: false, chainId: intent.chainId, transactionHash, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits, reason: `receipt source unavailable: ${error instanceof Error ? error.message : 'unknown error'}` } }
    }
    if (source === undefined) return { intent, execution }
    const verification = await verifyNativeTransfer(source, { chainId: intent.chainId, recipientAddress: intent.recipientAddress, amountBaseUnits: intent.amountBaseUnits, transactionHash })
    if (!verification.verified) return { intent, execution, verification }
    const candidate = await this.getCandidate(intent.candidateId)
    const policy = this.policies[intent.policyId]
    if (policy === undefined) throw new Error(`policy not found: ${intent.policyId}`)
    const proofPath = await writeProof(this.proofDirectory, {
      intentId: intent.intentId,
      candidate: { repository: candidate.repository, tag: candidate.tag, releaseUrl: candidate.releaseUrl, commitUrl: candidate.commitUrl, evidenceHash: candidate.evidenceHash },
      policy: { policyId: policy.policyId, policyVersion: policy.policyVersion, chainId: policy.chainId, asset: policy.asset },
      recipientAddress: intent.recipientAddress,
      amountBaseUnits: intent.amountBaseUnits,
      canonicalPayloadHash: intent.canonicalPayloadHash,
      ...(intent.executionId === undefined ? {} : { keeperHubExecutionId: intent.executionId }),
      transactionHash,
      ...(execution.transactionLink === undefined && intent.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink ?? intent.transactionLink }),
      receiptVerified: true,
      recordedAt: this.now(),
    })
    const settled = await this.intents.transition(intent.intentId, 'blocked', 'settled', { blockedReason: null, transactionHash, ...(execution.transactionLink === undefined && intent.transactionLink === undefined ? {} : { transactionLink: execution.transactionLink ?? intent.transactionLink }) })
    return { intent: settled, execution, verification, proofPath }
  }

  private async requireIntent(intentIdValue: string): Promise<PayoutIntent> {
    const intent = await this.intents.get(intentIdValue)
    if (intent === undefined) throw new Error(`intent not found: ${intentIdValue}`)
    return intent
  }

  private assertHash(intent: PayoutIntent, expectedIntentHash: string): void {
    if (intent.canonicalPayloadHash !== expectedIntentHash) throw new Error('intent hash mismatch; refusing state transition')
  }

  private executionFromIntent(intent: PayoutIntent): ExecutionStatus {
    if (intent.executionId === undefined) throw new Error('settled intent has no execution identity')
    return { executionId: intent.executionId, status: intent.status, ...(intent.transactionHash === undefined ? {} : { transactionHash: intent.transactionHash }), ...(intent.transactionLink === undefined ? {} : { transactionLink: intent.transactionLink }) }
  }

  private isRetryableFundingBlock(reason: string | null | undefined): boolean {
    return reason !== undefined && reason !== null && /insufficient .*balance/i.test(reason)
  }

  private async getCandidate(candidateId: string): Promise<ReleaseCandidate> {
    const state = await this.readCandidates()
    const candidate = state.candidates[candidateId]
    if (candidate === undefined) throw new Error(`candidate not found: ${candidateId}`)
    return candidate
  }

  private async readCandidates(): Promise<CandidateState> {
    try {
      const parsed = JSON.parse(await readFile(this.candidatePath, 'utf8')) as CandidateState
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.candidates !== 'object' || parsed.candidates === null) throw new Error('invalid candidate store')
      return parsed
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { candidates: {} }
      throw error
    }
  }

  private async writeCandidates(state: CandidateState): Promise<void> {
    await mkdir(this.stateDirectory, { recursive: true })
    const temporary = `${this.candidatePath}.${process.pid}.tmp`
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, this.candidatePath)
  }
}

export function defaultReceiptSourceFactory(chainId: number): ReceiptSource {
  if (!SUPPORTED_RECEIPT_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_RECEIPT_CHAIN_IDS)[number])) throw new Error(`unsupported receipt chain: ${chainId}`)
  const rpcUrl = process.env.RELEASERAIL_RPC_URL
  if (rpcUrl === undefined || rpcUrl.length === 0) throw new Error('RELEASERAIL_RPC_URL is required for receipt verification')
  return new ViemReceiptSource(chainId as 84532 | 11155111, rpcUrl)
}
