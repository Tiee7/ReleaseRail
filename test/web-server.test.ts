import { afterEach, describe, expect, it } from 'vitest'
import { createWebServer } from '../src/web-server.js'
import type { DashboardSnapshot } from '../src/web/types.js'

const snapshot: DashboardSnapshot = {
  generatedAt: '2026-09-17T00:00:00.000Z',
  summary: { total: 1, settled: 1, pending: 0, blocked: 0, verified: 1 },
  payouts: [{
    intent: {
      intentId: 'intent-demo',
      candidateId: 'candidate-demo',
      evidenceHash: 'evidence-hash',
      policyId: 'ezdsh-release-testnet',
      policyVersion: '2026-09-16.1',
      recipientAddress: '0x1111111111111111111111111111111111111111',
      chainId: 84532,
      asset: 'native',
      amountBaseUnits: '1000000',
      reason: 'Demo payout',
      canonicalPayloadHash: 'canonical-hash',
      status: 'settled',
      executionId: 'execution-demo',
      transactionHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      transactionLink: 'https://sepolia.basescan.org/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:01:00.000Z'
    },
    candidate: {
      repository: 'Tiee7/EzDSH',
      tag: 'v1.8.1559',
      releaseUrl: 'https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559',
      commitUrl: 'https://github.com/Tiee7/EzDSH/commit/demo',
      evidenceHash: 'evidence-hash'
    },
    proof: {
      intentId: 'intent-demo',
      candidate: { repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', releaseUrl: 'https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559', commitUrl: 'https://github.com/Tiee7/EzDSH/commit/demo', evidenceHash: 'evidence-hash' },
      policy: { policyId: 'ezdsh-release-testnet', policyVersion: '2026-09-16.1', chainId: 84532, asset: 'native' },
      recipientAddress: '0x1111111111111111111111111111111111111111',
      amountBaseUnits: '1000000',
      canonicalPayloadHash: 'canonical-hash',
      keeperHubExecutionId: 'execution-demo',
      transactionHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      transactionLink: 'https://sepolia.basescan.org/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      receiptVerified: true,
      recordedAt: '2026-09-17T00:01:00.000Z'
    }
  }]
}

let server: ReturnType<typeof createWebServer> | undefined

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    if (server === undefined) return resolve()
    server.close((error) => error === undefined ? resolve() : reject(error))
  })
  server = undefined
})

describe('ReleaseRail web server', () => {
  it('serves the audit console and dashboard data without exposing credentials', async () => {
    server = createWebServer({ getDashboardSnapshot: async () => snapshot })
    await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', () => resolve()))
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('server did not bind to a port')
    const origin = `http://127.0.0.1:${address.port}`

    const page = await fetch(origin)
    expect(page.status).toBe(200)
    expect(await page.text()).toContain('ReleaseRail')

    const dashboard = await fetch(`${origin}/api/dashboard`)
    expect(dashboard.status).toBe(200)
    expect(await dashboard.json()).toEqual(snapshot)

    const missing = await fetch(`${origin}/missing`)
    expect(missing.status).toBe(404)
  })
})
