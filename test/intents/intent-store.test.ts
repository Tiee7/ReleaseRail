import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { IntentStore, IntentStoreConflictError } from '../../src/intents/intent-store.js'
import type { PayoutIntent } from '../../src/domain/types.js'

const intent = (id = 'intent-1'): PayoutIntent => ({ intentId: id, candidateId: 'candidate-1', evidenceHash: 'e'.repeat(64), policyId: 'policy', policyVersion: '1', recipientAddress: '0x1111111111111111111111111111111111111111', chainId: 84532, asset: 'native', amountBaseUnits: '42', reason: 'reason', canonicalPayloadHash: 'a'.repeat(64), status: 'prepared', createdAt: '2026-09-16T00:00:00.000Z', updatedAt: '2026-09-16T00:00:00.000Z' })

describe('IntentStore', () => {
  it('persists and transitions an intent with an atomic JSON record', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-intents-'))
    const store = new IntentStore(directory, () => '2026-09-16T00:01:00.000Z')
    await store.create(intent())
    const updated = await store.transition('intent-1', 'prepared', 'approved')
    expect(updated.status).toBe('approved')
    expect(JSON.parse(await readFile(join(directory, 'intents.json'), 'utf8')).intents['intent-1'].status).toBe('approved')
  })

  it('rejects duplicate creation and stale transitions', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-intents-'))
    const store = new IntentStore(directory)
    await store.create(intent())
    await expect(store.create(intent())).rejects.toBeInstanceOf(IntentStoreConflictError)
    await store.transition('intent-1', 'prepared', 'approved')
    await expect(store.transition('intent-1', 'prepared', 'simulated')).rejects.toBeInstanceOf(IntentStoreConflictError)
  })
})
