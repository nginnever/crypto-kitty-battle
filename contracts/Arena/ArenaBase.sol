pragma solidity ^0.4.11;


import '../token/ERC721.sol';
import './PowerScience.sol';

/// @title Auction Core
/// @dev Contains models, variables, and internal methods for the auction.
/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract ArenaBase {

    // Represents an auction on an NFT
    struct Battle {
        // Current owner of NFT
        address initiator;
        // initiator cat
        uint256 initiatorCatID
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
        uint256[] kitties;
    }

    struct KittyProfile {
        uint64 basePower;
        uint64 wins;
        uint64 losses;
        uint8 level;
        uint64 coolDown;
    }

    // Reference to contract tracking NFT ownership
    ERC721 public nonFungibleContract;

    // Reference to contract to determine base power
    PowerScience public powerScience;

    // Cut owner takes on each battle, measured in basis points (1/100 of a percent).
    // Values 0-10,000 map to 0%-100%
    uint256 public ownerCut = 1000;

    // Map from token ID to their corresponding auction.
    mapping (uint256 => Battle) tokenIdToBattle;

    mapping (address => Trainer) trainers;

    mapping (uint256 => KittyProfile) battleKitties;

    mapping (uint256 => address) public fighterIndexToOwner;


    event BattleCreated(uint256 tokenId, uint256 wagerPrice, uint256 duration);
    event BattleCancelled(uint256 tokenId);
    event ArenaEntered(uint256 tokenId);

    /// @dev Returns true if the claimant owns the token.
    /// @param _claimant - Address claiming to own the token.
    /// @param _tokenId - ID of token whose ownership to verify.
    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant);
    }

    function _calculateBasePower(uint256 _tokenId) internal returns(uint64) {
        // call to a contract to do secret calculation
        return 1337;
    }

    function _enterKitty(uint256 _tokenId) internal {
        _escrow(msg.sender, _tokenId);

        uint256 _power = _calculateBasePower(_tokenId);
        uint256[] _kitties;
        kitties.push(_tokenId);

        KittyProfile storage temp = battleKitties[_tokenId];

        if(temp.basePower == 0) {
            KittyProfile memory profile = KittyProfile(power,0,0,0,0);
            battleKitties[_tokenId] = profile;
        }
        temp.basePower = _power;
        battleKitties[_tokenId] = temp;
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

    /// @dev Adds an auction to the list of open auctions. Also fires the
    ///  AuctionCreated event.
    /// @param _tokenId The ID of the token to be put on auction.
    /// @param _auction Auction to add.
    function _addBattle(uint256 _tokenId, Battle _battle) internal {
        // Require that all auctions have a duration of
        // at least one minute. (Keeps our math from getting hairy!)
        require(_battle.duration >= 1 minutes);

        tokenIdToBattle[_tokenId] = _battle;

        BattleCreated(
            uint256(_tokenId),
            uint256(_battle.wagerPrice),
            uint256(_battle.duration)
        );
    }

    /// @dev Cancels an auction unconditionally.
    function _cancelBattle(uint256 _tokenId, address _initiator) internal {
        _removeBattle(_tokenId);
        BattleCancelled(_tokenId);
    }

    /// @dev Computes the price and transfers winnings.
    /// Does NOT transfer ownership of token.
    function _battle(uint256 _tokenId, uint256 _bidAmount)
        internal
        returns (uint256)
    {
        // Get a reference to the auction struct
        Battle storage battle = tokenIdToBattle[_tokenId];

        // Explicitly check that this battle is currently live.
        // (Because of how Ethereum mappings work, we can't just count
        // on the lookup above failing. An invalid _tokenId will just
        // return a battle object that is all zeros.)
        require(_isOnBattle(battle));

        // this was intended to allow time for betting
        // currently betting can't happen since a battle happens as soon
        // as there is a challenger
        require(_isReadyToBattle(battle));
        require(_isWithinPower(_tokenId, battle.initiatorCatID, battle.powerRange));

        // Check that the bid is greater than or equal to the current price
        uint256 price = battle.wagerPrice;
        require(_bidAmount >= price);

        uint256 _winner = _getWinner(battle.initiatorCatID, battle.challengerCatID);

        // Grab a reference to the seller before the auction struct
        // gets deleted.
        address initiator = battle.initiator;
        address challenger = msg.sender;

        // The bid is good! Remove the auction before sending the fees
        // to the sender so we can't have a reentrancy attack.
        _removeBattle(_tokenId);

        // Transfer proceeds to seller (if there are any!)
        if (price > 0) {
            // Calculate the auctioneer's cut.
            // (NOTE: _computeCut() is guaranteed to return a
            // value <= price, so this subtraction can't go negative.)
            uint256 auctioneerCut = _computeCut(price);
            uint256 sellerProceeds = price - auctioneerCut;

            // NOTE: Doing a transfer() in the middle of a complex
            // method like this is generally discouraged because of
            // reentrancy attacks and DoS attacks if the seller is
            // a contract with an invalid fallback function. We explicitly
            // guard against reentrancy attacks by removing the auction
            // before calling transfer(), and the only thing the seller
            // can DoS is the sale of their own asset! (And if it's an
            // accident, they can call cancelAuction(). )
            seller.transfer(sellerProceeds);
        }

        // Calculate any excess funds included with the bid. If the excess
        // is anything worth worrying about, transfer it back to bidder.
        // NOTE: We checked above that the bid amount is greater than or
        // equal to the price so this cannot underflow.
        uint256 bidExcess = _bidAmount - price;

        // Return the funds. Similar to the previous transfer, this is
        // not susceptible to a re-entry attack because the auction is
        // removed before any transfers occur.
        msg.sender.transfer(bidExcess);

        // Tell the world!
        AuctionSuccessful(_tokenId, price, msg.sender);

        return price;
    }

    /// @dev Removes an auction from the list of open auctions.
    /// @param _tokenId - ID of NFT on auction.
    function _removeBattle(uint256 _tokenId) internal {
        delete tokenIdToBattle[_tokenId];
    }

    function _isReadyToBattle(Battle storage _battle) internal view returns (bool) {
        return (_battle.startedAt + _battle.duration > now);
    }

    /// @dev Returns true if the NFT is on a battle offer.
    /// @param _battle - Battle to check.
    function _isOnBattle(Battle storage _battle) internal view returns (bool) {
        return (_battle.startedAt > 0);
    }

    function _isWithinPower(uint256 _tokenId1, uint256 _tokenId2, uint8 _battleRange) interal view returns (bool) {
        KittyProfile storage kp1 = battleKitties[_tokenId1];
        KittyProfile storage kp2 = battleKitties[_tokenId2];
        uint64 range;
        uint64 p1 = kp1.basePower;
        uint64 p2 = kp2.basePower;
        if(p1 > p2) {
            range = p1-p2;
        } else {
            range = p2-p1;
        }
        return (range <= _battleRange);
    }

    /// @dev Computes owner's cut of a sale.
    /// @param _price - Sale price of NFT.
    function _computeCut(uint256 _price) internal view returns (uint256) {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our entry functions carefully cap the maximum values for
        //  currency (at 128-bits), and ownerCut <= 10000 (see the require()
        //  statement in the ClockAuction constructor). The result of this
        //  function is always guaranteed to be <= _price.
        return _price * ownerCut / 10000;
    }

}
