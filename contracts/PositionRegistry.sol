// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

/// @title PositionRegistry
/// @notice On-chain bookkeeping so the UI can list the pools an account created.
contract PositionRegistry {
    struct Entry {
        address pool;
        address token0;
        address token1;
        uint24 fee;
        uint64 createdAt;
    }

    mapping(address => Entry[]) private _entries;

    event PositionRecorded(address indexed owner, address indexed pool, address token0, address token1, uint24 fee);

    function record(
        address pool,
        address token0,
        address token1,
        uint24 fee
    ) external {
        _entries[msg.sender].push(Entry(pool, token0, token1, fee, uint64(block.timestamp)));
        emit PositionRecorded(msg.sender, pool, token0, token1, fee);
    }

    function entriesOf(address owner) external view returns (Entry[] memory) {
        return _entries[owner];
    }

    function countOf(address owner) external view returns (uint256) {
        return _entries[owner].length;
    }
}
