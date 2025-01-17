# @hellobtu/sdk

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

# Hello BTU Library

A TypeScript library for HelloBTU protocol.

## Getting Started

### Installation

```bash
npm install @hellobtu/sdk
# or
yarn add @hellobtu/sdk
```

### Prerequisites

1. Download the required WASM file:
   - Get [secp256k1.wasm](./assets/secp256k1.wasm)
   - Place it in your project's `public/` directory

## Basic Usage

### 1. Check User's PRO Status
```typescript
import { getProInfo } from '@hellobtu/sdk'

// Check if a Bitcoin address is PRO
const info = await getProInfo('bitcoin_testnet', 'tb1q...')
console.log(info)
// Returns:
// {
//   feeAddress: string,
//   fee: number,
//   committee: string,
//   consumer: string,
//   isPro: 'none' | 'processing' | 'completed'
// }
```

### 2. Upgrade to PRO Status

Note: You must first send the required fee to the `feeAddress` before calling this function.

```typescript
import { upgradeToPro } from '@hellobtu/sdk'

// Upgrade a Bitcoin address to PRO status
const result = await upgradeToPro('bitcoin_testnet', 'tb1q...')
```

### 3. Stake Bitcoin
```typescript
import { stakeBitcoin } from '@hellobtu/sdk'

// Configure staking parameters
const stakeProps = {
  // Your Bitcoin address
  address: 'tb1q...',

  // Your Bitcoin public key
  pubkey: '02...',

  // Committee address to stake to
  committee: 'tb1q...',

  // Amount to stake (in satoshis)
  amount: '1000000',

  // Transaction fee rate (in sat/vB)
  feeRate: 5,

  // Destination chain ID (e.g., 11155111 for Sepolia testnet)
  chainId: 11155111,

  // Recipient address on the destination chain
  recipient: '0x...',

  // Your wallet provider (must implement signPsbt)
  signer: walletProvider
}

// Execute staking transaction
const txHash = await stakeBitcoin('bitcoin_testnet', stakeProps)
console.log('Staking Transaction Hash:', txHash)
```

### 4. BTUApi for EVM chain

- #### Below are query functions on BUTApi
```typescript
import { BTUApi } from '@hellobtu/sdk'

// Example
const btuApi = new BUTApi('chain_rpc_url')

await btuApi.getTotalSupplyForBTCC(token_contract_address)

await btuApi.getTotalSupplyForBTU(token_contract_address)

//  Check channel deposit status
await btuApi.isDepositPaused(channel_contract_address)

// Get deposit channel fee.
await btuApi.depositFee(channel_contract_address)

// Get minium withdraw amount
await btuApi.miniumWithdrawAmount(channel_contract_address)

// Get maximum withdraw amount
await btuApi.maximumWithdrawAmount(channel_contract_address, user_address)

// Get withdraw channel fee.
await btuApi.withdrawFee(channel_contract_address)

// Basic borrow info
await btuApi.getBorrowInfo(stableVault_contract)

/**
 * Fetch all borrowing records for the current user
 * @param contract stableVault contract address
 * @param address user address
 * @param isAll true: get all history, false: get current unclosed record
 * @returns BorrowRecord[]
 */
await btuApi.getBorrowHistory(stableVault_contract, user_address, isAll)

/**
 * Fetch liquidation list
 * @param contract stableVault Contract address
 * @param start Start index
 * @param end  End index
 * @returns -{start: number, total: number, records: BorrowRecord[] }
 */
await btuApi.getLiquidationList(stableVault_contract, start_index, end_index)

/**
 * Calculate the BTCC received from liquidation given the BTU amout
 * @param contract  stableVault contract address
 * @param amount Remaining borrowed for BTU
 * @returns Receive BTCC amount
 */
await btuApi.computeReceiveBTCCAmount(stableVault_contract, BTU_amount, receive_BTCC)
```

