'use strict';

import expectThrow from './helpers/expectThrow'
const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')
const SiringAuction = artifacts.require('./SiringClockAuction.sol')
const GeneScienceSkeleton = artifacts.require('./GeneScienceSkeleton.sol')

const ChannelManager = artifacts.require("./ChannelManager.sol")
const Interpreter = artifacts.require("./InterpretBattleChannel.sol")

const Arena = artifacts.require('./Arena.sol')
const PowerScience = artifacts.require('./PowerScience.sol')

const Test = artifacts.require('./Test.sol')

contract('CryptoKitties', function(accounts) {
  let KCore
  let SAuction
  let SiAuction


  it('should deploy KittyCore', async function() {
    let cm = await ChannelManager.new()
    console.log(cm.address)
    let kc = await KittyCore.new()
    console.log(kc.address)
    let sa = await SaleAuction.new(kc.address, 10)
    console.log(sa.address)
    let si = await SiringAuction.new(kc.address, 10)
    console.log(si.address)
    let gs = await GeneScienceSkeleton.new()
    console.log(gs.address)
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

    let ar = await Arena.new(kc.address, cm.address)
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

    // State
    // [0-31] isClose flag
    // [32-63] sequence number
    // [64-95] wager ether
    // [96-127] number of cats in channel
    // battle cat 1
    // [] owner
    // [] kitty id
    // [] base power
    // [] wins
    // [] losses
    // [] level
    // [] cool down
    // [] HP hit point
    // [] DP defense points
    // [] AP attack points
    // [] A1 attack action
    // [] A2 attack action
    // [] A3 attack action

    // get kitty stats from arena
    let kit = await ar.getKittyStats(1) // account[2]
    let kit2 = await ar.getKittyStats(2) // account[1]

    console.log('total kitty stats, kitty 1: ' + kit)
    console.log('battle kitty id: 1 base stats HP: ' + kit[5][0] + ' DP: ' + kit[5][1] + ' AP: ' + kit[5][2])
    console.log('battle kitty id: 1 attacks A1: ' + kit[6][0] + ' A2: ' + kit[6][1] + ' A3: ' + kit[6][2])
    console.log('battle kitty id: 2 base stats HP: ' + kit2[5][0] + ' DP: ' + kit2[5][1] + ' AP: ' + kit2[5][2])
    console.log('battle kitty id: 2 attacks A1: ' + kit2[6][0] + ' A2: ' + kit2[6][1] + ' A3: ' + kit2[6][2])

    var msg

    msg = generateState(
      0, 
      0, 
      21, 
      2, 
      [accounts[1], accounts[2]],
      [2, 1],
      [kit, kit2]
    )

    console.log('generated state: ' + msg)
    // Hashing and signature
    var hmsg = web3.sha3(msg, {encoding: 'hex'})
    console.log('hashed msg: ' + hmsg)

    var sig1 = await web3.eth.sign(accounts[2], hmsg)
    var r = sig1.substr(0,66)
    var s = "0x" + sig1.substr(66,64)
    var v = 28

    await ar.createBattle(1, accounts[1], 21*10**18, 1, 10, 0, msg, v, r, s, {from: accounts[2], value: 21*10**18})

    //console.log('channel struct Interpreter address: ' + chan[2])

    let battle = await ar.tokenIdToBattle(1)
    let testIntAddy = await cm.testAddy()
    let newInt = Interpreter.at(testIntAddy)
    let intKitty = await newInt.a3()
    let chanId

    var event = cm.allEvents({fromBlock: 0, toBlock: 'latest'})
    event.get((err, res)=>{
      console.log('channel event: ' + res[0].args.channelId)
      chanId = res[0].args.channelId
    })
    const timeout = ms => new Promise(res => setTimeout(res, ms))
    await timeout(1000)
    // for(var i=0; i<1000000; i++){
    //   var x = 1
    //   var y = 2
    //   var z = Math.pow(3,x)*y+x-y
    // }
    //console.log('channel event: ' + logs)

    console.log('battle: ' + battle)
    console.log('Interpreter addy: ' + int.address)
    console.log('test address passed correctly: ' + testIntAddy)
    console.log('reconstructed Interpreter state. Kitty ID 1 base power: ' + intKitty)

    console.log('balance 1: ' + web3.eth.getBalance(accounts[1]))
    console.log('balance 2: ' + web3.eth.getBalance(accounts[2]))
    console.log('Chan Id: ' + chanId)

    var sig2 = await web3.eth.sign(accounts[1], hmsg)
    var r2 = sig2.substr(0,66)
    var s2 = "0x" + sig2.substr(66,64)
    var v2 = 27

    await ar.joinBattle(2, 1, chanId, msg, v2, r2, s2, {from: accounts[1], value: 21*10**18})

    // profile = await ar.battleKitties(1)
    // profile2 = await ar.battleKitties(2)

    // console.log('warrior: ' + profile)
    // console.log('warrior2: ' + profile2)
    // console.log('balance 1: ' + web3.eth.getBalance(accounts[1]))
    // console.log('balance 2: ' + web3.eth.getBalance(accounts[2]))
    // console.log('balance arena: ' + web3.eth.getBalance(ar.address))
    // battle = await ar.tokenIdToBattle(1)
    // let score1 = await ar.score1()
    // let score2 = await ar.score2()
    // let rand1 = await ar.rand1()
    // let rand2 = await ar.rand2()

    // console.log('battle removed: ' + battle)
    // console.log('score1: ' + score1)
    // console.log('score2: ' + score2)
    // console.log('rand1: ' + rand1)
    // console.log('rand2: ' + rand2)

    // await ar.level(2, {from: accounts[1], value: 1*10**18})
    // let lvl = await ar.battleKitties(2)

    // console.log('Kitty 2 level up: ' + lvl)

    // // get state and signature

    // await ar.createBattle(1, accounts[1], 0, 2, 10, {from: accounts[2]})
    // battle = await ar.tokenIdToBattle(1)

    // console.log('pink slips battle: ' + battle)

    // let own = await ar.fighterIndexToOwner(1)
    // console.log('Owner cat 1: ' + own)
    // own = await ar.fighterIndexToOwner(2)
    // console.log('Owner cat 2: ' + own)

    // await ar.joinBattle(2, 1, {from: accounts[1]})

    // profile = await ar.battleKitties(1)
    // profile2 = await ar.battleKitties(2)

    // console.log('warrior: ' + profile)
    // console.log('warrior2: ' + profile2)

    // own = await ar.fighterIndexToOwner(1)
    // console.log('Owner cat 1: ' + own)
    // own = await ar.fighterIndexToOwner(2)
    // console.log('Owner cat 2: ' + own)









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

function generateState(sentinel, seq, wager, numKitties, owners, ids, kitties) {
  var sentinel = padBytes32(web3.toHex(sentinel))
  var sequence = padBytes32(web3.toHex(seq))
  var wager = padBytes32(web3.toHex(web3.toWei(wager, 'ether')))
  var numKitties = padBytes32(web3.toHex(numKitties))


  var m = sentinel +
    sequence.substr(2, sequence.length) +
    wager.substr(2, wager.length) +
    numKitties.substr(2, numKitties.length)

  for(var i=0; i<numKitties; i++){
    var addy = padBytes32(owners[i])
    var id = padBytes32(web3.toHex(ids[i]))
    var basePower = padBytes32(web3.toHex(kitties[i][0]))
    // var wins = padBytes32(web3.toHex(kitties[i][1]))
    // var losses = padBytes32(web3.toHex(kitties[i][2]))
    var level = padBytes32(web3.toHex(kitties[i][3]))
    var cooldown = padBytes32(web3.toHex(kitties[i][4]))
    var hp = padBytes32(web3.toHex(kitties[i][5][0]))
    var dp = padBytes32(web3.toHex(kitties[i][5][1]))
    var ap = padBytes32(web3.toHex(kitties[i][5][2]))
    var a1 = padBytes32(web3.toHex(kitties[i][6][0]))
    var a2 = padBytes32(web3.toHex(kitties[i][6][1]))
    var a3 = padBytes32(web3.toHex(kitties[i][6][2]))

    m += addy.substr(2, addy.length)
    m += id.substr(2, id.length)
    m += basePower.substr(2, basePower.length)
    // m += wins.substr(2, wins.length)
    // m += losses.substr(2, losses.length)
    m += level.substr(2, level.length)
    m += cooldown.substr(2, cooldown.length)
    m += hp.substr(2, hp.length)
    m += dp.substr(2, dp.length)
    m += ap.substr(2, ap.length)
    m += a1.substr(2, a1.length)
    m += a2.substr(2, a2.length)
    m += a3.substr(2, a3.length)
  }

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
