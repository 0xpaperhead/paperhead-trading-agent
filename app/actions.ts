"use server"

import { PortfolioPosition, PerformanceDataPoint, AgentStats, TradedAsset, LogEntry } from "@/types/types"



// Mock data generators
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

export async function fetchAgentStats(): Promise<{
  success: boolean
  data: AgentStats
  error?: string
}> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

    const data: AgentStats = {
      status: "ACTIVE",
      uptime: "72h 14m",
      totalTrades: 1247,
      successRate: 94.2,
      totalProfit: 12456.78,
      averageVolume: 45892,
      tvl: 2847563
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      data: {
        status: "ERROR",
        uptime: "0h 0m",
        totalTrades: 0,
        successRate: 0,
        totalProfit: 0,
        averageVolume: 0,
        tvl: 0
      },
      error: error instanceof Error ? error.message : "Failed to fetch agent stats"
    }
  }
}

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

export async function fetchAgentLogs(limit: number = 10): Promise<{
  success: boolean
  data: LogEntry[]
  error?: string
}> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100))

    const logMessages = [
      { message: "Analyzing market conditions...", status: "INFO", type: "SKILL_USE" },
      { message: "Opportunity detected: ETH/USDC spread 0.23%", status: "WARNING", type: "SKILL_USE" },
      { message: "Executing trade: BUY 2.5 ETH @ $1,234.56", status: "INFO", type: "TRANSACTION" },
      { message: "Trade completed successfully", status: "SUCCESS", type: "TRANSACTION" },
      { message: "Portfolio rebalanced", status: "SUCCESS", type: "DEFAULT" },
      { message: "Profit realized: +$127.89", status: "SUCCESS", type: "TRANSACTION" },
      { message: "Monitoring next opportunity...", status: "INFO", type: "SKILL_USE" },
      { message: "Risk assessment updated", status: "INFO", type: "DEFAULT" },
      { message: "Price alert: BTC exceeded threshold", status: "WARNING", type: "DEFAULT" },
      { message: "Connection to DEX established", status: "SUCCESS", type: "DEFAULT" },
    ]

    const data: LogEntry[] = []

    for (let i = 0; i < limit; i++) {
      const randomLogData = logMessages[Math.floor(Math.random() * logMessages.length)]
      data.push({
        log_id: crypto.randomUUID(),
        status: randomLogData.status as LogEntry["status"],
        message: randomLogData.message,
        type: randomLogData.type as LogEntry["type"],
        created_at: new Date(Date.now() - i * 30000).toISOString(), // 30 seconds apart
      })
    }

    return {
      success: true,
      data: data.reverse() // Return chronologically
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch agent logs"
    }
  }
}