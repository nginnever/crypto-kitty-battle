/// @title SEKRETOOOO
contract PowerScience {
    bool public powerScience = true;
    /// @dev simply a boolean to indicate this is the contract we expect to be
    function isPowerScience() public pure returns (bool){
      return powerScience;
    }

    /// @dev 
    /// @param genes1 genes of cat
    function findPower(uint256 genes) public returns (uint256){
      // todo
    }
}