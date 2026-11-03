// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

/// @title LiquidityManager
/// @notice Holds Uniswap V3 position NFTs on behalf of users and exposes
///         mint / increase / decrease / collect for a configurable token pair.
contract LiquidityManager is IERC721Receiver {
    INonfungiblePositionManager public immutable positionManager;
    address public immutable token0;
    address public immutable token1;
    uint24 public immutable fee;

    struct Deposit {
        address owner;
        uint128 liquidity;
    }

    /// @dev tokenId => deposit
    mapping(uint256 => Deposit) public deposits;

    event Minted(address indexed owner, uint256 indexed tokenId, uint128 liquidity);

    constructor(
        INonfungiblePositionManager positionManager_,
        address token0_,
        address token1_,
        uint24 fee_
    ) {
        require(token0_ < token1_, "token order");
        positionManager = positionManager_;
        token0 = token0_;
        token1 = token1_;
        fee = fee_;
    }

    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        require(msg.sender == address(positionManager), "not a position");
        (, , , , , , , uint128 liquidity, , , , ) = positionManager.positions(tokenId);
        deposits[tokenId] = Deposit(from, liquidity);
        return IERC721Receiver.onERC721Received.selector;
    }

    /// @notice Full-range mint funded by the caller.
    function mintFullRange(uint256 amount0, uint256 amount1)
        external
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 used0,
            uint256 used1
        )
    {
        TransferHelper.safeTransferFrom(token0, msg.sender, address(this), amount0);
        TransferHelper.safeTransferFrom(token1, msg.sender, address(this), amount1);
        TransferHelper.safeApprove(token0, address(positionManager), amount0);
        TransferHelper.safeApprove(token1, address(positionManager), amount1);

        int24 spacing = _spacing();
        (tokenId, liquidity, used0, used1) = positionManager.mint(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: fee,
                tickLower: (TickMath.MIN_TICK / spacing) * spacing,
                tickUpper: (TickMath.MAX_TICK / spacing) * spacing,
                amount0Desired: amount0,
                amount1Desired: amount1,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            })
        );
        deposits[tokenId] = Deposit(msg.sender, liquidity);
        emit Minted(msg.sender, tokenId, liquidity);

        _refund(token0, amount0, used0);
        _refund(token1, amount1, used1);
    }

    function collectFees(uint256 tokenId) external returns (uint256 amount0, uint256 amount1) {
        require(deposits[tokenId].owner == msg.sender, "not owner");
        (amount0, amount1) = positionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: msg.sender,
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );
    }

    function decrease(uint256 tokenId, uint128 liquidity) external returns (uint256 amount0, uint256 amount1) {
        require(deposits[tokenId].owner == msg.sender, "not owner");
        (amount0, amount1) = positionManager.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: liquidity,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            })
        );
        deposits[tokenId].liquidity -= liquidity;
    }

    function _spacing() private view returns (int24) {
        if (fee == 100) return 1;
        if (fee == 500) return 10;
        if (fee == 3000) return 60;
        return 200;
    }

    function _refund(
        address token,
        uint256 offered,
        uint256 used
    ) private {
        if (used < offered) {
            TransferHelper.safeApprove(token, address(positionManager), 0);
            TransferHelper.safeTransfer(token, msg.sender, offered - used);
        }
    }
}
