import './PowerScienceInterface.sol';

/// @title SEKRETOOOO
contract PowerScience is PowerScienceInterface {
    bool public powerScience = true;
    /// @dev simply a boolean to indicate this is the contract we expect to be
    function isPowerScience() public view returns (bool){
      return powerScience;
    }

    /// @dev 
    /// @param genes genes of cat
    function findPower(uint256 genes) public returns (uint256){
      // todo
    }
}