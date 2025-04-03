// Token addresses on Monad Testnet
export const MONAD_CHAIN_ID = "0x279f" // 10143 in hex (lowercase for consistent comparison)
export const USDT_ADDRESS = "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D"
export const USDC_ADDRESS = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea"
export const MONAD_SWAP_CONTRACT = "0xD1E7F0D2a76defDa10e51be9aDCbaA87dDe64D08"
export const BRIDGE_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// Network configuration with improved RPC URLs
export const MONAD_NETWORK = {
  chainId: "0x279f",
  chainName: "Monad Testnet",
  rpcUrls: ["https://testnet-rpc.monad.xyz/", "https://rpc.ankr.com/monad_testnet", "https://rpc.zerion.io/monad"],
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  blockExplorerUrls: ["https://explorer.testnet.monad.xyz"],
}

// Standard ERC20 Token ABI - this is what user provided
export const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
]

// Updated SWAP CONTRACT ABI - adjusting based on likely contract implementation
export const SWAP_CONTRACT_ABI = [
  // Core swap functions
  "function swapMONforToken(address token, uint256 minAmountOut) external payable",
  "function swapTokenforMON(address token, uint256 amount, uint256 minAmountOut) external",
  // Alternative function signatures to try
  "function swapMONtoToken(address token, uint256 minAmountOut) external payable",
  "function swapTokenToMON(address token, uint256 amount, uint256 minAmountOut) external",
  // Utility functions
  "function getTokenBalance(address token) external view returns (uint256)",
  "function getReserve(address token) external view returns (uint256)",
]

export const BRIDGE_ABI = ["function bridge(uint256 sourceChainId) external payable"]

export const SUPPORTED_TOKENS = [
  {
    name: "Monad",
    symbol: "MON",
    address: null,
    decimals: 18,
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7260-JTBCM5BkQ3DxScsUPi3el25ESTH8Vy.jpeg",
    isNative: true,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    decimals: 6,
    logoUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
    decimals: 6,
    logoUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  },
]

