import { describe, expect, it, vi } from 'vitest'
import { KeeperHubApiError } from '../../src/keeperhub/errors.js'
import { KeeperHubClient, type TransferRequest } from '../../src/keeperhub/client.js'

const transfer: TransferRequest = { chainId: 84532, recipientAddress: '0x1111111111111111111111111111111111111111', amountBaseUnits: '1000000000000000' }

function response(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

describe('KeeperHubClient', () => {
  it('simulates a native transfer with no idempotency header', async () => {
    const fetcher = vi.fn(async (_input: string, init?: RequestInit) => {
      expect(init?.headers).toBeDefined()
      const headers = new Headers(init?.headers)
      expect(headers.get('Idempotency-Key')).toBeNull()
      expect(JSON.parse(String(init?.body))).toMatchObject({ chainId: 84532, amount: '0.001', simulate: true })
      return response({ status: 'simulated', wouldRevert: false, gasEstimate: '21000' })
    })
    const client = new KeeperHubClient({ fetcher, apiKey: 'kh_test_secret' })
    await expect(client.simulateTransfer(transfer)).resolves.toMatchObject({ status: 'simulated', wouldRevert: false })
  })

  it('executes with the stable key and parses the execution identity', async () => {
    const fetcher = vi.fn(async (_input: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      expect(headers.get('Idempotency-Key')).toBe('releaserail-intent-1')
      expect(JSON.parse(String(init?.body))).toMatchObject({ chainId: 84532, amount: '0.001' })
      return response({ executionId: 'exec-1', status: 'unconfirmed' }, 202)
    })
    const client = new KeeperHubClient({ fetcher, apiKey: 'kh_test_secret' })
    await expect(client.executeTransfer(transfer, 'releaserail-intent-1')).resolves.toEqual({ executionId: 'exec-1', status: 'unconfirmed' })
  })

  it('honours the poll hint and returns the transaction proof', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response({ executionId: 'exec-1', status: 'running' }, 200, { 'X-Poll-Interval-Hint': '0' }))
    const client = new KeeperHubClient({ fetcher, apiKey: 'kh_test_secret', sleep: vi.fn() })
    await expect(client.waitForExecution('exec-1')).resolves.toMatchObject({ executionId: 'exec-1', status: 'running' })
  })

  it('redacts secrets from API errors', async () => {
    const fetcher = vi.fn(async () => response({ error: 'bad kh_live_secret-value' }, 401))
    const client = new KeeperHubClient({ fetcher, apiKey: 'kh_live_secret-value' })
    await expect(client.getExecutionStatus('exec-1')).rejects.toMatchObject({ name: 'KeeperHubApiError' })
    await expect(client.getExecutionStatus('exec-1')).rejects.toThrow('[redacted-key]')
    await expect(client.getExecutionStatus('exec-1')).rejects.not.toThrow('kh_live_secret-value')
    expect(fetcher).toHaveBeenCalled()
  })

  it('requires an API key before making a request', async () => {
    const client = new KeeperHubClient({ fetcher: vi.fn() })
    await expect(client.getExecutionStatus('exec-1')).rejects.toThrow('KEEPERHUB_API_KEY')
  })
})
