import type { PayoutIntent, PayoutPolicy, PayoutProof, ReleaseCandidate } from '../domain/types.js'
import type { PayoutExecutionResult } from '../releaserail-service.js'

export type DashboardCandidate = Pick<ReleaseCandidate, 'repository' | 'tag' | 'releaseUrl' | 'commitUrl' | 'evidenceHash'>

export type DashboardReleaseCandidate = DashboardCandidate & Pick<ReleaseCandidate, 'candidateId' | 'contributionCommit' | 'expectedContributor'>

export type DashboardPolicy = Pick<PayoutPolicy, 'policyId' | 'policyVersion' | 'chainId' | 'asset' | 'maxAmountBaseUnits' | 'recipients'>

export type DashboardPayout = {
  intent: PayoutIntent
  candidate?: DashboardCandidate
  proof?: PayoutProof
}

export type DashboardRelease = {
  candidate: DashboardReleaseCandidate
  payout?: DashboardPayout
}

export type DashboardSnapshot = {
  generatedAt: string
  summary: {
    total: number
    settled: number
    pending: number
    blocked: number
    verified: number
  }
  policies: DashboardPolicy[]
  releases: DashboardRelease[]
  payouts: DashboardPayout[]
}

export type DashboardDataSource = {
  getDashboardSnapshot: () => Promise<DashboardSnapshot>
  preparePayout?: (input: { candidateId: string; policyId: string; recipientAddress: `0x${string}`; amountBaseUnits: string; reason: string }) => Promise<PayoutIntent>
  approvePayout?: (intentId: string, expectedIntentHash: string) => Promise<PayoutIntent>
  simulatePayout?: (intentId: string) => Promise<unknown>
  executePayout?: (intentId: string, expectedIntentHash: string) => Promise<PayoutExecutionResult>
}
