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
  to: `0x${string}` | null
  value: bigint
  chainId?: number
}

type RpcClient = {
  getChainId: () => Promise<number>
  getTransactionReceipt: (args: { hash: Hash }) => Promise<TransactionReceipt>
  getTransaction: (args: { hash: Hash }) => Promise<Transaction>
}

export type ReceiptSource = {
  getChainId: () => Promise<number>
  getTransactionReceipt: (hash: Hash) => Promise<TransactionReceipt>
  getTransaction: (hash: Hash) => Promise<Transaction>
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
      to: transaction.to,
      value: transaction.value,
      ...(transaction.chainId === undefined ? {} : { chainId: transaction.chainId }),
    }
  }
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

  if (sourceChainId !== expected.chainId) return { ...result, reason: `chain mismatch: source=${sourceChainId}, expected=${expected.chainId}` }
  if (transaction.chainId !== undefined && transaction.chainId !== expected.chainId) {
    return { ...result, reason: `transaction chain mismatch: tx=${transaction.chainId}, expected=${expected.chainId}` }
  }
  if (receipt.transactionHash.toLowerCase() !== expected.transactionHash.toLowerCase()) {
    return { ...result, reason: 'receipt transaction hash mismatch' }
  }
  if (receipt.status !== 'success') return { ...result, reason: `receipt status is ${receipt.status}` }
  if (transaction.to === null || transaction.to.toLowerCase() !== expected.recipientAddress.toLowerCase()) {
    return { ...result, reason: 'recipient mismatch' }
  }
  if (transaction.value !== BigInt(expected.amountBaseUnits)) {
    return { ...result, reason: `value mismatch: observed=${transaction.value.toString()}, expected=${expected.amountBaseUnits}` }
  }

  return { ...result, verified: true, blockNumber: receipt.blockNumber.toString() }
}
