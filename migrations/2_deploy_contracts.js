const KittyCore = artifacts.require('./KittyCore.sol')

let token 
let agent = "0xcc036143c68a7a9a41558eae739b428ecde5ef66" // testrpc
//let agent = '0xeaa4ab092b63cea4445d6850dc217278f9af65e6'

module.exports = function(deployer) {
  KittyCore.new().then((res) => {
    token = res.address
    console.log('KittyCore Address: ', res.address)
  })
}