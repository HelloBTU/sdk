import type { BorrowParams, IncreasePledge, LiquidationBorrowing, RedeemBitcoin, ReleaseBitcoin, RepayParams, UnstakeBitcoin } from '../types'
import { EvmApi } from './evm'

export class BTUApi {
  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl
  }

  rpcUrl!: string
  get client() {
    return new EvmApi(this.rpcUrl)
  }

  getTotalSupplyForBTCC(address: string) {
    return this.client.getTotalSupplyForBTCC(address)
  }

  getTotalSupplyForBTU(address: string) {
    return this.client.getTotalSupplyForBTU(address)
  }

  /**
   * Check bridge deposit status
   * @param contract Bridge contract address
   * @returns boolean
   */
  isDepositPaused(contract: string) {
    return this.client.isDepositPaused(contract)
  }

  /**
   * Get deposit bridge fee.
   * @param contract Bridge contract address
   * @returns bigint
   */
  depositFee(contract: string) {
    return this.client.depositFee(contract)
  }

  /**
   * Get minium withdraw amount
   * @param contract Bridge contract address
   * @returns bigint
   */
  miniumWithdrawAmount(contract: string) {
    return this.client.minWithdrawAmount(contract)
  }

  /**
   * Get maximum withdraw amount
   * @param contract Bridge contract address
   * @param address User address
   * @returns bigint
   */
  maximumWithdrawAmount(contract: string, address: string) {
    return this.client.maxWithdrawAmount(contract, address)
  }

  /**
   * Get withdraw bridge fee.
   * @param contract Bridge contract address
   * @returns bigint
   */
  withdrawFee(contract: string) {
    return this.client.withdrawFee(contract)
  }

  /**
   * Basic borrow info
   * @param address stableVault contract address
   * @returns BasicBorrowInfo
   */
  getBorrowInfo(address: string) {
    return this.client.getBaseBorrowInfo(address)
  }

  /**
   * Fetch all borrowing records for the current user
   *
   * @param contract stableVault contract address
   * @param address user address
   * @param isAll true: get all history, false: get current unclosed record
   * @returns BorrowRecord[]
   */
  getBorrowHistory(contract: string, address: string, isAll = false) {
    return this.client.getBorrowHistory(contract, address, isAll)
  }

  /**
   *
   * Fetch liquidation list
   * @param contract stableVault Contract address
   * @param start Start index
   * @param end  End index
   * @returns -{start: number, total: number, records: BorrowRecord[] }
   *
   */
  getLiquidationList(contract: string, start: number, end: number) {
    return this.client.getLiqRecord(contract, start, end)
  }

  /**
   * Calculate the BTCC received from liquidation given the BTU amout
   * @param contract  stableVault contract address
   * @param amount Remaining borrowed for BTU
   * @returns Receive BTCC amount
   */
  computeReceiveBTCCAmount(contract: string, amount: bigint) {
    return this.client.getLiquidationBTCCAmount(contract, amount)
  }

  /**
   * Withdraw staked BTC from an EVM-compatible chain.
   * @param params UnstakeBitcoin
   * @param params.contract Bridge contract address
   * @param params.address EVM address for refund after failure
   * @param params.recipient Bitcoin address for recipient
   * @param params.amount Unstake BTC amount
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  unstakeBitcoin(params: UnstakeBitcoin) {
    return this.client.unstake(params)
  }

  /**
   * Redeem BTC from an EVM-compatible chain.
   * @param params RedeemBitcoin
   * @param params.address BTCC contract address
   * @param params.amount Redeem BTC amount
   * @param params.recipient Bitcoin address for recipient
   * @param params.consumer Bridge contract address
   * @param params.provider  EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  redeemBitcoin(params: RedeemBitcoin) {
    return this.client.redeem(params)
  }

  /**
   * Release BTC from an EVM-compatible chain.
   * @param params ReleaseBitcoin
   * @param params.address Bridge contract address
   * @param params.amount  Release BTC amount
   * @param params.recipient Bitcoin address for recipient
   * @param params.provider  EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  releaseBitcoin(params: ReleaseBitcoin) {
    return this.client.release(params)
  }

  /**
   * Borrow BTU
   * @param params BorrowParams
   * @param params.address BTU contract address
   * @param params.amount Pledge amount; BTCC => BTU
   * @param params.date Maturity date
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  borrowBTU(params: BorrowParams) {
    return this.client.borrow(params)
  }

  /**
   * Repay BTU
   * @param params RepayParams
   * @param params.address BTU contract address
   * @param params.amount Repaying the borrowed BTU amount
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  repayBTU(params: RepayParams) {
    return this.client.repay(params)
  }

  /**
   * Increase BTCC collateral for borrowing
   * @param params IncreasePledge
   * @param params.address BTCC contract address
   * @param params.amount Increase BTCC amount
   * @param params.account User address
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  increaseBTCCForBorrowing(params: IncreasePledge) {
    return this.client.increaseBorrowPledge(params)
  }

  /**
   * Use the BTU to liquidation borrowing,The liquidator receives BTCC.
   * @param params LiquidationBorrowing
   * @param params.address BTU contract address
   * @param params.account Borrower account
   * @param params.provider EVM wallet provider, ethers.BrowserProvider
   * @returns ethers.TransactionResponse
   */
  liquidationBorrowing(params: LiquidationBorrowing) {
    return this.client.liquidationBorrowing(params)
  }
}
