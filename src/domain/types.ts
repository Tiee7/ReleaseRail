export type IntentStatus = 'prepared' | 'approved' | 'simulated' | 'executing' | 'settled' | 'blocked'

export type ReleaseCandidate = {
  candidateId: string
  repository: string
  tag: string
  releaseUrl: string
  releaseTargetSha: string
  contributionCommit: string
  commitUrl: string
  expectedContributor: string
  observedContributor: string
  commitInRelease: true
  evidenceHash: string
}

export type PayoutPolicy = {
  policyId: string
  policyVersion: string
  repository: string
  chainId: number
  asset: 'native'
  maxAmountBaseUnits: string
  recipients: Record<string, `0x${string}`>
}

export type PayoutIntent = {
  intentId: string
  candidateId: string
  evidenceHash: string
  policyId: string
  policyVersion: string
  recipientAddress: `0x${string}`
  chainId: number
  asset: 'native'
  amountBaseUnits: string
  reason: string
  canonicalPayloadHash: string
  status: IntentStatus
  blockedReason?: string | null
  executionOutcome?: 'failed' | 'unknown'
  executionId?: string
  transactionHash?: `0x${string}`
  transactionLink?: string
  createdAt: string
  updatedAt: string
}

export type PayoutProof = {
  intentId: string
  candidate: Pick<ReleaseCandidate, 'repository' | 'tag' | 'releaseUrl' | 'commitUrl' | 'evidenceHash'>
  policy: Pick<PayoutPolicy, 'policyId' | 'policyVersion' | 'chainId' | 'asset'>
  recipientAddress: `0x${string}`
  amountBaseUnits: string
  canonicalPayloadHash: string
  keeperHubExecutionId?: string
  transactionHash?: `0x${string}`
  transactionLink?: string
  receiptVerified: boolean
  duplicateReplay?: boolean
  recordedAt: string
}
