export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
  M44_P2WPKH,
  M44_P2TR,
}

export enum NetworkType {
  MAINNET,
  TESTNET,
}

export enum RestoreWalletType {
  UNISAT,
  SPARROW,
  XVERSE,
  OTHERS,
}

export interface BitcoinBalance {
  confirm_amount: string
  pending_amount: string
  amount: string
  usd_value: string
}

export interface AddressAssets {
  total_btc: string
  satoshis?: number
  total_inscription: number
}

export interface TxHistoryItem {
  txid: string
  time: number
  date: string
  amount: string
  symbol: string
  address: string
}

export interface Inscription {
  inscriptionId: string
  inscriptionNumber: number
  address: string
  outputValue: number
  preview: string
  content: string
  contentType: string
  contentLength: number
  timestamp: number
  genesisTransaction: string
  location: string
  output: string
  offset: number
  contentBody: string
}

export interface InscriptionMintedItem {
  title: string
  desc: string
  inscriptions: Inscription[]
}

export interface InscriptionSummary {
  mintedList: InscriptionMintedItem[]
}

export interface AppInfo {
  logo: string
  title: string
  desc: string
  url: string
}

export interface AppSummary {
  apps: {
    tag: string
    list: AppInfo[]
  }[]
}

export interface FeeSummary {
  list: {
    title: string
    desc: string
    feeRate: number
  }[]
}

export interface UTXO {
  txid: string
  vout: number
  satoshis: number
  scriptPk: string
  addressType: AddressType
  ords: any[]
  atomicals: any[]
  inscriptions: {
    inscriptionId: string
    inscriptionNumber: number
    offset: number
  }[]
  runes: {
    runeid: string
    rune: string
    amount: string
  }[]
}

export enum TxType {
  SIGN_TX,
  SEND_BITCOIN,
  SEND_INSCRIPTION,
}

export interface ToSignInput {
  index: number
  publicKey: string
  sighashTypes?: number[]
}

export interface Account {
  type: string
  pubkey: string
  address: string
  brandName?: string
  alianName?: string
  displayBrandName?: string
  index?: number
  balance?: number
  key: string
}

export interface InscribeOrder {
  orderId: string
  payAddress: string
  totalFee: number
  minerFee: number
  originServiceFee: number
  serviceFee: number
  outputValue: number
}

export interface TokenBalance {
  availableBalance: string
  overallBalance: string
  ticker: string
  transferableBalance: string
  availableBalanceSafe: string
  availableBalanceUnSafe: string
}

export interface TokenInfo {
  totalSupply: string
  totalMinted: string
}

export enum TokenInscriptionType {
  INSCRIBE_TRANSFER,
  INSCRIBE_MINT,
}
export interface TokenTransfer {
  ticker: string
  amount: string
  inscriptionId: string
  inscriptionNumber: number
  timestamp: number
}

export interface AddressTokenSummary {
  tokenInfo: TokenInfo
  tokenBalance: TokenBalance
  historyList: TokenTransfer[]
  transferableList: TokenTransfer[]
}

export interface DecodedPsbt {
  inputInfos: {
    txid: string
    vout: number
    address: string
    value: number
    inscriptions: Inscription[]
    sighashType: number
  }[]
  outputInfos: {
    address: string
    value: number
    inscriptions: Inscription[]
  }[]
  feeRate: number
  fee: number
}

export interface ToAddressInfo {
  address: string
  domain?: string
  inscription?: Inscription
}

export interface RawTxInfo {
  psbtHex: string
  rawtx: string
  toAddressInfo?: ToAddressInfo
  fee?: number
}

export interface RuneInfo {
  runeid: string
  rune: string
  spacedRune: string
  number: number
  height: number
  txidx: number
  timestamp: number
  divisibility: number
  symbol: string
  etching: string
  premine: string
  terms: {
    amount: string
    cap: string
    heightStart: number
    heightEnd: number
    offsetStart: number
    offsetEnd: number
  }
  mints: string
  burned: string
  holders: number
  transactions: number
  mintable: boolean
  remaining: string
  start: number
  end: number
}

export interface RuneBalance {
  amount: string
  runeid: string
  rune: string
  spacedRune: string
  symbol: string
  divisibility: number
}

export interface AddressRunesTokenSummary {
  runeInfo: RuneInfo
  runeBalance: RuneBalance
}

export interface BitcoinStakeProps {
  address: string
  pubkey: string
  committee: string
  amount: string
  feeRate: number
  chainId: number
  recipient: string
  signer: {
    signPsbt: (psbt: string, options: {
      autoFinalized: boolean
      signInputs: {
        // Key: bitcoin address, Value: array of indexes
        [key: string]: number[]
      }
    }) => Promise<string>
  }
}
