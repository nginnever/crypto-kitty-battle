# WIP Crypto Kitties Battleground

Crypto Kitties Battleground is an extension to the popular crypto kitties smart contracts. Those who have purchased or bred crypto kitties may deposit their cats into the battle arena contract. Once deposited kitty owners can train their crypto warriors by calling the `level()` function. The more ether an owner has the higher they may pump their kitties battle stats.

Currently all cats enter the arena with a base power rating that can be increased by training the kitty. The base powe rating is determined randomly based upon the genetics of the cat. Factors such as a lower generation number and faster birthing cooldown will give the kitty a higher chance of having a high base power. This base power is the multiplication factor of the power increase gained from calling the level() function. Cats with a higher base power rating will be able to achieve the highest power in the arena.

Entering a battle is accomplished by checking the battle registery to find an open battle request in your kitties power range, or by creating an open battle request with a specified power range and ether wager for win/lose. Each dueling kitties stats are compared in a non-verified contract that encorporates some randomness into the victory decision.

#### Hold the arena!

The kitty in the gym with the highest power will collect a percentage of all arena earnings via level ups and wagers while they retain the highest power.

## Rinkeby Testnet Deployment

Do to the complexity of the CK contract the test version of CK Battle Arena is deployed on the rinkeby/kovan test network where the block gas limit is > 6000000

Kitty 0 (genesis kitty) genes are hardcoded to the underflow of `uint256 (0 - 1 = 2**256 - 1)`

A testnet version based on the open and verified crypto kitties mainnet deployment can be found at the following addresses

KittyCore: `0x606991c078088943e32d3bb97c294c9e8b6480fc`

SaleAuction: `0x1f23828b55283aeaf9e93c9767fcba43f8b846cb`

SiringAuction: `0x77d9c50bd7f0d93580ff3fa4a3fec24e2ab945bc`

GeneScienceSkeleton: `0x36bcd40f6a39f0ac5880cdd95876e9ed9e6ebbd9`


This allows for beta testing of the crypto kitties battlegrounds without the risk of destroying real kittehs.

### Deployment process notes

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
