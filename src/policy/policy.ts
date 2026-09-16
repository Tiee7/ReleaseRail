import { canonicalJson, sha256Hex } from '../domain/canonical-json.js'
import { isSupportedTestnetChainId } from '../domain/chains.js'
import { intentId } from '../domain/ids.js'
import type { PayoutIntent, PayoutPolicy, ReleaseCandidate } from '../domain/types.js'

export type PreparePayoutInput = {
  candidate: ReleaseCandidate
  policy: PayoutPolicy
  recipientAddress: `0x${string}`
  amountBaseUnits: string
  reason: string
  now?: () => string
}

function isAddress(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(value)
}

function isUnsignedInteger(value: string): boolean {
  return /^(0|[1-9][0-9]*)$/.test(value)
}

export function validatePayout(input: PreparePayoutInput): PayoutIntent {
  const { candidate, policy, recipientAddress, amountBaseUnits } = input
  if (candidate.repository !== policy.repository) throw new Error('policy repository does not match candidate')
  if (!candidate.commitInRelease) throw new Error('candidate contribution is not in the release')
  if (!isAddress(recipientAddress)) throw new Error('recipient address is invalid')
  if (!isUnsignedInteger(amountBaseUnits) || amountBaseUnits === '0') throw new Error('amount must be a positive base-unit integer')
  if (!isUnsignedInteger(policy.maxAmountBaseUnits)) throw new Error('policy maximum is invalid')
  if (BigInt(amountBaseUnits) > BigInt(policy.maxAmountBaseUnits)) throw new Error('amount exceeds policy maximum')
  const mappedAddress = policy.recipients[candidate.observedContributor]
  if (mappedAddress === undefined || mappedAddress.toLowerCase() !== recipientAddress.toLowerCase()) {
    throw new Error(`recipient is not allowlisted for ${candidate.observedContributor}`)
  }
  if (!Number.isInteger(policy.chainId) || !isSupportedTestnetChainId(policy.chainId)) throw new Error('policy chain is not an allowed testnet')
  if (policy.asset !== 'native') throw new Error('only native asset is supported in P0')
  if (input.reason.trim().length === 0 || input.reason.length > 240) throw new Error('reason must be between 1 and 240 characters')
  const payload = {
    amountBaseUnits,
    asset: policy.asset,
    candidateId: candidate.candidateId,
    chainId: policy.chainId,
    evidenceHash: candidate.evidenceHash,
    policyId: policy.policyId,
    policyVersion: policy.policyVersion,
    reason: input.reason.trim(),
    recipientAddress: recipientAddress.toLowerCase()
  }
  const canonicalPayloadHash = sha256Hex(canonicalJson(payload))
  const now = input.now ?? (() => new Date().toISOString())
  const timestamp = now()
  return {
    intentId: intentId(candidate.candidateId, policy.policyId, canonicalPayloadHash),
    candidateId: candidate.candidateId,
    evidenceHash: candidate.evidenceHash,
    policyId: policy.policyId,
    policyVersion: policy.policyVersion,
    recipientAddress,
    chainId: policy.chainId,
    asset: policy.asset,
    amountBaseUnits,
    reason: input.reason.trim(),
    canonicalPayloadHash,
    status: 'prepared',
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
