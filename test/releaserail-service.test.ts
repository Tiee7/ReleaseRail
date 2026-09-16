import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { GitHubClient } from '../src/github/github-client.js'
import { KeeperHubClient } from '../src/keeperhub/client.js'
import { ReleaseRailService } from '../src/releaserail-service.js'
import type { PayoutPolicy } from '../src/domain/types.js'
import type { ReceiptSource } from '../src/chain/receipt-verifier.js'

const recipient = '0x1111111111111111111111111111111111111111' as `0x${string}`
const transactionHash = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`
const policy: PayoutPolicy = {
  policyId: 'ezdsh-release',
  policyVersion: '2026-09-16.1',
  repository: 'Tiee7/EzDSH',
  chainId: 84532,
  asset: 'native',
  maxAmountBaseUnits: '10000000000000000',
  recipients: { Tiee7: recipient },
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

function githubClient(): GitHubClient {
  return new GitHubClient({ fetcher: async (input) => {
    if (input.includes('/releases/tags/')) return json({ tag_name: 'v1.8.1559', html_url: 'https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559', target_commitish: 'main' })
    if (input.includes('/git/ref/tags/')) return json({ object: { sha: 'release-sha', type: 'commit' } })
    if (input.includes('/commits/')) return json({ sha: 'contribution-sha', html_url: 'https://github.com/Tiee7/EzDSH/commit/contribution-sha', author: { login: 'Tiee7' }, committer: null, commit: { author: { name: 'Tie', email: 'tieetheai@gmail.com' }, committer: { name: 'Tie', email: 'tieetheai@gmail.com' } } })
    if (input.includes('/compare/')) return json({ status: 'ahead' })
    throw new Error(`unexpected GitHub URL: ${input}`)
  } })
}

function receiptSource(overrides: Partial<{ to: `0x${string}`; value: bigint; chainId: number; status: 'success' | 'reverted' }> = {}): ReceiptSource {
  return {
    getChainId: async () => overrides.chainId ?? 84532,
    getTransactionReceipt: async () => ({ status: overrides.status ?? 'success', transactionHash, blockNumber: 200n }),
    getTransaction: async () => ({ to: overrides.to ?? recipient, value: overrides.value ?? 1000000n, chainId: overrides.chainId ?? 84532 }),
  }
}

async function makeService(directory: string, options: { simulationReverts?: boolean; source?: ReceiptSource } = {}) {
  let transferCalls = 0
  const keeperHub = new KeeperHubClient({
    apiKey: 'kh_test_release-rail',
    sleep: vi.fn(),
    fetcher: async (input, init) => {
      if (input.endsWith('/execute/transfer')) {
        transferCalls += 1
        if (init?.body !== undefined && String(init.body).includes('"simulate":true')) {
          return json({ status: options.simulationReverts ? 'failed' : 'simulated', wouldRevert: options.simulationReverts === true, ...(options.simulationReverts ? { error: 'policy simulation failed' } : {}) })
        }
        return json({ executionId: 'exec-1', status: 'unconfirmed' }, 202)
      }
      if (input.endsWith('/status')) return json({ executionId: 'exec-1', status: 'completed', transactionHash, transactionLink: `https://sepolia.basescan.org/tx/${transactionHash}` }, 200, { 'X-Poll-Interval-Hint': '0' })
      throw new Error(`unexpected KeeperHub URL: ${input}`)
    },
  })
  const service = new ReleaseRailService({
    stateDirectory: join(directory, 'state'),
    proofDirectory: join(directory, 'proofs'),
    policies: { [policy.policyId]: policy },
    github: githubClient(),
    keeperHub,
    receiptSourceFactory: () => options.source ?? receiptSource(),
    now: () => '2026-09-16T00:00:00.000Z',
  })
  return { service, transferCalls: () => transferCalls }
}

describe('ReleaseRailService', () => {
  it('runs the reviewed flow and never broadcasts twice for a settled intent', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-service-'))
    const { service, transferCalls } = await makeService(directory)
    const candidate = await service.releaseCandidate({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', contributionCommit: 'contribution-sha', expectedContributor: 'Tiee7' })
    const prepared = await service.preparePayout({ candidateId: candidate.candidateId, policyId: policy.policyId, recipientAddress: recipient, amountBaseUnits: '1000000', reason: 'Contribution shipped in EzDSH release' })
    await expect(service.executePayout(prepared.intentId, prepared.canonicalPayloadHash)).rejects.toThrow('must be simulated')
    await expect(service.approvePayout(prepared.intentId, 'wrong-hash')).rejects.toThrow('hash mismatch')
    const approved = await service.approvePayout(prepared.intentId, prepared.canonicalPayloadHash)
    const simulated = await service.simulatePayout(approved.intentId)
    expect(simulated.intent.status).toBe('simulated')
    const executed = await service.executePayout(approved.intentId, approved.canonicalPayloadHash)
    expect(executed.intent.status).toBe('settled')
    expect(executed.verification?.verified).toBe(true)
    expect(executed.proofPath).toContain('intent-')
    const repeated = await service.executePayout(approved.intentId, approved.canonicalPayloadHash)
    expect(repeated.intent.status).toBe('settled')
    expect(transferCalls()).toBe(2)
    await expect(service.getPayoutProof(approved.intentId)).resolves.toMatchObject({ receiptVerified: true, keeperHubExecutionId: 'exec-1' })
  })

  it('blocks simulation failures before broadcast', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-service-'))
    const { service, transferCalls } = await makeService(directory, { simulationReverts: true })
    const candidate = await service.releaseCandidate({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', contributionCommit: 'contribution-sha', expectedContributor: 'Tiee7' })
    const prepared = await service.preparePayout({ candidateId: candidate.candidateId, policyId: policy.policyId, recipientAddress: recipient, amountBaseUnits: '1000000', reason: 'Contribution shipped in EzDSH release' })
    await service.approvePayout(prepared.intentId, prepared.canonicalPayloadHash)
    const simulated = await service.simulatePayout(prepared.intentId)
    expect(simulated.intent).toMatchObject({ status: 'blocked', blockedReason: 'policy simulation failed' })
    await expect(service.executePayout(prepared.intentId, prepared.canonicalPayloadHash)).rejects.toThrow('blocked')
    expect(transferCalls()).toBe(1)
  })

  it('blocks a receipt mismatch while preserving the transaction hash', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-service-'))
    const { service } = await makeService(directory, { source: receiptSource({ value: 2n }) })
    const candidate = await service.releaseCandidate({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', contributionCommit: 'contribution-sha', expectedContributor: 'Tiee7' })
    const prepared = await service.preparePayout({ candidateId: candidate.candidateId, policyId: policy.policyId, recipientAddress: recipient, amountBaseUnits: '1000000', reason: 'Contribution shipped in EzDSH release' })
    await service.approvePayout(prepared.intentId, prepared.canonicalPayloadHash)
    await service.simulatePayout(prepared.intentId)
    const result = await service.executePayout(prepared.intentId, prepared.canonicalPayloadHash)
    expect(result.intent).toMatchObject({ status: 'blocked', transactionHash, blockedReason: expect.stringContaining('value mismatch') })
    expect(result.verification?.verified).toBe(false)
  })
})
