* Crypto Kitties Battleground by Crypto Arena

*** Ropsten Testnet Deployment

A testnet version based on the open and verified crypto kitties mainnet deployment can be found at the following address

`0x`

This allows for beta testing of the crypto kitties battlegrounds without the risk of destroying real kittehs.

*** Deployment process

- Deploy Kitteh core
- Deploy Sale Auction Contract 
- Set Kitteh auction with sale auction by calling `setSaleAuctionAddress(address _address)`
- Deploy Siring Auction Contract
- Set Kitteh auction with siring auction by calling `setSiringAuctionAddress(address _address)`

**** Gene Science Contract

The geneScience contract controls the mixing algorithm that defines the outcome genetics of new crypto kitties. The code is not verified but similar to the work done by @montedong [cite], the mainnet bytecode for the geneScience contract found at `0xf97e0a5b616dffc913e72455fde9ea8bbe946a2b` has been deployed with the provided skeleton interface to provide limited testing ability. 