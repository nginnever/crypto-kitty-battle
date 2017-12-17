/// @title SEKRETOOOO
contract PowerScienceInterface {
    /// @dev simply a boolean to indicate this is the contract we expect to be
    function isPowerScience() public pure returns (bool);

    /// @dev 
    /// @param genes1 genes of cat
    function findPower(uint256 genes) public returns (uint256);
}