import type { BitcoinNetwork } from './bitcoin'
import { BRIDGE_CONFIG } from './config'

const BACKEND_API_CONFIG: {
  [key in BitcoinNetwork]: { network: string, url: string }
} = {
  bitcoin: {
    network: 'btc',
    url: 'https://api.boolscan.com/bit-stable/',
  },
  bitcoin_testnet: {
    network: 'btc_testnet',
    url: 'https://test-api.boolscan.com/bit-stable/',
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
    headers.append('accept-language', 'en-US')
    const response = await fetch(new Request(url), {
      method: 'GET',
      headers,
      mode: 'cors',
    }) as any
    const data = await response.json()
    if (data.code !== '000') {
      throw new Error(data.msg || 'Network error')
    }
    else {
      return data.data
    }
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
    if (data.code !== '000') {
      throw new Error(data.msg || 'Network error')
    }
    else {
      return data.data
    }
  }

  /**
   * Get PRO status
   * @param address User bitcoin wallet address.
   * @return
   */
  getProInfo(address: string) {
    const result = this.httpGet('/dict/dict', { dictID: address })
    if (result.code === '105.bit-stable.DICT_NOT_FOUND') {
      return {
        fee: this.config.feeAddress,
      }
    }
  }
}
