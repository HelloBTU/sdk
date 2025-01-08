# @hellobtu/sdk

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

# Hello BTU Library

A TypeScript library for HelloBTU protocol.
This library is under active development and is subject to change.

## Installation

```bash
npm install bitcoin-staking-lib
# or
yarn add bitcoin-staking-lib
```

## Usage

```typescript
import { stakeBitcoin } from 'bitcoin-staking-lib'

const stakeProps = {
  address: 'your-bitcoin-address',
  pubkey: 'your-public-key',
  committee: 'committee-address',
  amount: '1000000', // amount in satoshis
  feeRate: 5, // in sat/vB
  chainId: 1, // destination chain ID
  recipient: 'recipient-address',
  signer: 'your-wallet-provider, with signPsbt implemented'
}

// Stake Bitcoin
const txHash = await stakeBitcoin('mainnet', stakeProps)
console.log('Transaction Hash:', txHash)
```

## License

MIT

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@hellobtu/sdk?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@hellobtu/sdk
[npm-downloads-src]: https://img.shields.io/npm/dm/@hellobtu/sdk?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@hellobtu/sdk
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@hellobtu/sdk?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@hellobtu/sdk
[license-src]: https://img.shields.io/github/license/antfu/@hellobtu/sdk.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/@hellobtu/sdk/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@hellobtu/sdk
