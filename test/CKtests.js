'use strict';

import expectThrow from './helpers/expectThrow'
const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')
const SiringAuction = artifacts.require('./SiringClockAuction.sol')

contract('CryptoKitties', function(accounts) {
  let KCore
  let SAuction
  let SiAuction

  // beforeEach(async function() {
  //   token = await MintableToken.new();
  // });

  it('should deploy KittyCore', async function() {
    // deploy all CK
    KittyCore.new().then((res) => {
      KCore = res.address
      console.log('KittyCore Address: ', res.address)
      SaleAuction.new(KCore, 10).then((res) => {
        SAuction = res.address
        console.log('SaleAuction Address: ', res.address)
        SiringAuction.new(KCore, 10).then((res) => {
          SiAuction = res.address
          console.log('SiringAuction Address: ', res.address)
        })
      })
    })

    // assert.equal(name, 'MatryxToken')
    // assert.equal(symbol, 'MTX')
    // assert.equal(decimals, 18)
  })
})