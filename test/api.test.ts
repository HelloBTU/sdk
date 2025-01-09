import { describe, expect, it } from 'vitest'
import { getProInfo } from '../src'

describe('api test utils', () => {
  it('get pro info', async () => {
    const pro = await getProInfo('bitcoin_testnet', 'tb1qdtq2fp77r975ugphsdvly3h0law9945wjsu54q')
    expect(pro.fee).toBe(1000000)
  })
}, {
  timeout: 60000,
})
