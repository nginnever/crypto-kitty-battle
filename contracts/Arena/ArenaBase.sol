pragma solidity ^0.4.11;


import '../CryptoCats/KittyCore.sol';
import '../CryptoCats/token/ERC721.sol';

/// @title Arena Core
/// @dev Contains models, variables, and internal methods for the arena.
/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract ArenaBase {

    uint256 public score1;
    uint256 public score2;
    uint256 public rand1;
    uint256 public rand2;

    // Represents an auction on an NFT
    struct Battle {
        // Current owner of NFT
        address initiator;
        // initiator cat
        uint256 initiatorCatID;
        // Price (in wei) to challenge this cat
        uint128 wagerPrice;
        // Game mode: Pinks, Wager, Pride
        uint8 gameMode;
        // Duration (in seconds) of auction
        uint64 startedAt;
        // Acceptable range of challenger powers
        uint64 powerRange;
    }

    struct Trainer {
        uint64 numKittiesInArena;
        uint64 wins;
        uint64 losses;
        //uint256[] kitties;
    }

    struct KittyProfile {
        uint128 basePower;
        uint64 wins;
        uint64 losses;
        uint8 level;
        uint64 coolDown;
    }

    // Reference to contract tracking NFT ownership
    KittyCore public nonFungibleContract;

    // Cut owner takes on each battle, measured in basis points (1/100 of a percent).
    // Values 0-10,000 map to 0%-100%
    uint256 public ownerCut = 1000;

    uint256 public championCut = 1000;

    uint256 public championId;

    // Map from token ID to their corresponding battle.
    mapping (uint256 => Battle) public tokenIdToBattle;

    mapping (address => Trainer) public trainers;

    mapping (uint256 => KittyProfile) public battleKitties;

    mapping (uint256 => address) public fighterIndexToOwner;


    event BattleCreated(uint256 tokenId, uint256 wagerPrice, uint256 duration);
    event BattleCancelled(uint256 tokenId);
    event BattleSuccessful(uint256 _tokenId, uint256 price, address winner);
    event ArenaEntered(uint256 tokenId);
    event LevelUp(uint256 tokenId, uint8 level);

    /// @dev Returns true if the claimant owns the token.
    /// @param _claimant - Address claiming to own the token.
    /// @param _tokenId - ID of token whose ownership to verify.
    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant);
    }

    function _enterKitty(uint256 _tokenId, uint128 _power) internal {
        _escrow(msg.sender, _tokenId);

        if(battleKitties[_tokenId].basePower == 0) {
            KittyProfile memory profile = KittyProfile(_power,0,0,0,0);
            battleKitties[_tokenId] = profile;
        } 

        fighterIndexToOwner[_tokenId] = msg.sender;

        ArenaEntered(_tokenId);
    }

    /// @dev Escrows the NFT, assigning ownership to this contract.
    /// Throws if the escrow fails.
    /// @param _owner - Current owner address of token to escrow.
    /// @param _tokenId - ID of token whose approval to verify.
    function _escrow(address _owner, uint256 _tokenId) internal {
        // it will throw if transfer fails
        nonFungibleContract.transferFrom(_owner, this, _tokenId);
    }

    /// @dev Transfers an NFT owned by this contract to another address.
    /// Returns true if the transfer succeeds.
    /// @param _receiver - Address to transfer NFT to.
    /// @param _tokenId - ID of token to transfer.
    function _transfer(address _receiver, uint256 _tokenId) internal {
        // it will throw if transfer fails
        nonFungibleContract.transfer(_receiver, _tokenId);
    }

    /// @dev Adds an battle to the list of open battles. Also fires the
    ///  BattleCreated event.
    /// @param _tokenId The ID of the token to be put on battle.
    /// @param _battle Battle to add.
    function _addBattle(uint256 _tokenId, Battle _battle) internal {

        tokenIdToBattle[_tokenId] = _battle;

        BattleCreated(
            uint256(_tokenId),
            uint256(_battle.wagerPrice),
            uint256(_battle.startedAt)
        );
    }

    /// @dev Cancels a battle unconditionally.
    function _cancelBattle(uint256 _tokenId, address _initiator) internal {
        _removeBattle(_tokenId);
        BattleCancelled(_tokenId);
    }

    /// @dev Computes the price and transfers winnings.
    /// Does NOT transfer ownership of token.
    function _battle(uint256 _tokenId, uint256 _initiatorTokenId, uint256 _bidAmount)
        internal
        returns (uint256)
    {
        // Get a reference to the battle struct
        Battle storage battle = tokenIdToBattle[_initiatorTokenId];

        // Check that the bid is greater than or equal to the current price
        uint256 wager = battle.wagerPrice;
        require(_bidAmount >= wager);

        // Explicitly check that this battle is currently live.
        // (Because of how Ethereum mappings work, we can't just count
        // on the lookup above failing. An invalid _tokenId will just
        // return a battle object that is all zeros.)
        require(_isOnBattle(_initiatorTokenId));

        // this was intended to allow time for betting
        // currently betting can't happen since a battle happens as soon
        // as there is a challenger
        //require(_isReadyToBattle(battle));
        require(_isWithinPower(_tokenId, _initiatorTokenId, battle.powerRange));

        uint256 _winningCatID = _getWinner(_initiatorTokenId, _tokenId);

        address _winner = fighterIndexToOwner[_winningCatID];
        uint256 _losingCat;

        if(_winner == battle.initiator) {
            _losingCat = _tokenId;
        } else {
            _losingCat = _initiatorTokenId;
        }

        battleKitties[_winningCatID].wins++;
        battleKitties[_losingCat].losses++;

        trainers[_winner].wins++;
        trainers[fighterIndexToOwner[_losingCat]].losses++;

        // The battle is good! Remove the battle before sending the fees
        // to the sender so we can't have a reentrancy attack.
        _removeBattle(battle.initiatorCatID);

        // Transfer proceeds to winner (if there are any!)
        if (wager > 0) {
            // Calculate the arena's cut.
            // (NOTE: _computeCut() is guaranteed to return a
            // value <= price, so this subtraction can't go negative.)
            uint256 pot = _bidAmount + wager;
            uint256 arenaCut = _computeCut(pot, ownerCut);
            uint256 champCut = _computeCut(pot, championCut);
            uint256 winnerProceeds = pot - arenaCut - champCut;


            // NOTE: Doing a transfer() in the middle of a complex
            // method like this is generally discouraged because of
            // reentrancy attacks and DoS attacks if the seller is
            // a contract with an invalid fallback function. We explicitly
            // guard against reentrancy attacks by removing the auction
            // before calling transfer(), and the only thing the seller
            // can DoS is the sale of their own asset! (And if it's an
            // accident, they can call cancelAuction(). )
            _winner.transfer(winnerProceeds);
            fighterIndexToOwner[championId].transfer(champCut);
        }

        // Battle has agreed to transfer lossing cat to winner
        if (battle.gameMode == 2) {
            fighterIndexToOwner[_losingCat] = _winner;
        }

        // Calculate any excess funds included with the bid. If the excess
        // is anything worth worrying about, transfer it back to bidder.
        // NOTE: We checked above that the bid amount is greater than or
        // equal to the price so this cannot underflow.
        uint256 bidExcess = _bidAmount - wager;

        // Return the funds. Similar to the previous transfer, this is
        // not susceptible to a re-entry attack because the auction is
        // removed before any transfers occur.
        msg.sender.transfer(bidExcess);

        // Tell the world!
        BattleSuccessful(_tokenId, wager, _winner);

        return wager;
    }

    /// @dev Removes an auction from the list of open auctions.
    /// @param _tokenId - ID of NFT on auction.
    function _removeBattle(uint256 _tokenId) internal {
        delete tokenIdToBattle[_tokenId];
    }

    function _level(uint256 _tokenId, uint8 _currLevel) internal {
        if(_currLevel == 0) {
            _currLevel = 1;
            battleKitties[_tokenId].level++;
        }

        require(msg.value >= _currLevel*1 ether);

        battleKitties[_tokenId].level++;
        battleKitties[_tokenId].basePower += battleKitties[_tokenId].basePower * battleKitties[_tokenId].level;

        if(battleKitties[_tokenId].basePower > battleKitties[championId].basePower) {
            championId = _tokenId;
        }

        LevelUp(_tokenId, _currLevel++);
    }

    // function _isReadyToBattle(Battle storage _battle) internal view returns (bool) {
    //     return (_battle.startedAt + _battle.duration > now);
    // }

    /// @dev Returns true if the NFT is on a battle offer.
    /// @param _tokenId - Battle to check.
    function _isOnBattle(uint256 _tokenId) internal view returns (bool) {
        Battle memory b = tokenIdToBattle[_tokenId];
        return (b.startedAt > 0);
    }

    function _isWithinPower(uint256 _tokenId1, uint256 _tokenId2, uint128 _battleRange) internal view returns (bool) {
        uint128 range;
        uint128 p1 = battleKitties[_tokenId1].basePower;
        uint128 p2 = battleKitties[_tokenId2].basePower;
        if(p1 > p2) {
            range = p1-p2;
        } else {
            range = p2-p1;
        }
        return (range <= _battleRange);
    }

    /// @dev Computes owner's cut of a sale.
    /// @param _price - Sale price of NFT.
    function _computeCut(uint256 _price, uint256 _cut) internal view returns (uint256) {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our entry functions carefully cap the maximum values for
        //  currency (at 128-bits), and ownerCut <= 10000 (see the require()
        //  statement in the ClockAuction constructor). The result of this
        //  function is always guaranteed to be <= _price.
        return _price * _cut / 10000;
    }

    /// Generates a random number from 0 to 100 based on the last block hash
    function _randomGen(uint256 seed) internal constant returns (uint256 randomNumber) {
        return(uint256(keccak256(block.blockhash(block.number-1), seed )));
    }


    function _getWinner(uint256 _initiatorCatID, uint256 _challengerCatID) internal view returns (uint256) {
        uint128 _p1 = battleKitties[_initiatorCatID].basePower;
        uint128 _p2 = battleKitties[_challengerCatID].basePower;

        uint256 _rand1 = _randomGen(uint64(now));
        uint256 _rand2 = _randomGen(_rand1)%100;
        _rand1 = _rand1%100;

        uint256 _t = (_p1 * _rand1)/100;
        uint256 _t2 = (_p2 * _rand2)/100;

        uint256 _score1 =  _p1 + _t;
        uint256 _score2 =  _p2 + _t2;

        score1 = _score1;
        score2 = _score2;
        rand1 = _rand1;
        rand2 = _rand2;

        uint256 _winner;

        require(_score1!=_score2);

        if(_score1 > _score2) {
            _winner = _initiatorCatID;
        } else {
            _winner = _challengerCatID;
        }

        return _winner;
    }

}
