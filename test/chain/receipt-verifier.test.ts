import { describe, expect, it } from 'vitest'
import { verifyNativeTransfer, type ReceiptSource } from '../../src/chain/receipt-verifier.js'

const hash = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`
const recipient = '0x1111111111111111111111111111111111111111' as `0x${string}`

function source(overrides: Partial<Awaited<ReturnType<ReceiptSource['getTransaction']>>> & { receiptStatus?: 'success' | 'reverted'; chainId?: number } = {}): ReceiptSource {
  return {
    getChainId: async () => overrides.chainId ?? 84532,
    getTransactionReceipt: async () => ({ status: overrides.receiptStatus ?? 'success', transactionHash: hash, blockNumber: 123n }),
    getTransaction: async () => ({ to: overrides.to ?? recipient, value: overrides.value ?? 1000000000000000n, chainId: overrides.chainId ?? 84532 }),
  }
}

describe('verifyNativeTransfer', () => {
  it('accepts a matching successful native transfer', async () => {
    const result = await verifyNativeTransfer(source(), { chainId: 84532, recipientAddress: recipient, amountBaseUnits: '1000000000000000', transactionHash: hash })
    expect(result).toMatchObject({ verified: true, blockNumber: '123' })
  })

  it('fails closed for a reverted receipt', async () => {
    const result = await verifyNativeTransfer(source({ receiptStatus: 'reverted' }), { chainId: 84532, recipientAddress: recipient, amountBaseUnits: '1000000000000000', transactionHash: hash })
    expect(result).toMatchObject({ verified: false, reason: 'receipt status is reverted' })
  })

  it('rejects wrong recipient and value', async () => {
    const wrongRecipient = await verifyNativeTransfer(source({ to: '0x2222222222222222222222222222222222222222' as `0x${string}` }), { chainId: 84532, recipientAddress: recipient, amountBaseUnits: '1000000000000000', transactionHash: hash })
    const wrongValue = await verifyNativeTransfer(source({ value: 2n }), { chainId: 84532, recipientAddress: recipient, amountBaseUnits: '1000000000000000', transactionHash: hash })
    expect(wrongRecipient.reason).toBe('recipient mismatch')
    expect(wrongValue.reason).toContain('value mismatch')
  })

  it('rejects a chain mismatch', async () => {
    const result = await verifyNativeTransfer(source({ chainId: 11155111 }), { chainId: 84532, recipientAddress: recipient, amountBaseUnits: '1000000000000000', transactionHash: hash })
    expect(result).toMatchObject({ verified: false, reason: 'chain mismatch: source=11155111, expected=84532' })
  })
})
