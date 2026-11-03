// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

/// @title SingleHopSwapper
/// @notice Pulls tokens from the caller, swaps through one pool of the
///         Uniswap V3 router and sends the result straight back to the caller.
contract SingleHopSwapper {
    ISwapRouter public immutable router;

    event Swapped(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(ISwapRouter router_) {
        router = router_;
    }

    /// @param minAmountOut slippage guard: the router reverts below this value.
    function swapExactIn(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external returns (uint256 amountOut) {
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(tokenIn, address(router), amountIn);

        amountOut = router.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: msg.sender,
                deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum: minAmountOut,
                sqrtPriceLimitX96: 0
            })
        );
        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /// @param maxAmountIn the caller funds up to this amount; the surplus is refunded.
    function swapExactOut(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountOut,
        uint256 maxAmountIn,
        uint256 deadline
    ) external returns (uint256 amountIn) {
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), maxAmountIn);
        TransferHelper.safeApprove(tokenIn, address(router), maxAmountIn);

        amountIn = router.exactOutputSingle(
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: msg.sender,
                deadline: deadline,
                amountOut: amountOut,
                amountInMaximum: maxAmountIn,
                sqrtPriceLimitX96: 0
            })
        );

        if (amountIn < maxAmountIn) {
            TransferHelper.safeApprove(tokenIn, address(router), 0);
            TransferHelper.safeTransfer(tokenIn, msg.sender, maxAmountIn - amountIn);
        }
        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
}
