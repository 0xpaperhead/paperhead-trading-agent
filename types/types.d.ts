
export type LogStatus = "SUCCESS" | "DANGER" | "WARNING" | "INFO" | "SECONDARY"
export type LogType = "TRANSACTION" | "SKILL_USE" | "ERROR" | "DEFAULT"


export interface PortfolioPosition {
    unique_token_identifier: string
    ecosystem_id: string
    position: number
    token_price: number
    relative_portfolio_allocation: number
    value: number
    image: string
    symbol: string
  }
  
  export interface PerformanceDataPoint {
    value: number
    timestamp: number
    portfolio_positions: PortfolioPosition[]
  }
  
  export interface AgentStats {
    status: string
    uptime: string
    totalTrades: number
    successRate: number
    totalProfit: number
    averageVolume: number
    tvl: number
  }
  
  export interface TradedAsset {
    name: string
    ticker: string
    allocation: number
    return: number
    tokenAddress: string
    image: string
  }
  
  export interface LogEntry {
    log_id: string
    status: LogStatus
    message: string
    type: LogType
    created_at: string
  }