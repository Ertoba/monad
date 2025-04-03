export interface Token {
  name: string
  symbol: string
  address: string | null
  decimals: number
  logoUrl?: string
  isNative?: boolean
}

export const SUPPORTED_TOKENS: Token[] = [
  {
    name: "Monad",
    symbol: "MON",
    address: null, // Native token has null address
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

export const DEFAULT_TOKENS: Token[] = [SUPPORTED_TOKENS[0]]

