"use server"

import { TradedAsset } from "@/types/types"

export async function fetchTradedAssets(): Promise<{
  success: boolean
  data: TradedAsset[]
  error?: string
}> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

    const data: TradedAsset[] = [
      {
        name: "Bitcoin",
        ticker: "BTC",
        allocation: 45.2,
        return: 12.5 + (Math.random() - 0.5) * 5, // Add some randomness
        tokenAddress: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/640px-Bitcoin.svg.png",
      },
      {
        name: "Ethereum",
        ticker: "ETH",
        allocation: 32.1,
        return: 8.2 + (Math.random() - 0.5) * 4,
        tokenAddress: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/640px-Ethereum-icon-purple.svg.png",
      },
      {
        name: "Solana",
        ticker: "SOL",
        allocation: 18.7,
        return: -2.1 + (Math.random() - 0.5) * 3,
        tokenAddress: "So11111111111111111111111111111111111111112",
        image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
      },
      {
        name: "USD Coin",
        ticker: "USDC",
        allocation: 4.0,
        return: 0 + (Math.random() - 0.5) * 0.1,
        tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/640px-Circle_USDC_Logo.svg.png",
      },
    ]

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch traded assets"
    }
  }
} 