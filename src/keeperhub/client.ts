import { formatUnits } from 'viem'
import { KeeperHubApiError, redact } from './errors.js'

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export type TransferRequest = {
  chainId: number
  recipientAddress: `0x${string}`
  amountBaseUnits: string
}

export type SimulationResult = {
  status: string
  wouldRevert: boolean
  gasEstimate?: string
  error?: string
}

export type ExecutionAccepted = {
  executionId: string
  status: string
  transactionHash?: `0x${string}`
  transactionLink?: string
  idempotentReplay?: boolean
}

export type ExecutionStatus = ExecutionAccepted & {
  retryCount?: number
  receipts?: Array<{ hash: string; chainId: number; verified: boolean; receiptStatus: string }>
}

export type KeeperHubClientOptions = {
  fetcher?: FetchLike
  baseUrl?: string
  apiKey?: string
  sleep?: (milliseconds: number) => Promise<void>
}

export class KeeperHubClient {
  private readonly fetcher: FetchLike
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly sleep: (milliseconds: number) => Promise<void>

  constructor(options: KeeperHubClientOptions = {}) {
    this.fetcher = options.fetcher ?? fetch
    this.baseUrl = (options.baseUrl ?? process.env.KEEPERHUB_BASE_URL ?? 'https://app.keeperhub.com/api').replace(/\/$/, '')
    this.apiKey = options.apiKey ?? process.env.KEEPERHUB_API_KEY ?? ''
    this.sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)))
  }

  async simulateTransfer(request: TransferRequest): Promise<SimulationResult> {
    const response = await this.post('/execute/transfer', {
      chainId: request.chainId,
      recipientAddress: request.recipientAddress,
      amount: formatUnits(BigInt(request.amountBaseUnits), 18),
      simulate: true
    })
    return {
      status: String(response.status ?? 'unknown'),
      wouldRevert: response.wouldRevert === true || response.executed === false || response.status === 'failed',
      ...(typeof response.gasEstimate === 'string' ? { gasEstimate: response.gasEstimate } : {}),
      ...(typeof response.error === 'string' ? { error: redact(response.error) } : {})
    }
  }

  async executeTransfer(request: TransferRequest, idempotencyKey: string): Promise<ExecutionAccepted> {
    const response = await this.post('/execute/transfer', {
      chainId: request.chainId,
      recipientAddress: request.recipientAddress,
      amount: formatUnits(BigInt(request.amountBaseUnits), 18)
    }, { 'Idempotency-Key': idempotencyKey })
    return this.parseExecution(response)
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    const response = await this.get(`/execute/${encodeURIComponent(executionId)}/status`)
    return this.parseExecution(response) as ExecutionStatus
  }

  async waitForExecution(executionId: string, options: { maxPolls?: number } = {}): Promise<ExecutionStatus> {
    const maxPolls = options.maxPolls ?? 12
    for (let index = 0; index < maxPolls; index += 1) {
      const response = await this.get(`/execute/${encodeURIComponent(executionId)}/status`)
      const status = this.parseExecution(response) as ExecutionStatus
      const hintSeconds = Number(response.__pollIntervalHint ?? 0)
      if (hintSeconds === 0 || status.status === 'completed' || status.status === 'failed') return status
      await this.sleep(Math.min(Math.max(hintSeconds, 1), 30) * 1000)
    }
    return this.getExecutionStatus(executionId)
  }

  private async post(path: string, body: Record<string, unknown>, extraHeaders: Record<string, string> = {}): Promise<Record<string, unknown>> {
    return this.request(path, { method: 'POST', headers: extraHeaders, body: JSON.stringify(body) })
  }

  private async get(path: string): Promise<Record<string, unknown>> {
    return this.request(path, { method: 'GET' })
  }

  private async request(path: string, init: RequestInit): Promise<Record<string, unknown>> {
    if (this.apiKey.length === 0) throw new Error('KEEPERHUB_API_KEY is required for KeeperHub requests')
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    headers.set('Content-Type', 'application/json')
    headers.set('Authorization', `Bearer ${this.apiKey}`)
    const response = await this.fetcher(`${this.baseUrl}${path}`, { ...init, headers })
    const text = await response.text()
    let body: Record<string, unknown> = {}
    if (text.length > 0) {
      try {
        body = JSON.parse(text) as Record<string, unknown>
      } catch {
        body = { error: text }
      }
    }
    if (!response.ok) throw new KeeperHubApiError(response.status, path, String(body.error ?? text))
    const hint = response.headers.get('X-Poll-Interval-Hint')
    return hint === null ? body : { ...body, __pollIntervalHint: hint }
  }

  private parseExecution(body: Record<string, unknown>): ExecutionAccepted {
    if (typeof body.executionId !== 'string' || typeof body.status !== 'string') throw new Error('KeeperHub response omitted executionId or status')
    return {
      executionId: body.executionId,
      status: body.status,
      ...(typeof body.transactionHash === 'string' ? { transactionHash: body.transactionHash as `0x${string}` } : {}),
      ...(typeof body.transactionLink === 'string' ? { transactionLink: body.transactionLink } : {}),
      ...(body.idempotentReplay === true ? { idempotentReplay: true } : {})
    }
  }
}
