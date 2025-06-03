"use server"

import { LogEntry } from "@/types/types"

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