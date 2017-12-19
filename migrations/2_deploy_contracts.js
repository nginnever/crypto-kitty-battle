const KittyCore = artifacts.require('./KittyCore.sol')
const SaleAuction = artifacts.require('./SaleClockAuction.sol')
const SiringAuction = artifacts.require('./SiringClockAuction.sol')
const GeneScienceSkeleton = artifacts.require('./GeneScienceSkeleton.sol')
const Arena = artifacts.require('./Arena.sol')
const PowerScience = artifacts.require('./PowerScience.sol')

let token 

module.exports = function(deployer) {
  // deploy core
  // KittyCore.new().then((res) => {
  //   token = res.address
  //   console.log('KittyCore Address: ', res.address)
  // })

  // // deploy sale auction
  // SaleAuction.new("0x606991c078088943e32d3bb97c294c9e8b6480fc", 10).then((res) => {
  //   token = res.address
  //   console.log('SaleAuction Address: ', res.address)
  //   console.log('SaleAuction Address: ', token)
  // })

  // // deploy siring auction
  // SiringAuction.new("0x606991c078088943e32d3bb97c294c9e8b6480fc", 10).then((res) => {
  //   token = res.address
  //   console.log('SiringAuction Address: ', res.address)
  // })

  // deploy gene science
  // GeneScienceSkeleton.new().then((res) => {
  //   token = res.address
  //   console.log('GeneScience Address: ', res.address)
  // })

  // deploy sale auction
  Arena.new("0x606991c078088943e32d3bb97c294c9e8b6480fc").then((res) => {
    token = res.address
    console.log('Arena Address: ', res.address)
    PowerScience.new().then((res) => {
      token = res.address
      console.log('PowerScience Address: ', res.address)
    })
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