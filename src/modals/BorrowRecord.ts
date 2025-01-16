import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { BorrowStatus } from '../types/evm'

dayjs.extend(utc)

export class BorrowRecord {
  constructor(records: any[]) {
    const _record = {
      borrower: (records?.[0] ?? '0x') as string,
      payer: (records?.[1] ?? '0x') as string,
      startTime: Number(records?.[2]?.toString?.() ?? '0'),
      endTime: Number(records?.[3]?.toString?.() ?? '0'),
      terminal: Number(records?.[4]?.toString?.() ?? '0'),
      interestRate: Number(records?.[5]?.toString?.() ?? '0'),
      _status: Number(records?.[6]?.toString?.()),
      pledgeAmount: records?.[7]?.toString?.() ?? '0',
      borrowAmount: records?.[9]?.toString?.() ?? '0',
      remainingBorrowed: records?.[8]?.toString?.() ?? '0', // Remaining borrowed
      interestFee: records?.[10]?.toString?.() ?? '0', // Interest Fee
      fee: records?.[11]?.toString?.() ?? '0', // Management fee
    }

    Object.assign(this, _record)
  }

  private _status: BorrowStatus = BorrowStatus.null // Billing: 0. Null 1.active 2.repay ended  3. Price declines are liquidated 4. Overdue liquidation -

  borrower: string = '0x' //  -
  payer: string = '0x' //  -
  startTime: number = 0 // Start time -
  endTime: number = 0 // Ended time -
  terminal: number = 0 //  Billing ended time -
  interestRate: number = 0 // APR -
  pledgeAmount: string = '0' // Pledged amount -
  borrowAmount: string = '0' // Borrowed amount -
  fee: string = '0' // Management fee
  interestFee: string = '0' // Interest fee
  remainingBorrowed: string = '0' // Remaining borrowing

  get status() {
    if (dayjs.utc().valueOf() >= this.endTime * 1000 && this._status === 1) {
      return BorrowStatus.matured
    }
    return this._status
  }

  get isRecordEnd() {
    return [
      BorrowStatus.liquidation,
      BorrowStatus.overdue,
      BorrowStatus.end,
    ].includes(this.status)
  }

  get isInLiquidation() {
    const day = dayjs.utc()
    const diff = day.diff(dayjs.utc(this.endTime * 1000), 'minutes')
    return !this.isRecordEnd && diff > 6
  }

  get remainingDays() {
    if (this.isRecordEnd) {
      return 0
    }
    const day = dayjs.utc()

    if (this.status === BorrowStatus.matured) {
      const t
          = dayjs.utc().diff(dayjs.utc(this.endTime * 1000), 'minutes') || 0
      return `${6 - (t < 0 ? 0 : t)}/6`
    }
    return dayjs.utc(this.endTime * 1000).diff(day, 'minutes')
  }
}
