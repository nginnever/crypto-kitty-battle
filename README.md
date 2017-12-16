# Crypto Kitties Battleground by Crypto Arena

### Rinkeby Testnet Deployment

Do to the complexity of the CK contract the test version of CK Battle Arena is deployed on the rinkeby/kovan test network where the block gas limit is > 6000000

Kitty 0 (genesis kitty) genes are hardcoded to the underflow of uint256 (0 - 1 = 2**256 - 1)

A testnet version based on the open and verified crypto kitties mainnet deployment can be found at the following addresses

KittyCore: `0x606991c078088943e32d3bb97c294c9e8b6480fc`
SaleAuction: `0x1f23828b55283aeaf9e93c9767fcba43f8b846cb`

This allows for beta testing of the crypto kitties battlegrounds without the risk of destroying real kittehs.

### Deployment process

- Deploy Kitteh core
- Deploy Sale Auction Contract 
- Set Kitteh auction with sale auction by calling `setSaleAuctionAddress(address _address)`
- Deploy Siring Auction Contract
- Set Kitteh auction with siring auction by calling `setSiringAuctionAddress(address _address)`

#### Gene Science Contract

The geneScience contract controls the mixing algorithm that defines the outcome genetics of new crypto kitties. The code is not verified but similar to the work done by @montedong [cite], the mainnet bytecode for the geneScience contract found at `0xf97e0a5b616dffc913e72455fde9ea8bbe946a2b` has been deployed with the provided skeleton interface to provide limited testing ability. 