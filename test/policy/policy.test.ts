import { describe, expect, it } from 'vitest'
import { validatePayout } from '../../src/policy/policy.js'
import type { PayoutPolicy, ReleaseCandidate } from '../../src/domain/types.js'

const candidate: ReleaseCandidate = {
  candidateId: 'candidate-1', repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', releaseUrl: 'https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559', releaseTargetSha: 'release', contributionCommit: 'commit', commitUrl: 'https://github.com/Tiee7/EzDSH/commit/commit', expectedContributor: 'WalkmanHenry', observedContributor: 'WalkmanHenry', commitInRelease: true, evidenceHash: 'e'.repeat(64)
}
const recipientAddress = '0x1111111111111111111111111111111111111111' as const
const policy: PayoutPolicy = { policyId: 'ezdsh-contributor-v1', policyVersion: '1', repository: 'Tiee7/EzDSH', chainId: 84532, asset: 'native', maxAmountBaseUnits: '1000', recipients: { WalkmanHenry: recipientAddress } }

describe('validatePayout', () => {
  it('binds evidence, policy, and transfer details into a prepared intent', () => {
    const result = validatePayout({ candidate, policy, recipientAddress, amountBaseUnits: '42', reason: 'Contribution shipped in v1.8.1559', now: () => '2026-09-16T00:00:00.000Z' })
    expect(result).toMatchObject({ status: 'prepared', amountBaseUnits: '42', chainId: 84532, evidenceHash: candidate.evidenceHash, createdAt: '2026-09-16T00:00:00.000Z' })
    expect(result.canonicalPayloadHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it.each([
    ['wrong repository', { candidate: { ...candidate, repository: 'Other/Repo' } }, 'repository does not match'],
    ['unknown recipient', { recipientAddress: '0x2222222222222222222222222222222222222222' }, 'not allowlisted'],
    ['over cap', { amountBaseUnits: '1001' }, 'exceeds policy maximum'],
    ['zero amount', { amountBaseUnits: '0' }, 'positive base-unit'],
    ['bad address', { recipientAddress: 'not-an-address' }, 'address is invalid'],
    ['mainnet chain', { policy: { ...policy, chainId: 1 } }, 'not an allowed testnet']
  ])('blocks %s', (_name, overrides, message) => {
    const input = { candidate, policy, recipientAddress, amountBaseUnits: '42', reason: 'reason', ...overrides } as Parameters<typeof validatePayout>[0]
    expect(() => validatePayout(input)).toThrow(message)
  })
})
