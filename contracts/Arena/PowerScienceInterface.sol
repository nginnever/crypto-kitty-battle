/// @title SEKRETOOOO
contract PowerScienceInterface {
    /// @dev simply a boolean to indicate this is the contract we expect to be
    function isPowerScience() public view returns (bool);

    /// @dev 
    /// @param genes genes of cat
    function findPower(uint256 genes, uint256 generation, uint256 coolDown) public returns (uint256);
}