"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Terminal,
  TrendingUp,
  Bot,
  Wallet,
  ArrowUpDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Circle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
} from "lucide-react"
import { TradingChart } from "@/components/trading-chart"
import {
  fetchPerformanceData,
  fetchAgentStats,
  fetchTradedAssets,
  fetchAgentLogs,
  depositToAgent,
  withdrawFromAgent
} from "./actions"
import { PerformanceDataPoint, AgentStats, TradedAsset, LogEntry } from "@/types/types"

function truncateAddress(address: string): string {
  return `${address.slice(0, 5)}••••${address.slice(-5)}`
}

export default function CryptoTraderMatrix() {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([])
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null)
  const [tradedAssets, setTradedAssets] = useState<TradedAsset[]>([])
  const [depositAmount, setDepositAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [timeRange, setTimeRange] = useState("7d")

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        // Fetch all data in parallel
        const [performanceRes, statsRes, assetsRes, logsRes] = await Promise.all([
          fetchPerformanceData(timeRange),
          fetchAgentStats(),
          fetchTradedAssets(),
          fetchAgentLogs(10)
        ])

        if (performanceRes.success) {
          setPerformanceData(performanceRes.data)
        }

        if (statsRes.success) {
          setAgentStats(statsRes.data)
        }

        if (assetsRes.success) {
          setTradedAssets(assetsRes.data)
        }

        if (logsRes.success) {
          setLogs(logsRes.data)
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [timeRange])

  // Periodic updates for logs and assets
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Fetch fresh logs and assets
        const [logsRes, assetsRes] = await Promise.all([
          fetchAgentLogs(10),
          fetchTradedAssets()
        ])

        if (logsRes.success) {
          setLogs(logsRes.data)
        }

        if (assetsRes.success) {
          setTradedAssets(assetsRes.data)
        }
      } catch (error) {
        console.error("Error updating data:", error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || isDepositing) return

    setIsDepositing(true)
    try {
      const result = await depositToAgent(parseFloat(depositAmount))

      if (result.success) {
        setDepositAmount("")
        // Add success log
        const newLog: LogEntry = {
          log_id: crypto.randomUUID(),
          status: "SUCCESS",
          message: result.message,
          type: "TRANSACTION",
          created_at: new Date().toISOString(),
        }
        setLogs(prev => [...prev, newLog].slice(-10))
      } else {
        // Add error log
        const newLog: LogEntry = {
          log_id: crypto.randomUUID(),
          status: "DANGER",
          message: result.error || "Deposit failed",
          type: "ERROR",
          created_at: new Date().toISOString(),
        }
        setLogs(prev => [...prev, newLog].slice(-10))
      }
    } catch (error) {
      console.error("Deposit error:", error)
    } finally {
      setIsDepositing(false)
    }
  }

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!depositAmount || isWithdrawing) return

    setIsWithdrawing(true)
    try {
      const result = await withdrawFromAgent(parseFloat(depositAmount))

      if (result.success) {
        setDepositAmount("")
        // Add success log
        const newLog: LogEntry = {
          log_id: crypto.randomUUID(),
          status: "SUCCESS",
          message: result.message,
          type: "TRANSACTION",
          created_at: new Date().toISOString(),
        }
        setLogs(prev => [...prev, newLog].slice(-10))
      } else {
        // Add error log
        const newLog: LogEntry = {
          log_id: crypto.randomUUID(),
          status: "DANGER",
          message: result.error || "Withdrawal failed",
          type: "ERROR",
          created_at: new Date().toISOString(),
        }
        setLogs(prev => [...prev, newLog].slice(-10))
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const chartLayoutOptions = {
    background: {
      color: "transparent",
    },
    textColor: "#22c55e",
  }

  const chartOptions = {
    grid: {
      vertLines: { color: "#22c55e", style: 1, visible: true },
      horzLines: { color: "#22c55e", style: 1, visible: true },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: "#22c55e",
    },
    timeScale: {
      borderColor: "#22c55e",
      timeVisible: true,
    },
  }

  const timeRanges = ["24h", "7d", "1M", "3M", "1Y", "Max"]

  return (
    <>
      {/* Matrix Grid Background */}
      <div className="matrix-rain"></div>

      <div className="min-h-screen text-green-400 font-mono p-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-green-300 mb-2 tracking-wider">$paperhead trading agent</h1>
            <p className="text-green-500">AUTONOMOUS TRADING AGENT v0.1</p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
            {/* Left Column - Performance Graph and Terminal */}
            <div className="lg:col-span-2 space-y-4">
              {/* Performance Graph */}
              <Card className="bg-black/80 border-green-500 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    PERFORMANCE GRAPH
                  </CardTitle>
                  <p className="text-green-500 text-sm">
                    Only mock data is shown.
                  </p>
                </CardHeader>
                <CardContent className="p-0 h-full pt-4 overflow-hidden">
                  {isLoading ? (
                    <div className="flex items-center justify-center text-center text-green-500 h-52 animate-pulse">
                      <span className="text-center">
                        Loading performance data...
                      </span>
                    </div>
                  ) : (
                    <TradingChart
                      data={performanceData}
                      timeRange={timeRange}
                      onTimeRangeChange={setTimeRange}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Terminal Logs */}
              <Card className="bg-black/80 border-green-500 border-2 h-1/2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    AGENT TERMINAL
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] min-h-[200px] p-4 overflow-hidden flex flex-col">
                  <div className="bg-black rounded p-4 flex-1 overflow-y-auto">
                    {logs.map((log) => {
                      const statusIcons = {
                        SUCCESS: <CheckCircle className="w-4 h-4 text-green-400" />,
                        DANGER: <XCircle className="w-4 h-4 text-red-400" />,
                        WARNING: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
                        INFO: <Info className="w-4 h-4 text-blue-400" />,
                        SECONDARY: <Circle className="w-4 h-4 text-gray-400" />,
                      }

                      const typeIcons = {
                        TRANSACTION: <ArrowUpDown className="w-4 h-4 text-green-500" />,
                        SKILL_USE: <Bot className="w-4 h-4 text-purple-400" />,
                        ERROR: <AlertCircle className="w-4 h-4 text-red-500" />,
                        DEFAULT: <Terminal className="w-4 h-4 text-green-500" />,
                      }

                      const statusColors = {
                        SUCCESS: "bg-green-900/20 border-green-500/30",
                        DANGER: "bg-red-900/20 border-red-500/30",
                        WARNING: "bg-yellow-900/20 border-yellow-500/30",
                        INFO: "bg-blue-900/20 border-blue-500/30",
                        SECONDARY: "bg-gray-900/20 border-gray-500/30",
                      }

                      return (
                        <div
                          key={log.log_id}
                          className={`flex items-center gap-3 p-2 mb-2 rounded border ${statusColors[log.status]} hover:bg-opacity-30 transition-all duration-200`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {statusIcons[log.status]}
                            {typeIcons[log.type]}
                            <span className="text-green-600 text-xs min-w-fit">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                            <span className="text-green-300 text-sm truncate">{log.message}</span>
                          </div>
                        </div>
                      )
                    })}
                    <div className="text-green-400 animate-pulse mt-2">█</div>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-green-700/30">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-green-500 text-green-400 hover:bg-green-900/20"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-green-500 text-xs">Page 1 of 1</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-green-500 text-green-400 hover:bg-green-900/20"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-green-500 text-green-400 hover:bg-green-900/20"
                        onClick={() => fetchAgentLogs(10).then(res => res.success && setLogs(res.data))}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <span className="text-green-600 text-xs">{logs.length} logs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Agent Info */}
              <Card className="bg-black/80 border-green-500 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AGENT PROFILE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agentStats ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-green-500">Status:</span>
                        <Badge className="bg-green-900 text-green-300 border-green-500">{agentStats.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Uptime:</span>
                        <span className="text-green-300">{agentStats.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Total Trades:</span>
                        <span className="text-green-300">{agentStats.totalTrades.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Success Rate:</span>
                        <span className="text-green-300">{agentStats.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Total Profit:</span>
                        <span className="text-green-300">+${agentStats.totalProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Average Volume:</span>
                        <span className="text-green-300">${agentStats.averageVolume.toLocaleString()}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">TVL:</span>
                        <span className="text-green-300">${agentStats.tvl.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-green-500">Loading stats...</div>
                  )}
                </CardContent>
              </Card>

              {/* Swapper UI */}
              <Card className="bg-black/80 border-green-500 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5" />
                    DEPOSIT INTERFACE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-green-500 text-sm mb-2 block">Amount ($PAPERHEAD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-gray-900/90 border-green-500 text-green-300 placeholder-green-600"
                      disabled={isDepositing || isWithdrawing}
                    />
                  </div>
                  <Button
                    className="w-full bg-green-900 hover:bg-green-800 text-green-300 border border-green-500"
                    onClick={handleDeposit}
                    disabled={isDepositing || isWithdrawing || !depositAmount}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isDepositing ? "DEPOSITING..." : "DEPOSIT TO AGENT"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-orange-300 border-green-500 text-green-700 hover:bg-green-900 hover:text-green-300"
                    onClick={handleWithdraw}
                    disabled={isDepositing || isWithdrawing || !depositAmount}
                  >
                    {isWithdrawing ? "WITHDRAWING..." : "WITHDRAW FUNDS"}
                  </Button>
                </CardContent>
              </Card>

              {/* Traded Assets */}
              <Card className="bg-black/80 border-green-500 border-2 flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    CURRENT ASSETS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tradedAssets.map((asset, index) => (
                    <div key={index} className="border border-green-700 rounded p-3 bg-black">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={asset.image || "/placeholder.svg"}
                          alt={asset.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-green-300 font-bold">{asset.ticker}</span>
                            <span
                              className={`text-sm ${asset.return > 0 ? "text-green-400" : asset.return < 0 ? "text-red-400" : "text-gray-400"}`}
                            >
                              {asset.return > 0 ? "+" : ""}
                              {asset.return.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-sm text-green-500">{asset.name}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Allocation:</span>
                          <span className="text-green-400">{asset.allocation}%</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">Address:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-mono">{truncateAddress(asset.tokenAddress)}</span>
                            <a
                              href={`https://birdeye.so/token/${asset.tokenAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-300 transition-colors"
                              title="View on Birdeye"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://dexscreener.com/solana/${asset.tokenAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-300 transition-colors"
                              title="View on Dex Screener"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div >
        </div >
      </div >
    </>
  )
}