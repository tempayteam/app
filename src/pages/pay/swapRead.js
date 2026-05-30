const { ethers } = require("ethers");

// Connect to an Ethereum provider (e.g., Infura or Alchemy)


export async function getSingleHopQuote(tokenIn, tokenOut, fee, amountIn) {

    // try {
    //     const jsonRpcUrl = "https://mainnet.infura.io/v3/2NJUckpejJ9HvuCQzPNu4N3HkHn";  // Example URL, replace with your provider URL

    //     // Initialize JSON-RPC provider
    //     const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
    //     // const provider = new ethers.providers.InfuraProvider("mainnet", "2NJUckpejJ9HvuCQzPNu4N3HkHn");
    //     provider.getBlockNumber().then(console.log).catch(console.error);
    //     // Define the QuoterV2 contract address and ABI

    //     const POOL_FACTORY_CONTRACT_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
    //     const currentPoolAddress = computePoolAddress({
    //         factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    //         tokenA: CurrentConfig.tokens.in,
    //         tokenB: CurrentConfig.tokens.out,
    //         fee: CurrentConfig.tokens.poolFee,
    //     })



    // } catch (error) {
    //     console.log("Error fetching quote:", error);
    // }
}

// Example usage:
// const tokenIn = "0xYourTokenInAddress";  // Replace with actual tokenIn address
// const tokenOut = "0xYourTokenOutAddress";  // Replace with actual tokenOut address
// const fee = 3000;  // 0.3% fee tier
// const amountIn = ethers.utils.parseUnits("1", 18);  // 1 tokenIn in wei


