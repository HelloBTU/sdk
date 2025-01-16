import type {
  BitcoinStakeProps,
  FeeSummary,
  UTXO,
} from '../types/bitcoin'
import {
  createSendMultiBTC,
} from '@safematrix/ord-utils'
import BN from 'bignumber.js'
import { networks } from 'bitcoinjs-lib'

enum API_STATUS {
  FAILED = 'error',
  SUCCESS = 'ok',
}

export type BitcoinNetwork = 'bitcoin' | 'bitcoin_testnet'

const BITCOIN_API_CONFIG: {
  [key in BitcoinNetwork]: { network: string, url: string }
} = {
  bitcoin: {
    network: 'btc',
    url: 'https://wallet-api.unisat.io/v5',
  },
  bitcoin_testnet: {
    network: 'btc_testnet',
    url: 'https://wallet-api-testnet.unisat.io/v5',
  },
}

export class BitcoinClient {
  public network
  private host
  constructor(network: BitcoinNetwork) {
    this.network = network
    this.host = BITCOIN_API_CONFIG[this.network].url
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
    headers.append('X-Client', 'UniSat Wallet')
    headers.append('X-Version', '1.3.1')
    const response = await fetch(new Request(url), {
      method: 'GET',
      headers,
      mode: 'cors',
    })
    const data = await response.json()
    return data
  }

  httpPost = async (route: string, parameters: any) => {
    const url = this.host + route
    const headers = new Headers()
    headers.append('X-Client', 'UniSat Wallet')
    headers.append('X-Version', '1.1.19')
    headers.append('Content-Type', 'application/json;charset=utf-8')
    const response = await fetch(new Request(url), {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify(parameters),
    })
    const data = await response.json()
    return data
  }

  async getAddressBalance(address: string): Promise<string> {
    const data = await this.httpGet('/address/balance', {
      address,
    }) as {
      msg: API_STATUS
      message?: string
      data: {
        btc_amount: string
      }
    }
    if (data.msg === API_STATUS.FAILED) {
      throw new Error(data.message)
    }
    return BN(data.data.btc_amount).multipliedBy(1e8).toString()
  }

  async getAddressUtxo(address: string): Promise<UTXO[]> {
    const data = await this.httpGet('/address/btc-utxo', {
      address,
    }) as {
      msg: API_STATUS
      message?: string
      data: UTXO[]
    }
    if (data.msg === API_STATUS.FAILED) {
      throw new Error(data.message)
    }
    return data.data
  }

  async pushTx(rawtx: string): Promise<string> {
    const data = await this.httpPost('/tx/broadcast', {
      rawtx,
    }) as {
      msg?: string
      code: number
      data: string
    }
    if (data.code === -1) {
      throw new Error(data.msg)
    }
    return data.data
  }

  async getFeeSummary(): Promise<FeeSummary> {
    const data = await this.httpGet('/default/fee-summary', {}) as {
      msg: API_STATUS
      message?: string
      data: FeeSummary
    }
    if (data.msg === API_STATUS.FAILED) {
      throw new Error(data.message || 'Failed to get fee summary')
    }
    return data.data
  }

  generateBitcoinData = ({
    chainId,
    address,
  }: {
    chainId: number
    address: string
  }): string => {
    const _chainId = chainId.toString(16).padStart(8, '0')
    const fullAddress = address.startsWith('0x')
      ? address.slice(2).padStart(64, '0')
      : address.padStart(64, '0')
    return _chainId + fullAddress
  }

  async bridge({
    address,
    pubkey,
    committee,
    amount,
    feeRate,
    chainId,
    recipient,
    signer,
  }: BitcoinStakeProps): Promise<string> {
    const utxos = await this.getAddressUtxo(address)
    const data = this.generateBitcoinData(
      {
        chainId,
        address: recipient,
      },
    )
    const params = {
      /// Filter out utxos that have ords or atomicals
      utxos: utxos
        .filter((v) => {
          return v.inscriptions.length === 0 && v.atomicals.length === 0
        })
        .map(v => ({
          txId: v.txid,
          outputIndex: v.vout,
          satoshis: v.satoshis,
          scriptPk: v.scriptPk,
          addressType: v.addressType,
          address,
          pubkey: pubkey!,
          ords: [],
        })),
      receivers: [
        {
          address: committee,
          amount: Number(amount),
        },
      ],
      wallet: signer,
      changeAddress: address,
      receiverToPayFee: false,
      feeRate,
      dump: true,
      network:
        this.network === 'bitcoin'
          ? networks.bitcoin
          : networks.testnet,
      data,
    }
    const psbt = await createSendMultiBTC(params)
    const tx = psbt.extractTransaction(false)
    const hash = await this.pushTx(tx.toHex())
    return hash
  }
}
