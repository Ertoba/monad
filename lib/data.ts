export interface Chain {
  id: number
  name: string
  icon: string
  nativeCurrency: string
  rpcUrl: string
  explorerUrl: string
  isSource?: boolean
  isDestination?: boolean
}

export interface Token {
  name: string
  symbol: string
  address: string
  decimals: number
  logoUrl: string
  conversionRate?: number
}

// Chain data
export const chains: Chain[] = [
  {
    id: 11155111,
    name: "Sepolia",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ethereum-eth-uYIQhaoF8tusAdI4bFGaoBD4xjLjlL.svg",
    nativeCurrency: "ETH",
    rpcUrl: "https://sepolia.infura.io/v3/your-api-key",
    explorerUrl: "https://sepolia.etherscan.io",
    isSource: true,
  },
  {
    id: 84532,
    name: "Base Sepolia",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7254-f53sZ3waecHULkx1v6TGtoko5p4u12.png",
    nativeCurrency: "ETH",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    isSource: true,
  },
  {
    id: 10383, // Decimal representation of 0x289F
    name: "Monad",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7260-JTBCM5BkQ3DxScsUPi3el25ESTH8Vy.jpeg",
    nativeCurrency: "MON",
    rpcUrl: "https://rpc.testnet.monad.xyz/",
    explorerUrl: "https://explorer.testnet.monad.xyz",
    isDestination: true,
  },
]

// Token data
export const tokens: Token[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ethereum-eth-uYIQhaoF8tusAdI4bFGaoBD4xjLjlL.svg",
    conversionRate: 6, // 1 ETH = 6 MON
  },
  {
    name: "Monad",
    symbol: "MON",
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7260-JTBCM5BkQ3DxScsUPi3el25ESTH8Vy.jpeg",
  },
]

