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

### Basic Usage

#### 1. Check User's PRO Status
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

#### 2. Upgrade to PRO Status

Send fee to feeAddress before calling this function.

```typescript
import { upgradeToPro } from '@hellobtu/sdk'

// Upgrade a Bitcoin address to PRO status
const result = await upgradeToPro('bitcoin_testnet', 'tb1q...')
```

#### 3. Stake Bitcoin
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

### Network Support

The SDK supports testnet:
- Use `'bitcoin_testnet'` for testnet operations

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
