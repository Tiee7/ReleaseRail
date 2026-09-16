import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readProof, writeProof } from '../../src/proof/proof-store.js'
import type { PayoutProof } from '../../src/domain/types.js'

const proof: PayoutProof = {
  intentId: 'intent-123',
  candidate: { repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', releaseUrl: 'https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559', commitUrl: 'https://github.com/Tiee7/EzDSH/commit/abc', evidenceHash: 'a'.repeat(64) },
  policy: { policyId: 'ezdsh-release', policyVersion: '1', chainId: 84532, asset: 'native' },
  recipientAddress: '0x1111111111111111111111111111111111111111',
  amountBaseUnits: '1000',
  canonicalPayloadHash: 'b'.repeat(64),
  keeperHubExecutionId: 'exec-1',
  transactionHash: '0x' + 'c'.repeat(64) as `0x${string}`,
  transactionLink: 'https://sepolia.basescan.org/tx/0x' + 'c'.repeat(64),
  receiptVerified: true,
  duplicateReplay: false,
  recordedAt: '2026-09-16T00:00:00.000Z',
}

describe('proof store', () => {
  it('writes and reads only the public proof bundle', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-proof-'))
    const path = await writeProof(directory, proof)
    expect(path).toContain('intent-123.json')
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(proof)
    await expect(readProof(directory, 'intent-123')).resolves.toEqual(proof)
  })

  it('rejects credential-like values and unknown fields', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'releaserail-proof-'))
    await expect(writeProof(directory, { ...proof, transactionLink: 'Bearer kh_live_secret' })).rejects.toThrow('credential-like')
    await expect(writeProof(directory, { ...proof, extra: 'should not be written' } as PayoutProof & { extra: string })).rejects.toThrow('not public')
  })
})
