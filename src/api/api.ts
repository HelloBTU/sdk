import type { BitcoinNetwork } from './bitcoin'
import { BRIDGE_CONFIG, VERSION } from '../utils/config'

const BACKEND_API_CONFIG: {
  [key in BitcoinNetwork]: { network: string, url: string }
} = {
  bitcoin: {
    network: 'btc',
    url: 'https://api.boolscan.com/bit-stable',
  },
  bitcoin_testnet: {
    network: 'btc_testnet',
    url: 'https://test-api.boolscan.com/bit-stable',
  },
}

export class BackendApi {
  public network
  private host
  private config
  constructor(network: BitcoinNetwork) {
    this.network = network
    this.host = BACKEND_API_CONFIG[this.network].url
    this.config = BRIDGE_CONFIG[this.network]
  }

  httpGet = async (route: string, parameters: any) => {
    let url = this.host + route
    let c = 0
    for (const id in parameters) {
      url += c === 0 ? '?' : '&'
      url += `${id}=${parameters[id]}`
      c++
    }
    const headers = new Headers()
    headers.append('Content-Type', 'application/json;charset=utf-8')
    headers.append('accept-language', 'en-US')
    const response = await fetch(new Request(url), {
      method: 'GET',
      headers,
      mode: 'cors',
    }) as any
    const data = await response.json()
    return data
  }

  httpPost = async (route: string, parameters: any) => {
    const url = this.host + route
    const headers = new Headers()
    headers.append('Content-Type', 'application/json;charset=utf-8')
    headers.append('accept-language', 'en-US')
    const response = await fetch(new Request(url), {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify(parameters),
    }) as any
    const data = await response.json()
    return data
  }

  /**
   * Get PRO info
   * @param address User bitcoin wallet address.
   * @returns {Promise<{
   *   feeAddress: string,
   *   fee: number,
   *   committee: string,
   *   consumer: string,
   *   isPro: 'none' | 'processing' | 'completed' # PRO status, none: basic user, processing: upgrading to PRO, completed: PRO user
   * }>} Pro status information
   */
  async getProInfo(address: string): Promise<{
    feeAddress: string
    fee: number
    committee: string
    consumer: string
    isPro: 'none' | 'processing' | 'completed'
  }> {
    const result = await this.httpGet('/dict/dict', { dictID: address, version: VERSION }) as any
    if (result.code === '105.bit-stable.DICT_NOT_FOUND') {
      return {
        feeAddress: this.config.feeAddress,
        fee: this.config.fee,
        committee: this.config.committee,
        consumer: this.config.consumer,
        isPro: 'none',
      }
    }
    else if (result.data.status === 'END') {
      const info = JSON.parse(result.data.dictContent)
      return {
        feeAddress: this.config.feeAddress,
        fee: this.config.fee,
        committee: info.committee,
        consumer: info.consumer,
        isPro: 'completed',
      }
    }
    else {
      return {
        feeAddress: this.config.feeAddress,
        fee: this.config.fee,
        committee: this.config.committee,
        consumer: this.config.consumer,
        isPro: 'processing',
      }
    }
  }

  /**
   * Upgrade to PRO
   * @param props
   * @param props.address User bitcoin address
   * @param props.pubkey User bitcoin address pubkey
   */
  async upgradeToPro({ address, pubkey }: { address: string, pubkey: string }) {
    const result = await this.httpPost('/dict/dict', { dictID: address, pubkey, dictContent: JSON.stringify({}) }) as any
    if (result.code === '000') {
      return result.data
    }
    else {
      throw new Error(result.msg || 'Network error')
    }
  }
}
