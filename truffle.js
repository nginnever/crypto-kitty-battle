require('babel-register')
require('babel-polyfill')

var test = true
var rinkeby = true
var account

if(test){
  account = "0x01da6f5f5c89f3a83cc6bebb0eafc1f1e1c4a303"
  if(rinkeby){
    account = "0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe"
  }
} else {
  // Ropsten
  account = "0x5d0df28514c493ee11cf23f1b44f42516a7cb415"
}

module.exports = {
  networks: {
    rinkeby: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "4",
      from: account,
      gas: 6749526
    },
    mainnet: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1",
      gas: 4700000
    }
  }
};