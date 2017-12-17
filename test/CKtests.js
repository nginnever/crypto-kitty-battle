'use strict';

import expectThrow from './helpers/expectThrow'
const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')
const SiringAuction = artifacts.require('./SiringClockAuction.sol')
const GeneScienceSkeleton = artifacts.require('./GeneScienceSkeleton.sol')

const Test = artifacts.require('./Test.sol')

contract('CryptoKitties', function(accounts) {
  let KCore
  let SAuction
  let SiAuction


  it('should deploy KittyCore', async function() {

    let kc = await KittyCore.new()
    console.log(kc.address)
    let sa = await SaleAuction.new(kc.address, 10)
    console.log(sa.address)
    let si = await SiringAuction.new(kc.address, 10)
    console.log(si.address)
    let gs = await GeneScienceSkeleton.new()

    await kc.setSiringAuctionAddress(si.address)
    await kc.setGeneScienceAddress(gs.address)
    await kc.setSaleAuctionAddress(sa.address)

    await kc.unpause()

    let genes = 626837621154801616088980922659877168609154386318304496692374110716999053
    await kc.createPromoKitty(genes, accounts[1])
    let kitty = await kc.getKitty(1)
    let owner = await kc.kittyIndexToOwner(1)
    console.log(owner)

    await kc.transfer(accounts[2], 1, {from: accounts[1]})
    owner = await kc.kittyIndexToOwner(1)
    console.log(owner)
  })
})