- #### Below are operations on BTUApi
```typescript
import { BTUApi } from '@hellobtu/sdk'

// Example
const btuApi = new BUTApi('chain_rpc_url')

/**
 * Withdraw staked BTC from an EVM-compatible chain.
 * @param params UnstakeBitcoin
 * @param params.contract Channel contract address
 * @param params.address EVM address for refund after failure
 * @param params.recipient Bitcoin address for recipient
 * @param params.amount Unstake BTC amount
 * @param params.provider EVM wallet provider;
 * @returns ethers.TransactionResponse
 */
await btuApi.unstakeBitcoin({
  contract: '0x',
  address: '0x',
  recipient: '0x',
  amount: 0n,
  provider: new BrowserProvider()
})

/**
 * Redeem BTC from an EVM-compatible chain.
 * @param params RedeemBitcoin
 * @param params.address BTCC contract address
 * @param params.amount Redeem BTC amount
 * @param params.recipient Bitcoin address for recipient
 * @param params.consumer Channel contract address
 * @param params.provider  EVM wallet provider
 * @returns ethers.TransactionResponse
 */
await btuApi.redeemBitcoin({
  address: '0x',
  amount: 0n,
  recipient: '0x',
  consumer: '0x',
  provider: new BrowserProvider()
})

/**
 * Release BTC from an EVM-compatible chain.
 * @param params ReleaseBitcoin
 * @param params.address Channel contract address
 * @param params.amount  Release BTC amount
 * @param params.recipient Bitcoin address for recipient
 * @param params.provider  EVM wallet provider
 * @returns ethers.TransactionResponse
 */
await btuApi.releaseBitcoin({
  address: '0x',
  amount: 0n,
  recipient: '0x',
  provider: new BrowserProvider()
})

/**
 * Borrow BTU
 * @param params BorrowParams
 * @param params.address BTU contract address
 * @param params.amount Pledge amount; BTCC => BTU
 * @param params.date Maturity date
 * @param params.provider EVM wallet provider
 * @returns ethers.TransactionResponse
 */
await btuApi.borrowBTU({
  address: '0x',
  amount: 0n,
  date: 0,
  provider: new BrowserProvider()
})

/**
 * Repay BTU
 * @param params RepayParams
 * @param params.address BTU contract address
 * @param params.amount Repaying the borrowed BTU amount
 * @param params.provider EVM wallet provider
 * @returns ethers.TransactionResponse
 */
await btuApi.repayBTU({
  address: '0x',
  amount: 0n,
  provider: new BrowserProvider()
})

/**
 * Increase BTCC collateral for borrowing
 * @param params IncreasePledge
 * @param params.address BTCC contract address
 * @param params.amount Increase BTCC amount
 * @param params.account User address
 * @param params.provider EVM wallet provider
 * @returns ethers.TransactionResponse
 */
await btuApi.increaseBTCCForBorrowing({
  address: '0x',
  amount: 0n,
  account: '0x',
  provider: new BrowserProvider()
})

/**
 * Use the BTU to liquidation borrowing,The liquidator receives BTCC.
 * @param params LiquidationBorrowing
 * @param params.address BTU contract address
 * @param params.account Borrower account
 * @param params.provider EVM wallet provider
 * @returns ethers.TransactionResponse
 */
await btuApi.liquidationBorrowing({
  address: '0x',
  account: '0x',
  provider: new BrowserProvider()
})
```

### Network Support

The SDK supports testnet and EVM-compatible chain:
- Use `'bitcoin_testnet'` for testnet operations
- Use  `'BTUApi'` for EVM-compatible chain operations

## License

MIT

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@hellobtu/sdk?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@hellobtu/sdk
[npm-downloads-src]: https://img.shields.io/npm/dm/@hellobtu/sdk?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@hellobtu/sdk
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@hellobtu/sdk?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@hellobtu/sdk
[license-src]: https://img.shields.io/github/license/HelloBTU/sdk.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/HelloBTU/sdk/blob/main/LICENSE
