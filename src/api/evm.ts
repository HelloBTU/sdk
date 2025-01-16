import type { BasicBorrowInfo, BorrowParams, IncreasePledge, LiquidationBorrowing, RedeemBitcoin, ReleaseBitcoin, RepayParams, UnstakeBitcoin } from '../types'
import { Buffer } from 'node:buffer'
import {
  Contract,
  formatEther,
  JsonRpcProvider,
} from 'ethers'
import { BORROW_ABI, BRIDGE_ABI, BTCC_ABI, BTU_ABI, ERC20_ABI } from '../abi'
import { BorrowRecord } from '../modals/BorrowRecord'
import { BitcoinAddressType } from '../types/bitcoin'
import { ORIGIN_TOKEN } from '../utils/constants'

export class EvmApi {
  readonly rpc

  constructor(rpc: string) {
    this.rpc = rpc
  }

  get provider() {
    return new JsonRpcProvider(this.rpc)
  }

  /**
   * Get token balance
   * @returns balance
   */
  async getTokenBalance({
    address,
    contractAddress,
  }: {
    address: string
    contractAddress?: string
  }): Promise<bigint> {
    if (
      !contractAddress
      || contractAddress.toLowerCase() === ORIGIN_TOKEN.toLowerCase()
    ) {
      const balance = await this.provider.getBalance(address)
      return balance
    }
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )

