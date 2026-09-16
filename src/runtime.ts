import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { PayoutPolicy } from './domain/types.js'
import { ReleaseRailService, defaultReceiptSourceFactory } from './releaserail-service.js'

export async function createServiceFromEnvironment(): Promise<ReleaseRailService> {
  const policyPath = resolve(process.env.RELEASERAIL_POLICY_FILE ?? 'integrations/ezdsh/payout-policy.json')
  const parsed = JSON.parse(await readFile(policyPath, 'utf8')) as PayoutPolicy | { policies: PayoutPolicy[] }
  const policies = Array.isArray((parsed as { policies?: PayoutPolicy[] }).policies)
    ? Object.fromEntries((parsed as { policies: PayoutPolicy[] }).policies.map((policy) => [policy.policyId, policy]))
    : { [(parsed as PayoutPolicy).policyId]: parsed as PayoutPolicy }
  return new ReleaseRailService({
    stateDirectory: resolve(process.env.RELEASERAIL_STATE_DIR ?? '.releaserail/state'),
    proofDirectory: resolve(process.env.RELEASERAIL_PROOF_DIR ?? '.releaserail/proofs'),
    policies,
    receiptSourceFactory: defaultReceiptSourceFactory,
  })
}
