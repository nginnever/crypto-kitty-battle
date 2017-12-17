pragma solidity ^0.4.11;


/// @title Base contract for CryptoKitties. Holds all common structs, events and base variables.
/// @author Axiom Zen (https://www.axiomzen.co)
/// @dev See the KittyCore contract documentation to understand how the various contract facets are arranged.
contract Test {
  uint256 public newKittenId;
  uint256 public under = uint256(-1);

  struct Kitty {
      // The Kitty's genetic code is packed into these 256-bits, the format is
      // sooper-sekret! A cat's genes never change.
      uint256 genes;

      // The timestamp from the block when this cat came into existence.
      uint64 birthTime;

      // The minimum timestamp after which this cat can engage in breeding
      // activities again. This same timestamp is used for the pregnancy
      // timer (for matrons) as well as the siring cooldown.
      uint64 cooldownEndBlock;

      // The ID of the parents of this kitty, set to 0 for gen0 cats.
      // Note that using 32-bit unsigned integers limits us to a "mere"
      // 4 billion cats. This number might seem small until you realize
      // that Ethereum currently has a limit of about 500 million
      // transactions per year! So, this definitely won't be a problem
      // for several years (even as Ethereum learns to scale).
      uint32 matronId;
      uint32 sireId;

      // Set to the ID of the sire cat for matrons that are pregnant,
      // zero otherwise. A non-zero value here is how we know a cat
      // is pregnant. Used to retrieve the genetic material for the new
      // kitten when the birth transpires.
      uint32 siringWithId;

      // Set to the index in the cooldown array (see below) that represents
      // the current cooldown duration for this Kitty. This starts at zero
      // for gen0 cats, and is initialized to floor(generation/2) for others.
      // Incremented by one for each successful breeding action, regardless
      // of whether this cat is acting as matron or sire.
      uint16 cooldownIndex;

      // The "generation number" of this cat. Cats minted by the CK contract
      // for sale are called "gen0" and have a generation number of 0. The
      // generation number of all other cats is the larger of the two generation
      // numbers of their parents, plus one.
      // (i.e. max(matron.generation, sire.generation) + 1)
      uint16 generation;
  }

  Kitty[] kitties;

   function test() {
      Kitty memory _kitty = Kitty({
          genes: uint256(-1),
          birthTime: uint64(now),
          cooldownEndBlock: 0,
          matronId: uint32(0),
          sireId: uint32(0),
          siringWithId: 0,
          cooldownIndex: 1,
          generation: uint16(0)
      });
      kitties.push(_kitty);
      newKittenId = kitties.push(_kitty);
   }

}
