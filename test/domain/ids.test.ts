import { describe, expect, it } from 'vitest'
import { idempotencyKey, intentId } from '../../src/domain/ids.js'

describe('intent identities', () => {
  it('is stable regardless of input ordering', () => {
    expect(intentId('candidate-1', 'policy-1', 'abc')).toBe(intentId('candidate-1', 'policy-1', 'abc'))
    expect(intentId('candidate-1', 'policy-1', 'abc')).toMatch(/^intent-[0-9a-f]{24}$/)
  })

  it('derives a stable KeeperHub idempotency key', () => {
    expect(idempotencyKey('abc')).toBe('releaserail-abc')
  })
})
