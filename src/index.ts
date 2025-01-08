import type { BitcoinNetwork } from './bitcoin'
import type { BitcoinStakeProps } from './types/bitcoin'
import { BitcoinClient } from './bitcoin'

/**
 * Stake bitcoin
 * @param network Bitcoin network ('mainnet' | 'testnet')
 * @param stakeProps.address Bitcoin address to stake from
 * @param stakeProps.pubkey Public key of the bticoin address
 * @param stakeProps.committee Committee address
 * @param stakeProps.amount Amount of BTC to stake (in satoshis)
 * @param stakeProps.feeRate Bitcoin transaction fee rate (in sat/vB)
 * @param stakeProps.chainId Destination chain ID to receive staked assets
 * @param stakeProps.recipient Recipient address on the destination chain
 * @param stakeProps.signer Bitcoin wallet provider for transaction signing
 * @returns Transaction hash
 */
export function stakeBitcoin(network: BitcoinNetwork, stakeProps: BitcoinStakeProps) {
  const client = new BitcoinClient(network)
  return client.bridge(stakeProps)
}
