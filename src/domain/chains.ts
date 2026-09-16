export const SUPPORTED_TESTNET_CHAIN_IDS = [84532, 11155111] as const
export type SupportedTestnetChainId = (typeof SUPPORTED_TESTNET_CHAIN_IDS)[number]

export function isSupportedTestnetChainId(chainId: number): chainId is SupportedTestnetChainId {
  return (SUPPORTED_TESTNET_CHAIN_IDS as readonly number[]).includes(chainId)
}
