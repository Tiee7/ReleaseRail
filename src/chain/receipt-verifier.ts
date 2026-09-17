import { createPublicClient, http, type Hash } from 'viem'
import { baseSepolia, sepolia } from 'viem/chains'
import { isSupportedTestnetChainId, SUPPORTED_TESTNET_CHAIN_IDS, type SupportedTestnetChainId } from '../domain/chains.js'

export const SUPPORTED_RECEIPT_CHAIN_IDS = SUPPORTED_TESTNET_CHAIN_IDS
export type SupportedReceiptChainId = SupportedTestnetChainId

type TransactionReceipt = {
  status: 'success' | 'reverted'
  transactionHash: Hash
  blockNumber: bigint
}

type Transaction = {
  from?: `0x${string}`
  to: `0x${string}` | null
  value: bigint
  chainId?: number
}

type RpcClient = {
  getChainId: () => Promise<number>
  getTransactionReceipt: (args: { hash: Hash }) => Promise<TransactionReceipt>
  getTransaction: (args: { hash: Hash }) => Promise<Transaction>
  request: (args: { method: string; params?: readonly unknown[] }) => Promise<unknown>
}

export type NativeTransferCall = {
  to: `0x${string}`
  value: bigint
}

export type ReceiptSource = {
  getChainId: () => Promise<number>
  getTransactionReceipt: (hash: Hash) => Promise<TransactionReceipt>
  getTransaction: (hash: Hash) => Promise<Transaction>
  getNativeTransferCalls?: (hash: Hash) => Promise<NativeTransferCall[]>
}

export type NativeTransferExpectation = {
  chainId: number
  recipientAddress: `0x${string}`
  amountBaseUnits: string
  transactionHash: `0x${string}`
}

export type ReceiptVerification = {
  verified: boolean
  chainId: number
  transactionHash: `0x${string}`
  recipientAddress: `0x${string}`
  amountBaseUnits: string
  sourceAddress?: `0x${string}`
  blockNumber?: string
  reason?: string
}

export class ViemReceiptSource implements ReceiptSource {
  private readonly client: RpcClient

  constructor(chainId: SupportedReceiptChainId, rpcUrl: string) {
    if (!isSupportedTestnetChainId(chainId)) throw new Error(`unsupported receipt chain: ${chainId}`)
    const chain = chainId === 84532 ? baseSepolia : sepolia
    this.client = createPublicClient({ chain, transport: http(rpcUrl) }) as unknown as RpcClient
  }

  async getChainId(): Promise<number> {
    return this.client.getChainId()
  }

  async getTransactionReceipt(hash: Hash): Promise<TransactionReceipt> {
    const receipt = await this.client.getTransactionReceipt({ hash })
    return { status: receipt.status, transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber }
  }

  async getTransaction(hash: Hash): Promise<Transaction> {
    const transaction = await this.client.getTransaction({ hash })
    return {
      ...(transaction.from === undefined ? {} : { from: transaction.from }),
      to: transaction.to,
      value: transaction.value,
      ...(transaction.chainId === undefined ? {} : { chainId: transaction.chainId }),
    }
  }

  async getNativeTransferCalls(hash: Hash): Promise<NativeTransferCall[]> {
    const trace = await this.client.request({ method: 'debug_traceTransaction', params: [hash, { tracer: 'callTracer' }] })
    return collectNativeTransferCalls(trace)
  }
}

function collectNativeTransferCalls(value: unknown): NativeTransferCall[] {
  if (typeof value !== 'object' || value === null) return []
  const record = value as Record<string, unknown>
  const calls = Array.isArray(record.calls) ? record.calls.flatMap((call) => collectNativeTransferCalls(call)) : []
  const to = record.to
  const transferValue = record.value
  if (typeof to !== 'string' || !/^0x[0-9a-f]{40}$/i.test(to) || typeof transferValue !== 'string' || !/^0x[0-9a-f]+$/i.test(transferValue)) return calls
  return [{ to: to as `0x${string}`, value: BigInt(transferValue) }, ...calls]
}

export async function verifyNativeTransfer(source: ReceiptSource, expected: NativeTransferExpectation): Promise<ReceiptVerification> {
  const result: ReceiptVerification = {
    verified: false,
    chainId: expected.chainId,
    transactionHash: expected.transactionHash,
    recipientAddress: expected.recipientAddress,
    amountBaseUnits: expected.amountBaseUnits,
  }

  if (!isSupportedTestnetChainId(expected.chainId)) {
    return { ...result, reason: `unsupported receipt chain: ${expected.chainId}` }
  }
  if (!/^[0-9]+$/.test(expected.amountBaseUnits) || BigInt(expected.amountBaseUnits) <= 0n) {
    return { ...result, reason: 'amountBaseUnits must be a positive integer string' }
  }

  let sourceChainId: number
  let receipt: TransactionReceipt
  let transaction: Transaction
  try {
    sourceChainId = await source.getChainId()
    receipt = await source.getTransactionReceipt(expected.transactionHash)
    transaction = await source.getTransaction(expected.transactionHash)
  } catch (error) {
    return { ...result, reason: `receipt lookup failed: ${error instanceof Error ? error.message : 'unknown error'}` }
  }

  if (transaction.from !== undefined) result.sourceAddress = transaction.from

  if (sourceChainId !== expected.chainId) return { ...result, reason: `chain mismatch: source=${sourceChainId}, expected=${expected.chainId}` }
  if (transaction.chainId !== undefined && transaction.chainId !== expected.chainId) {
    return { ...result, reason: `transaction chain mismatch: tx=${transaction.chainId}, expected=${expected.chainId}` }
  }
  if (receipt.transactionHash.toLowerCase() !== expected.transactionHash.toLowerCase()) {
    return { ...result, reason: 'receipt transaction hash mismatch' }
  }
  if (receipt.status !== 'success') return { ...result, reason: `receipt status is ${receipt.status}` }
  const expectedValue = BigInt(expected.amountBaseUnits)
  const directTransferMatches = transaction.to !== null && transaction.to.toLowerCase() === expected.recipientAddress.toLowerCase() && transaction.value === expectedValue
  if (!directTransferMatches && source.getNativeTransferCalls !== undefined) {
    let calls: NativeTransferCall[]
    try {
      calls = await source.getNativeTransferCalls(expected.transactionHash)
    } catch (error) {
      return { ...result, reason: `transfer trace lookup failed: ${error instanceof Error ? error.message : 'unknown error'}` }
    }
    if (calls.some((call) => call.to.toLowerCase() === expected.recipientAddress.toLowerCase() && call.value === expectedValue)) {
      return { ...result, verified: true, blockNumber: receipt.blockNumber.toString() }
    }
  }
  if (transaction.to === null || transaction.to.toLowerCase() !== expected.recipientAddress.toLowerCase()) return { ...result, reason: 'recipient mismatch' }
  if (transaction.value !== expectedValue) return { ...result, reason: `value mismatch: observed=${transaction.value.toString()}, expected=${expected.amountBaseUnits}` }

  return { ...result, verified: true, blockNumber: receipt.blockNumber.toString() }
}