    const balance = await erc20Contract.balanceOf!(address)
    return balance
  }

  /**
   * Check bridge deposit status
   * @param contractAddress contract address
   * @returns boolean
   */
  async isDepositPaused(contractAddress: string): Promise<boolean> {
    const bridgeContract = new Contract(
      contractAddress,
      BRIDGE_ABI,
      this.provider,
    )
    return await bridgeContract.paused!(0)
  }

  /**
   * Get deposit bridge fee.
   * @param contractAddress
   * @returns bigint
   */
  async depositFee(contractAddress: string): Promise<bigint> {
    const bridgeContract = new Contract(
      contractAddress,
      BRIDGE_ABI,
      this.provider,
    )
    return await bridgeContract.depositFee!()
  }

  /**
   * Get withdraw bridge fee.
   * @param contractAddress
   * @returns bigint
   */
  async withdrawFee(contractAddress: string): Promise<bigint> {
    const bridgeContract = new Contract(
      contractAddress,
      BRIDGE_ABI,
      this.provider,
    )
    const formattedAddress = EvmApi.formatBitcoinAddress(
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    )
    const result = await bridgeContract.getTotalWithdrawFee!(
      0,
      formattedAddress,
    )
    return result[0]
  }

  /**
   * Get min withdraw amount
   * @param contractAddress
   * @returns bigint
   */
  async minWithdrawAmount(contractAddress: string): Promise<bigint> {
    const bridgeContract = new Contract(
      contractAddress,
      BRIDGE_ABI,
      this.provider,
    )
    return await bridgeContract.minWithdrawAmount!()
  }

  /**
   * Get max withdraw amount
   * @param contractAddress
   * @returns bigint
   */
  async maxWithdrawAmount(
    contractAddress: string,
    address: string,
  ): Promise<bigint> {
    const bridgeContract = new Contract(
      contractAddress,
      BRIDGE_ABI,
      this.provider,
    )
    const result = await bridgeContract.depositMap!(address)
    return result
  }

  /**
   * Withdraw BTC from an EVM-compatible chain.
   * @param params UnstakeBitcoin
   * @param params.contract Bridge contract address
   * @param params.address EVM address for refund after failure
   * @param params.recipient Bitcoin address for recipient
   * @param params.amount Unstake amount
   * @param params.provider Evm wallet provider
   * @returns TransactionResponse
   */
  async unstake(params: UnstakeBitcoin) {
    const {
      contract,
      recipient,
      address,
      amount,
      provider,
    } = params

    const bridgeContract = new Contract(contract, BRIDGE_ABI, this.provider)
    const formattedAddress = EvmApi.formatBitcoinAddress(recipient)

    const amountLimit = await bridgeContract.minWithdrawAmount!()
    const fee = await bridgeContract.getTotalWithdrawFee!(
      amount,
      formattedAddress,
    )
    if (amount < amountLimit) {
      throw new Error(
        `The amount is too small. The minimum amount is ${formatEther(
          amountLimit,
        )} BTCC.`,
      )
    }

    const _signer = await provider.getSigner()
    const data = await bridgeContract
      .getFunction('withdraw')
      .populateTransaction(amount, formattedAddress, address, {
        value: fee[0],
      })
    await this.provider.estimateGas({ ...data, from: _signer.address })
    return await _signer.sendTransaction(data)
  }

  /**
   * Release BTC from an EVM-compatible chain.
   * @param params
   * @param params.address Bridge contract address
   * @param params.amount  Release BTC amount
   * @param params.recipient Bitcoin address for recipient
   * @param params.provider  EVM wallet provider, ethers.BrowserProvider
   * @returns TransactionResponse
   */
  async release(params: ReleaseBitcoin) {
    const {
      address,
      amount,
      provider,
      recipient,
    } = params

    const bridgeContract = new Contract(address, BRIDGE_ABI, this.provider)
    const formattedAddress = EvmApi.formatBitcoinAddress(recipient)

    const signer = await provider.getSigner()
    const data = await bridgeContract
      .getFunction('release')
      .populateTransaction(amount, formattedAddress)
    await this.provider.estimateGas({ ...data, from: signer.address })
    return await signer.sendTransaction(data)
  }

  /**
   * Redeem staked BTC from an EVM-compatible chain.
   * @param params
   * @param params.address BTCC contract address
   * @param params.amount Redeem BTC amount
   * @param params.recipient Bitcoin address for recipient
   * @param params.consumer Bridge contract address
   * @param params.provider  EVM wallet provider, ethers.BrowserProvider
   * @returns TransactionResponse
   */
  async redeem(params: RedeemBitcoin) {
    const {
      address,
      amount,
      recipient,
      consumer,
      provider,
    } = params

    const bridgeContract = new Contract(consumer, BRIDGE_ABI, this.provider)
    const btccContract = new Contract(address, BTCC_ABI, this.provider)
    const formattedAddress = EvmApi.formatBitcoinAddress(recipient)

    const fee = await bridgeContract.getTotalWithdrawFee!(
      amount,
      formattedAddress,
    )
    const signer = await provider.getSigner()
    const data = await btccContract
      .getFunction('withdraw')
      .populateTransaction(amount, formattedAddress, { value: fee[0] })

    await this.provider.estimateGas({ ...data, from: signer.address })
    return await signer.sendTransaction(data)
  }

  /**
   * Borrow BTU
   * @param params
   * @param params.address BTU contract address
   * @param params.amount Pledge amount; BTCC => BTU
   * @param params.date Maturity date; seconds
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  async borrow(params: BorrowParams) {
    const {
      address,
      amount,
      date,
      provider,
    } = params
    const contract = new Contract(address, BTCC_ABI, this.provider)
    const signer = await provider.getSigner()

    const data = await contract
      .getFunction('deposit')
      .populateTransaction(amount, date)

    await this.provider.estimateGas({ ...data, from: signer.address })
    return await signer.sendTransaction(data)
  }

  /**
   * Repay BTU
   * @param params
   * @param params.address BTU contract address
   * @param params.amount Repaying the borrowed BTU amount
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  async repay(params: RepayParams) {
    const {
      address,
      amount,
      provider,
    } = params
    const contract = new Contract(address, BTU_ABI, this.provider)
    const signer = await provider.getSigner()

    const data = await contract
      .getFunction('withdraw')
      .populateTransaction(amount)
    await this.provider.estimateGas({ ...data, from: signer.address })
    return await signer.sendTransaction(data)
  }

  /**
   * Increase BTCC collateral for borrowing
   * @param params
   * @param params.address BTCC contract address
   * @param params.amount Increase BTCC amount
   * @param params.account user address
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  async increaseBorrowPledge(params: IncreasePledge) {
    const {
      address,
      provider,
      account,
      amount,
    } = params
    const contract = new Contract(address, BTCC_ABI, this.provider)
    const signer = await provider.getSigner()

    const data = await contract
      .getFunction('inc')
      .populateTransaction(account, amount)

    await this.provider.estimateGas({ ...data, from: signer.address })
    return await signer.sendTransaction(data)
  }

  /**
   *
   * Use the BTU to liquidation borrowing,The liquidator receives BTCC.
   * @param params
   * @param params.address BTU contract address
   * @param params.account Borrower account
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  async liquidationBorrowing(params: LiquidationBorrowing) {
    const {
      address,
      provider,
      account,
    } = params
    const contract = new Contract(address, BTU_ABI, this.provider)
    const signer = await provider.getSigner()

    const data = await contract
      .getFunction('liquidate')
      .populateTransaction(account)

    await this.provider.estimateGas({ ...data, from: signer.address })
    return await signer.sendTransaction(data)
  }

  /**
   * Basic borrow info
   * @param address stableVault contract address
   * @returns BasicBorrowInfo
   */
  async getBaseBorrowInfo(address: string): Promise<BasicBorrowInfo> {
    const contract = new Contract(address, BORROW_ABI, this.provider)

    // const ltvRate = await contract.getLtvRate?.();
    // const liquidationRate = await contract.getLiqRate?.();
    // const interestRate = await contract.getInterestRate?.();
    const allRate = await contract.getAllRate?.()
    const price = await contract.getPrice?.()
    const fee = await contract.fee?.()

    // console.log(ltvRate, interestRate, liquidationRate, price.toString());
    return {
      ltvRate: Number(allRate?.[0]?.toString?.() ?? 0) / 10000 || 1.5,
      liquidationRate: Number(allRate?.[1]?.toString?.() ?? 0) / 10000 || 1.2,
      interestRate: Number(allRate?.[2]?.toString?.() ?? 0) / 10000 || 0.02,
      price: price?.toString?.() || '0',
      fee: fee.toString(),
    }
  }

  /**
   *
   * @param address stableVault contract address
   * @returns BorrowRecord
   */
  async getBorrowRecord(
    address: string,
    index: number,
  ): Promise<BorrowRecord> {
    const contract = new Contract(address, BORROW_ABI, this.provider)
    const res = await contract.getRecord?.(index)
    return new BorrowRecord(res)
  }

  /**
   * Fetch all borrowing records for the current user
   * @param contract stableVault contract address
   * @param address user address
   * @param isAll true: get all history, false: get current unclosed record
   * @returns BorrowRecord[]
   */
  async getBorrowHistory(contract: string, address: string, isAll = false,
  ): Promise<BorrowRecord[]> {
    const borrowContract = new Contract(contract, BORROW_ABI, this.provider)

    const indexList: number[] = []
    if (isAll) {
      const liquidateIndex = await borrowContract.getRecordLiquidationHistoryIndex?.(
        address,
      )

      if (liquidateIndex && (liquidateIndex?.toArray()?.length ?? 0) > 0) {
        liquidateIndex.toArray().forEach((i: string) => {
          indexList.push(Number(i) - 1)
        })
      }

      const historyIndex = await borrowContract.getRecordHistoryIndex?.(address)

      if (historyIndex && (historyIndex?.toArray()?.length ?? 0) > 0) {
        historyIndex.toArray().forEach((i: string) => {
          if (!indexList.includes(Number(i) - 1)) {
            indexList.push(Number(i) - 1)
          }
        })
      }
    }
    else {
      const unclosedRecordIndex = await borrowContract.getRecordIndex?.(address)
      const i = Number(unclosedRecordIndex.toString?.() ?? '0')

      if (i > 0) {
        indexList.push(i - 1)
      }
    }

    const records = await Promise.all(
      indexList
        .reverse()
        .map(i => this.getBorrowRecord(address, i)),
    )

    return records.filter(item => !item.isInLiquidation)
  }

  /**
   * Calculate the BTCC received from liquidation given the BTU amout
   * @param contract  stableVault contract address
   * @param num Remaining borrowed for BTU
   * @returns Receive BTCC amount
   */
  async getLiquidationBTCCAmount(contract: string, num: bigint) {
    const borrowContract = new Contract(contract, BORROW_ABI, this.provider)
    const amount = await borrowContract.getliqdationBTCCAmount?.(num)

    return amount?.toString?.() ?? ''
  }

  /**
   *
   * Fetch liquidation record
   *
   * @param contract stableVault Contract address
   * @param start Start index
   * @param end  End index
   * @returns -{start: number, total: number, records: BorrowRecord[] }
   *
   */
  async getLiqRecord(
    contract: string,
    start: number,
    end: number,
  ): Promise<{ start: number, total: number, records: BorrowRecord[] }> {
    const borrowContract = new Contract(contract, BORROW_ABI, this.provider)
    const res = await borrowContract.getliqRecord?.(start, end)
    const records = (res?.[1]?.toArray?.() ?? []) as any[]

    return {
      start,
      total: Number(res?.[0] ?? 0),
      records: records.map((item: any[]) => {
        return new BorrowRecord(item)
      }),
    }
  }

  static formatBitcoinAddress = (address: string) => {
    const padding = 63 - address.length
    const buffer = Buffer.alloc(padding).fill(0)
    const addressBuffer = Buffer.from(address, 'utf8')
    // let type = 'p2pkh'
    let type = BitcoinAddressType.p2pkh

    if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
      type = BitcoinAddressType.p2tr
    }
    else if (address.startsWith('bc1q') || address.startsWith('tb1q')) {
      type = BitcoinAddressType.p2wpkh
    }
    else if (address.indexOf('2') === 0 || address.indexOf('3') === 0) {
      type = BitcoinAddressType.p2sh
    }

    return (
      `0x${
        Buffer.concat([Buffer.from([type!]), buffer, addressBuffer]).toString(
          'hex',
        )}`
    )
  }

  async addTokenToWallet(address: string, provider: any) {
    const contract = new Contract(address, ERC20_ABI, this.provider)

    const decimals = await contract.decimals?.()
    const symbol = await contract.symbol?.()

    await provider // Or window.ethereum if you don't support EIP-6963.
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: symbol.toString(),
            decimals: Number(decimals.toString()),
            image: '',
          },
        },
      })
  }

  async getTotalSupplyForBTCC(address: string) {
    const contract = new Contract(address, BTCC_ABI, this.provider)
    return await contract.totalSupply!()
  }

  async getTotalSupplyForBTU(address: string) {
    const contract = new Contract(address, BTU_ABI, this.provider)
    return await contract.totalSupply!()
  }
}
