# @hellobtu/sdk

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

# Hello BTU Library

A TypeScript library for HelloBTU protocol.
## Usage

### Installation

```bash
npm install @hellobtu/sdk
# or
yarn add @hellobtu/sdk
```

### Preparation

Downloads [secp256k1.wasm](./assets/secp256k1.wasm) to public/

### Fetch user address info

```typescript
import { getProInfo } from '@hellobtu/sdk'

const info = await getProInfo('bitcoin_testnet', 'tb1...')
```


### Upgrade to PRO
```typescript
import { getProInfo } from '@hellobtu/sdk'

const info = await upgradeToPro('bitcoin_testnet', 'tb1...')
```

### Stake Bitcoin

```typescript
import { stakeBitcoin } from '@hellobtu/sdk'

const stakeProps = {
  address: 'your-bitcoin-address',
  pubkey: 'your-public-key',
  committee: 'committee-address',
  amount: '1000000', // amount in satoshis
  feeRate: 5, // in sat/vB
  chainId: 11155111, // destination chain ID
  recipient: 'recipient-address',
  signer: 'your-wallet-provider, with signPsbt implemented'
}

// Stake Bitcoin
const txHash = await stakeBitcoin('bitcoin_testnet', stakeProps)
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
[license-src]: https://img.shields.io/github/license/HelloBTU/sdk.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/HelloBTU/sdk/blob/main/LICENSE
