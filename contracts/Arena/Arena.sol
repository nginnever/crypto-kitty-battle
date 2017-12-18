pragma solidity ^0.4.11;

import './ArenaBase.sol';
import '../CryptoCats/ownership/Ownable.sol';
import '../CryptoCats/ownership/Pausable.sol';
import './PowerScienceInterface.sol';

/// @title Battle Arena for crypto kitties tokens.
/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract Arena is ArenaBase, Ownable, Pausable {

    /// @dev The ERC-165 interface signature for ERC-721.
    ///  Ref: https://github.com/ethereum/EIPs/issues/165
    ///  Ref: https://github.com/ethereum/EIPs/issues/721
    bytes4 constant InterfaceSignature_ERC721 = bytes4(0x9a20483d);

    // Reference to contract to determine base power
    PowerScienceInterface public powerScience;

    /// @dev Constructor creates a reference to the NFT ownership contract
    ///  and verifies the owner cut is in the valid range.
    /// @param _nftAddress - address of a deployed contract implementing
    ///  the Nonfungible Interface.
    function Arena(address _nftAddress) {
        ERC721 candidateContract = ERC721(_nftAddress);
        require(candidateContract.supportsInterface(InterfaceSignature_ERC721));
        nonFungibleContract = candidateContract;

        owner = msg.sender;
    }

    /// @dev Update the address of the power contract
    /// @param _address An address of a PowerScience contract instance to be used from this point forward.
    function setPowerScienceAddress(address _address) external onlyOwner {
        PowerScienceInterface candidateContract = PowerScienceInterface(_address);

        // NOTE: verify that a contract is what we expect - https://github.com/Lunyr/crowdsale-contracts/blob/cfadd15986c30521d8ba7d5b6f57b4fefcc7ac38/contracts/LunyrToken.sol#L117
        require(candidateContract.isPowerScience());

        // Set the new contract address
        powerScience = candidateContract;
    }

    /// @dev Remove all Ether from the contract, which is the owner's cuts
    ///  as well as any Ether sent directly to the contract address.
    ///  Always transfers to the NFT contract, but can be called either by
    ///  the owner or the NFT contract.
    function withdrawBalance() external {
        require(msg.sender == owner);
        // We are using this boolean method to make sure that even if one fails it will still work
        bool res = owner.send(this.balance);
    }

    // May only enter this arena with a valid ownership of a crypto kitty
    function enterArena(uint256 _tokenId) {
        require(_owns(msg.sender, _tokenId));
        // contract will own kitty after entering, no need to check for double entry
        // require(fighterIndexToOwner[_tokenId] == address(0));

        if(trainers[msg.sender].numKittiesInArena == 0) {
            // uint256[] memory _kitties;
            // _kitties.push(_tokenId);
            Trainer memory trainer = Trainer(1, 0, 0);
            trainers[msg.sender] = trainer;
        } else {
            Trainer memory _trainer = trainers[msg.sender];
            _trainer.numKittiesInArena++;
            //trainer.kitties.push(_tokenId);
            trainers[msg.sender] = _trainer;
        }

        _enterKitty(_tokenId);
    }

    function leaveArena(uint256 _tokenId) {
        require(fighterIndexToOwner[_tokenId] == msg.sender);
        require(!_isOnBattle(_tokenId));
        delete fighterIndexToOwner[_tokenId];

        Trainer storage trainer = trainers[msg.sender];
        trainer.numKittiesInArena--;

        _transfer(msg.sender, _tokenId);
    }

    /// @dev Creates and begins a new offer to duel.
    /// @param _tokenId - ID of token to auction, sender must be owner.
    /// @param _wagerPrice - Price (in wei) to challenge this cat.
    /// @param _gameMode - 1 if wager, 2 if pinks, 3 if pride
    /// @param _powerRange - acceptable range of power challengers may have
    function createBattle(
        uint256 _tokenId,
        uint256 _wagerPrice,
        uint8 _gameMode,
        uint64 _powerRange
    )
        payable
        whenNotPaused
    {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        require(_wagerPrice == uint256(uint128(_wagerPrice)));
        require(_powerRange == uint256(uint64(_powerRange)));
        require(_powerRange == uint256(uint64(_powerRange)));
        require(_gameMode == uint256(uint8(_gameMode)));

        require(msg.value == _wagerPrice);
        require(fighterIndexToOwner[_tokenId] == msg.sender);

        Battle memory battle = Battle(
            msg.sender,
            uint256(_tokenId),
            uint128(_wagerPrice),
            uint8(_gameMode),
            uint64(now),
            uint64(_powerRange)
        );

        _addBattle(_tokenId, battle);
    }

    /// @dev Attempts to engage in an open battle, completing the battle and transferring
    ///  ownership of the NFT or ether if enough Ether is supplied.
    /// @param _tokenId - ID of token to bid on.
    function fight(uint256 _tokenId, uint256 _initiatorTokenId)
        payable
        whenNotPaused
    {
        require(_owns(this, _tokenId));
        require(fighterIndexToOwner[_tokenId] == msg.sender);
        // _bid will throw if the bid or funds transfer fails
        _battle(_tokenId, _initiatorTokenId, msg.value);
        //_transfer(msg.sender, _tokenId);
    }

    /// @dev Cancels a battle that hasn't been won yet.
    ///  Returns the NFT or ether to original owner.
    /// @notice This is a state-modifying function that can
    ///  be called while the contract is paused.
    /// @param _tokenId - ID of token on auction
    function cancelBattle(uint256 _tokenId)
        public
    {
        Battle storage battle = tokenIdToBattle[_tokenId];
        require(_isOnBattle(_tokenId));
        address initiator = battle.initiator;
        require(msg.sender == initiator);
        _cancelBattle(_tokenId, initiator);
    }

    /// @dev Returns battle info for an NFT up for a fight.
    /// @param _tokenId - ID of NFT battle.
    function getBattle(uint256 _tokenId)
        external
        view
        returns
    (
        address initiator,
        uint256 initiatorCatID,
        uint128 wagerPrice,
        uint8 gameMode,
        uint64 startedAt,
        uint64 powerRange
    ) {
        Battle storage battle = tokenIdToBattle[_tokenId];
        require(_isOnBattle(_tokenId));
        return (
            battle.initiator,
            battle.initiatorCatID,
            battle.wagerPrice,
            battle.gameMode,
            battle.startedAt,
            battle.powerRange
        );
    }

}