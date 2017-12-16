const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')

let token 

module.exports = function(deployer) {
  // deploy core
  // KittyCore.new().then((res) => {
  //   token = res.address
  //   console.log('KittyCore Address: ', res.address)
  // })

  // deploy sale auction
  SaleAuction.new("0x606991c078088943e32d3bb97c294c9e8b6480fc", 10).then((res) => {
    token = res.address
    console.log('SaleAuction Address: ', res.address)
    console.log('SaleAuction Address: ', token)
  })


  // deploy all CK
  // KittyCore.new().then((res) => {
  //   token = res.address
  //   console.log('KittyCore Address: ', res.address)
  //   SaleAuction.new(token, 10).then((res) => {
  //     token = res.address
  //     console.log('SaleAuction Address: ', token)
  //   })
  // })
}