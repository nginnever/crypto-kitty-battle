# Crypto Kitties Battleground by Crypto Arena

Crypto Kitties Battleground is an extension to the popular crypto kitties smart contracts. Those who have purchased or bred crypto kitties may deposit their cats into the battle arena contract. Once deposited kitty owners can train their crypto warriors by calling the `increaseStat()` functions. The more ether an owner has the higher they may pump their kitties battle stats.

Entering a battle is accomplished by checking the battle registery to find an open battle request in your kitties power range, or by creating an open battle request with a specified power range and ether wager for win/lose. Each dueling kitties stats are compared in a non-verified contract that encorporates some randomness into the victory decision.

Currently all cats are created equal. When depositing a crypto kitty in the battle arena, every cat will start with the same base stats. Once a mapping of the uint256 genetic integers to rare traits can be found, rare kitties may deposit in the arena with higher overall stats.

### Rinkeby Testnet Deployment

Do to the complexity of the CK contract the test version of CK Battle Arena is deployed on the rinkeby/kovan test network where the block gas limit is > 6000000

Kitty 0 (genesis kitty) genes are hardcoded to the underflow of `uint256 (0 - 1 = 2**256 - 1)`

A testnet version based on the open and verified crypto kitties mainnet deployment can be found at the following addresses

KittyCore: `0x606991c078088943e32d3bb97c294c9e8b6480fc`

SaleAuction: `0x1f23828b55283aeaf9e93c9767fcba43f8b846cb`

SiringAuction: `0x77d9c50bd7f0d93580ff3fa4a3fec24e2ab945bc`

GeneScienceSkeleton: `0x36bcd40f6a39f0ac5880cdd95876e9ed9e6ebbd9`


This allows for beta testing of the crypto kitties battlegrounds without the risk of destroying real kittehs.

### Deployment process

- Deploy Kitteh core
- Deploy Sale Auction Contract 
- Set Kitteh auction with sale auction by calling `setSaleAuctionAddress(address _address)`
- Deploy Siring Auction Contract
- Set Kitteh auction with siring auction by calling `setSiringAuctionAddress(address _address)`
- unpause()
- generate promo kitties for testing (TODO create a kitteh faucet)
- Deploy PowerScience contract
- Deploy Arena and link powerscience
- enter kittehs in the arena to train/battle.

#### Gene Science Contract

The geneScience contract controls the mixing algorithm that defines the outcome genetics of new crypto kitties. The code is not verified. Gene Mixing is currently not tested and all genetic code is provided from the COO ability to generate clock and promo cats. 