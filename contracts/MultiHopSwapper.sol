// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

/// @title MultiHopSwapper
/// @notice Swaps along an arbitrary route. `tokens` has N entries and `fees`
///         has N-1 entries (one pool fee tier per hop).
contract MultiHopSwapper {
    ISwapRouter public immutable router;

    event RouteSwapped(address indexed trader, uint256 hops, uint256 amountIn, uint256 amountOut);

    constructor(ISwapRouter router_) {
        router = router_;
    }

    function swapExactIn(
        address[] calldata tokens,
        uint24[] calldata fees,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external returns (uint256 amountOut) {
        bytes memory path = _encodePath(tokens, fees, false);
        address tokenIn = tokens[0];

        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(tokenIn, address(router), amountIn);

        amountOut = router.exactInput(
            ISwapRouter.ExactInputParams({
                path: path,
                recipient: msg.sender,
                deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum: minAmountOut
            })
        );
        emit RouteSwapped(msg.sender, fees.length, amountIn, amountOut);
    }

    /// @dev `tokens` is given in the trade direction (in -> out); the path is
    ///      reversed internally because exact-output paths run backwards.
    function swapExactOut(
        address[] calldata tokens,
        uint24[] calldata fees,
        uint256 amountOut,
        uint256 maxAmountIn,
        uint256 deadline
    ) external returns (uint256 amountIn) {
        bytes memory path = _encodePath(tokens, fees, true);
        address tokenIn = tokens[0];

        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), maxAmountIn);
        TransferHelper.safeApprove(tokenIn, address(router), maxAmountIn);

        amountIn = router.exactOutput(
            ISwapRouter.ExactOutputParams({
                path: path,
                recipient: msg.sender,
                deadline: deadline,
                amountOut: amountOut,
                amountInMaximum: maxAmountIn
            })
        );

        if (amountIn < maxAmountIn) {
            TransferHelper.safeApprove(tokenIn, address(router), 0);
            // the contract owns the surplus, so it is a plain transfer, not transferFrom
            TransferHelper.safeTransfer(tokenIn, msg.sender, maxAmountIn - amountIn);
        }
        emit RouteSwapped(msg.sender, fees.length, amountIn, amountOut);
    }

    function _encodePath(
        address[] calldata tokens,
        uint24[] calldata fees,
        bool reverse
    ) private pure returns (bytes memory path) {
        require(tokens.length >= 2 && fees.length == tokens.length - 1, "bad route");
        uint256 n = tokens.length;
        if (!reverse) {
            path = abi.encodePacked(tokens[0]);
            for (uint256 i = 0; i < fees.length; i++) {
                path = abi.encodePacked(path, fees[i], tokens[i + 1]);
            }
        } else {
            path = abi.encodePacked(tokens[n - 1]);
            for (uint256 i = fees.length; i > 0; i--) {
                path = abi.encodePacked(path, fees[i - 1], tokens[i - 1]);
            }
        }
    }
}
