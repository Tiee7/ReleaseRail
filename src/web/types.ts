import type { PayoutIntent, PayoutProof, ReleaseCandidate } from '../domain/types.js'
import type { PayoutExecutionResult } from '../releaserail-service.js'

export type DashboardCandidate = Pick<ReleaseCandidate, 'repository' | 'tag' | 'releaseUrl' | 'commitUrl' | 'evidenceHash'>

export type DashboardPayout = {
  intent: PayoutIntent
  candidate?: DashboardCandidate
  proof?: PayoutProof
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
  payouts: DashboardPayout[]
}

export type DashboardDataSource = {
  getDashboardSnapshot: () => Promise<DashboardSnapshot>
  approvePayout?: (intentId: string, expectedIntentHash: string) => Promise<PayoutIntent>
  simulatePayout?: (intentId: string) => Promise<unknown>
  executePayout?: (intentId: string, expectedIntentHash: string) => Promise<PayoutExecutionResult>
}
