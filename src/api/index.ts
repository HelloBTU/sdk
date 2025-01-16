import type { BitcoinStakeProps } from '../types/bitcoin'
import type { BitcoinNetwork } from './bitcoin'
import { BackendApi } from './api'
import { BitcoinClient } from './bitcoin'
import { BTUApi as _BTUApi } from './btu_api'

export const BTUApi = _BTUApi

/**
 * Stake bitcoin
 * @param network Bitcoin network ('mainnet' | 'testnet')
 * @param stakeProps
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

/**
 * Get pro information
 * @param network Bitcoin network ('mainnet' | 'testnet')
 * @param address Bitcoin address to stake from
 * @returns Pro information
 */
export function getProInfo(network: BitcoinNetwork, address: string) {
  const client = new BackendApi(network)
  return client.getProInfo(address)
}

/**
 * Upgrade to PRO
 * @param network Bitcoin network ('mainnet' | 'testnet')
 * @param props
 * @param props.address Bitcoin address to upgrade
 * @param props.pubkey Bitcoin pubkey to upgrade
 * @returns any
 */
export function upgradeToPro(network: BitcoinNetwork, props: { address: string, pubkey: string }) {
  const client = new BackendApi(network)
  return client.upgradeToPro(props)
}
