import type { BrowserProvider } from 'ethers'

export enum BorrowStatus {
  null,
  activate,
  end,
  overdue,
  liquidation,
  matured,
}

export interface UnstakeBitcoin {
  contract: string
  address: string
  recipient: string
  amount: bigint
  provider: BrowserProvider
}

export interface RedeemBitcoin {
  address: string
  amount: bigint
  recipient: string
  consumer: string
  provider: BrowserProvider
}

export interface ReleaseBitcoin {
  address: string
  amount: bigint
  recipient: string
  provider: BrowserProvider
}

export interface BorrowParams {
  address: string
  amount: bigint
  date: number
  provider: BrowserProvider
}

export interface RepayParams {
  address: string
  amount: bigint
  provider: BrowserProvider
}

export interface IncreasePledge {
  address: string
  amount: bigint
  account: string
  provider: BrowserProvider
}

export interface LiquidationBorrowing {
  address: string
  account: string
  provider: BrowserProvider
}

export interface BasicBorrowInfo {
  ltvRate: number // Borrow rate, default 1.5, borrowAmount = pledgePrice / ltvRate
  liquidationRate: number // Liquidation rate, default 1.2, x > liquidationRate
  interestRate: number // Interest rate
  price: string // The pledge token price
  fee: string // Management fee
}
