"use server"

import { PortfolioPosition, PerformanceDataPoint } from "@/types/types"

// Mock data generator for portfolio positions
const generatePortfolioPositions = (): PortfolioPosition[] => [
  {
    unique_token_identifier: "btc",
    ecosystem_id: "bitcoin",
    position: 0.452,
    token_price: 45000,
    relative_portfolio_allocation: 45.2,
    value: 127580,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/640px-Bitcoin.svg.png",
    symbol: "BTC"
  },
  {
    unique_token_identifier: "eth",
    ecosystem_id: "ethereum",
    position: 12.5,
    token_price: 2800,
    relative_portfolio_allocation: 32.1,
    value: 90768,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/640px-Ethereum-icon-purple.svg.png",
    symbol: "ETH"
  },
  {
    unique_token_identifier: "sol",
    ecosystem_id: "solana",
    position: 320,
    token_price: 65,
    relative_portfolio_allocation: 18.7,
    value: 52832,
    image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    symbol: "SOL"
  },
  {
    unique_token_identifier: "usdc",
    ecosystem_id: "ethereum",
    position: 11300,
    token_price: 1,
    relative_portfolio_allocation: 4.0,
    value: 11300,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/640px-Circle_USDC_Logo.svg.png",
    symbol: "USDC"
  }
]

const generatePerformanceData = (timeRange: string, startTimestamp?: number): PerformanceDataPoint[] => {
  const now = Date.now()
  const points: PerformanceDataPoint[] = []

  // Determine the time range and interval
  let days: number
  let interval: number // in milliseconds

  switch (timeRange) {
    case "24h":
      days = 1
      interval = 5 * 60 * 1000 // 5 minutes
      break
    case "7d":
      days = 7
      interval = 30 * 60 * 1000 // 30 minutes
      break
    case "1M":
      days = 30
      interval = 2 * 60 * 60 * 1000 // 2 hours
      break
    case "3M":
      days = 90
      interval = 6 * 60 * 60 * 1000 // 6 hours
      break
    case "1Y":
      days = 365
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    case "Max":
    default:
      days = 730 // 2 years
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
  }

  // Calculate proper time range - start from past, end at present
  const endTime = startTimestamp ? startTimestamp * 1000 : now
  const startTime = endTime - (days * 24 * 60 * 60 * 1000)

  // Generate realistic performance data with some volatility
  let baseValue = 100000 // Starting portfolio value
  let currentValue = baseValue

  // Generate points from past to present
  for (let timestamp = startTime; timestamp <= endTime; timestamp += interval) {
    // Add some realistic market volatility
    const volatility = 0.02 // 2% max change per interval
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    const trendFactor = 0.0001 // Slight upward trend over time

    currentValue *= (1 + randomChange + trendFactor)

    // Ensure we're creating proper unix timestamps in seconds
    const unixTimestamp = Math.floor(timestamp / 1000)

    points.push({
      value: Math.round(currentValue),
      timestamp: unixTimestamp, // This should be a proper unix timestamp in seconds
      portfolio_positions: generatePortfolioPositions()
    })
  }

  console.log("Generated points sample:", points.slice(0, 3).map(p => ({
    timestamp: p.timestamp,
    value: p.value,
    portfolio_positions: JSON.stringify(p.portfolio_positions)
  })))

  return points // Already in chronological order
}

export async function fetchPerformanceData(timeRange: string = "7d"): Promise<{
  success: boolean
  data: PerformanceDataPoint[]
  error?: string
}> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    const data = generatePerformanceData(timeRange)

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch performance data"
    }
  }
} 