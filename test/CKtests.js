'use strict';

import expectThrow from './helpers/expectThrow'
const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')
const SiringAuction = artifacts.require('./SiringClockAuction.sol')
const GeneScienceSkeleton = artifacts.require('./GeneScienceSkeleton.sol')

const Arena = artifacts.require('./Arena.sol')
const PowerScience = artifacts.require('./PowerScience.sol')

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

    genes = 516352338653793441435945041728197487411731676739419911293424053054289261
    await kc.createPromoKitty(genes, accounts[1])

    genes = 12
    await kc.createPromoKitty(genes, accounts[0])

    let kitty = await kc.getKitty(1)
    let owner = await kc.kittyIndexToOwner(1)
    console.log(owner)

    await kc.transfer(accounts[2], 1, {from: accounts[1]})
    owner = await kc.kittyIndexToOwner(1)
    console.log(owner)

    let ar = await Arena.new(kc.address)
    let ps = await PowerScience.new()

    await ar.setPowerScienceAddress(ps.address, {from: accounts[0]})

    let p = await ar.powerScience()
    console.log('loaded ps into arena ' + p)

    await kc.approve(ar.address, 1, {from: accounts[2]})
    await kc.approve(ar.address, 2, {from: accounts[1]})
    await kc.approve(ar.address, 3, {from: accounts[0]})

    await ar.enterArena(1, {from: accounts[2]})
    await ar.enterArena(2, {from: accounts[1]})
    await ar.enterArena(3, {from: accounts[0]})

    let profile = await ar.battleKitties(1)
    let trainer = await ar.trainers(accounts[2])
    let champ = await ar.championId()

    let profile2 = await ar.battleKitties(2)
    let trainer2 = await ar.trainers(accounts[1])
    let champ2 = await ar.championId()

    console.log('warrior: ' + profile)
    console.log('warrior2: ' + profile2)
    console.log('trainer:' + trainer)
    console.log('trainer2:' + trainer2)
    console.log('champion: ' + champ)
    console.log('champion: ' + champ2)

    await ar.createBattle(1, 21*10**18, 1, 10, {from: accounts[2], value: 21*10**18})
    let battle = await ar.tokenIdToBattle(1)

    console.log('battle: ' + battle)

    console.log('balance 1: ' + web3.eth.getBalance(accounts[1]))
    console.log('balance 2: ' + web3.eth.getBalance(accounts[2]))

    await ar.fight(2, 1, {from: accounts[1], value: 21*10**18})

    profile = await ar.battleKitties(1)
    profile2 = await ar.battleKitties(2)

    console.log('warrior: ' + profile)
    console.log('warrior2: ' + profile2)
    console.log('balance 1: ' + web3.eth.getBalance(accounts[1]))
    console.log('balance 2: ' + web3.eth.getBalance(accounts[2]))
    console.log('balance arena: ' + web3.eth.getBalance(ar.address))
    battle = await ar.tokenIdToBattle(1)
    let score1 = await ar.score1()
    let score2 = await ar.score2()
    let rand1 = await ar.rand1()
    let rand2 = await ar.rand2()

    console.log('battle: ' + battle)
    console.log('score1: ' + score1)
    console.log('score2: ' + score2)
    console.log('rand1: ' + rand1)
    console.log('rand2: ' + rand2)

    for(let i=0; i<100; i++) {
      console.log('++++++++++++++++++++++++++++')
      await ar.createBattle(1, 21*10**18, 1, 10, {from: accounts[2], value: 21*10**18})
      let battle = await ar.tokenIdToBattle(1)

      await ar.fight(3, 1, {from: accounts[0], value: 21*10**18})

      profile = await ar.battleKitties(1)
      profile2 = await ar.battleKitties(3)

      console.log('warrior: ' + profile)
      console.log('warrior2: ' + profile2)
      console.log('balance arena: ' + web3.eth.getBalance(ar.address))
      battle = await ar.tokenIdToBattle(1)
      let score1 = await ar.score1()
      let score2 = await ar.score2()
      let rand1 = await ar.rand1()
      let rand2 = await ar.rand2()

      console.log('score1: ' + score1)
      console.log('score2: ' + score2)
      console.log('rand1: ' + rand1)
      console.log('rand2: ' + rand2) 
    }
  })
})