'use strict';

import expectThrow from './helpers/expectThrow'
const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')
const SiringAuction = artifacts.require('./SiringClockAuction.sol')
const GeneScienceSkeleton = artifacts.require('./GeneScienceSkeleton.sol')

const ChannelManager = artifacts.require("./ChannelManager.sol")
const Interpreter = artifacts.require("./InterpretNPartyPayments.sol")

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
    console.log(gs.address)
    let cm = await ChannelManager.new()
    console.log(cm.address)
    let int = await Interpreter.new()
    console.log(int.address)

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

    // get state and signature
    var msg

    msg = generateState(0, 0, accounts[0], accounts[1], 10, 5)


    // Hashing and signature
    var hmsg = web3.sha3(msg, {encoding: 'hex'})
    console.log('hashed msg: ' + hmsg)

    var sig1 = await web3.eth.sign(accounts[0], hmsg)
    var r = sig1.substr(0,66)
    var s = "0x" + sig1.substr(66,64)
    var v = 27

    await ar.createBattle(1, accounts[1], 21*10**18, 1, 10, {from: accounts[2], value: 21*10**18})
    let battle = await ar.tokenIdToBattle(1)
    let kit = await ar.getKittyStats(1)

    console.log('battle: ' + battle)
    console.log('battle kitty id: 1 base stats HP: ' + kit[5][0] + ' DP: ' + kit[5][1] + ' AP: ' + kit[5][2])
    console.log('battle kitty id: 1 attacks A1: ' + kit[6][0] + ' A2: ' + kit[6][1] + ' A3: ' + kit[6][2])

    console.log('balance 1: ' + web3.eth.getBalance(accounts[1]))
    console.log('balance 2: ' + web3.eth.getBalance(accounts[2]))

    await ar.joinBattle(2, 1, {from: accounts[1], value: 21*10**18})

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

    console.log('battle removed: ' + battle)
    console.log('score1: ' + score1)
    console.log('score2: ' + score2)
    console.log('rand1: ' + rand1)
    console.log('rand2: ' + rand2)

    await ar.level(2, {from: accounts[1], value: 1*10**18})
    let lvl = await ar.battleKitties(2)

    console.log('Kitty 2 level up: ' + lvl)

    // get state and signature

    await ar.createBattle(1, accounts[1], 0, 2, 10, {from: accounts[2]})
    battle = await ar.tokenIdToBattle(1)

    console.log('pink slips battle: ' + battle)

    let own = await ar.fighterIndexToOwner(1)
    console.log('Owner cat 1: ' + own)
    own = await ar.fighterIndexToOwner(2)
    console.log('Owner cat 2: ' + own)

    await ar.joinBattle(2, 1, {from: accounts[1]})

    profile = await ar.battleKitties(1)
    profile2 = await ar.battleKitties(2)

    console.log('warrior: ' + profile)
    console.log('warrior2: ' + profile2)

    own = await ar.fighterIndexToOwner(1)
    console.log('Owner cat 1: ' + own)
    own = await ar.fighterIndexToOwner(2)
    console.log('Owner cat 2: ' + own)

    // for(let i=0; i<100; i++) {
    //   console.log('++++++++++++++++++++++++++++')
    //   await ar.createBattle(1, 21*10**18, 1, 10, {from: accounts[2], value: 21*10**18})
    //   let battle = await ar.tokenIdToBattle(1)

    //   await ar.fight(3, 1, {from: accounts[0], value: 21*10**18})

    //   profile = await ar.battleKitties(1)
    //   profile2 = await ar.battleKitties(3)

    //   console.log('warrior: ' + profile)
    //   console.log('warrior2: ' + profile2)
    //   console.log('balance arena: ' + web3.eth.getBalance(ar.address))
    //   battle = await ar.tokenIdToBattle(1)
    //   let score1 = await ar.score1()
    //   let score2 = await ar.score2()
    //   let rand1 = await ar.rand1()
    //   let rand2 = await ar.rand2()

    //   console.log('score1: ' + score1)
    //   console.log('score2: ' + score2)
    //   console.log('rand1: ' + rand1)
    //   console.log('rand2: ' + rand2) 
    // }
  })
})

function generateState(sentinel, seq, wager, addyA, addyB, balB) {
    var sentinel = padBytes32(web3.toHex(sentinel))
    var sequence = padBytes32(web3.toHex(seq))
    var wager = padBytes32(web3.toHex(web3.toWei(wager, 'ether')))
    var addressA = padBytes32(addyA)
    var addressB = padBytes32(addyB)
    var balanceA = padBytes32(web3.toHex(web3.toWei(balA, 'ether')))
    var balanceB = padBytes32(web3.toHex(web3.toWei(balB, 'ether')))

    var m = sentinel +
        sequence.substr(2, sequence.length) +
        addressA.substr(2, addressA.length) +
        addressB.substr(2, addressB.length) +
        balanceA.substr(2, balanceA.length) + 
        balanceB.substr(2, balanceB.length)

    return m
}

function padBytes32(data){
  let l = 66-data.length
  let x = data.substr(2, data.length)

  for(var i=0; i<l; i++) {
    x = 0 + x
  }
  return '0x' + x
}

function rightPadBytes32(data){
  let l = 66-data.length

  for(var i=0; i<l; i++) {
    data+=0
  }
  return data
}
