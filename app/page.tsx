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
import { Chart, Series } from "@/components/trading-chart"

const performanceData = [
  { time: "2024-01-01", value: 100 },
  { time: "2024-01-02", value: 125 },
  { time: "2024-01-03", value: 110 },
  { time: "2024-01-04", value: 145 },
  { time: "2024-01-05", value: 160 },
  { time: "2024-01-06", value: 175 },
  { time: "2024-01-07", value: 190 },
]

const tradedAssets = [
  {
    name: "Bitcoin",
    ticker: "BTC",
    allocation: 45.2,
    return: 12.5,
    tokenAddress: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/640px-Bitcoin.svg.png",
  },
  {
    name: "Ethereum",
    ticker: "ETH",
    allocation: 32.1,
    return: 8.2,
    tokenAddress: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/640px-Ethereum-icon-purple.svg.png",
  },
  {
    name: "Solana",
    ticker: "SOL",
    allocation: 18.7,
    return: -2.1,
    tokenAddress: "So11111111111111111111111111111111111111112",
    image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
  },
  {
    name: "USD Coin",
    ticker: "USDC",
    allocation: 4.0,
    return: 0,
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/640px-Circle_USDC_Logo.svg.png",
  },
]

function truncateAddress(address: string): string {
  return `${address.slice(0, 5)}••••${address.slice(-5)}`
}

export default function CryptoTraderMatrix() {
  const [logs, setLogs] = useState([
    {
      log_id: crypto.randomUUID(),
      status: "INFO",
      message: "MATRIX TRADER AGENT v2.1 INITIALIZED",
      type: "DEFAULT",
      created_at: new Date().toISOString(),
    },
    {
      log_id: crypto.randomUUID(),
      status: "INFO",
      message: "Connecting to blockchain networks...",
      type: "DEFAULT",
      created_at: new Date().toISOString(),
    },
    {
      log_id: crypto.randomUUID(),
      status: "SUCCESS",
      message: "ETH network: CONNECTED",
      type: "DEFAULT",
      created_at: new Date().toISOString(),
    },
    {
      log_id: crypto.randomUUID(),
      status: "SUCCESS",
      message: "SOL network: CONNECTED",
      type: "DEFAULT",
      created_at: new Date().toISOString(),
    },
    {
      log_id: crypto.randomUUID(),
      status: "SUCCESS",
      message: "BTC network: CONNECTED",
      type: "DEFAULT",
      created_at: new Date().toISOString(),
    },
    {
      log_id: crypto.randomUUID(),
      status: "SUCCESS",
      message: "Agent status: ACTIVE",
      type: "DEFAULT",
      created_at: new Date().toISOString(),
    },
    {
      log_id: crypto.randomUUID(),
      status: "INFO",
      message: "Scanning for arbitrage opportunities...",
      type: "SKILL_USE",
      created_at: new Date().toISOString(),
    },
  ])

  const [depositAmount, setDepositAmount] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      const newLogMessages = [
        { message: "Analyzing market conditions...", status: "INFO", type: "SKILL_USE" },
        { message: "Opportunity detected: ETH/USDC spread 0.23%", status: "WARNING", type: "SKILL_USE" },
        { message: "Executing trade: BUY 2.5 ETH @ $1,234.56", status: "INFO", type: "TRANSACTION" },
        { message: "Trade completed successfully", status: "SUCCESS", type: "TRANSACTION" },
        { message: "Portfolio rebalanced", status: "SUCCESS", type: "DEFAULT" },
        { message: "Profit realized: +$127.89", status: "SUCCESS", type: "TRANSACTION" },
        { message: "Monitoring next opportunity...", status: "INFO", type: "SKILL_USE" },
      ]

      setLogs((prev) => {
        const randomLogData = newLogMessages[Math.floor(Math.random() * newLogMessages.length)]
        const newLog = {
          log_id: crypto.randomUUID(),
          status: randomLogData.status,
          message: randomLogData.message,
          type: randomLogData.type,
          created_at: new Date().toISOString(),
        }
        const updated = [...prev, newLog]
        return updated.slice(-10) // Keep only last 10 logs
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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

  return (
    <>
      {/* Matrix Grid Background */}
      <div className="matrix-rain"></div>

      <div className="min-h-screen text-green-400 font-mono p-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-green-300 mb-2 tracking-wider">MATRIX CRYPTO TRADER</h1>
            <p className="text-green-500">AUTONOMOUS TRADING AGENT v2.1</p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
            {/* Left Column - Performance Graph and Terminal */}
            <div className="lg:col-span-2 space-y-4">
              {/* Performance Graph */}
              <Card className="bg-black/80 border-green-500 border-2 h-1/2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    PERFORMANCE MATRIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] min-h-[200px] p-4 overflow-hidden">
                  <div className="w-full h-full border border-green-700/30 rounded">
                    <Chart layout={chartLayoutOptions} {...chartOptions}>
                      <Series
                        type="area"
                        data={performanceData}
                        color="#00ff41"
                        lineColor="#00ff41"
                        topColor="rgba(0, 255, 65, 0.4)"
                        bottomColor="rgba(0, 255, 65, 0.0)"
                        lineWidth={2}
                      />
                    </Chart>
                  </div>
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
                  <div className="bg-gray-900/90 border border-green-500 rounded p-4 flex-1 overflow-y-auto">
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
                  <div className="flex justify-between">
                    <span className="text-green-500">Status:</span>
                    <Badge className="bg-green-900 text-green-300 border-green-500">ACTIVE</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500">Uptime:</span>
                    <span className="text-green-300">72h 14m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500">Total Trades:</span>
                    <span className="text-green-300">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500">Success Rate:</span>
                    <span className="text-green-300">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500">Total Profit:</span>
                    <span className="text-green-300">+$12,456.78</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500">Average Volume:</span>
                    <span className="text-green-300">$45,892/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500">TVL:</span>
                    <span className="text-green-300">$2,847,563</span>
                  </div>
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
                    <label className="text-green-500 text-sm mb-2 block">Amount (USDC)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-gray-900/90 border-green-500 text-green-300 placeholder-green-600"
                    />
                  </div>
                  <Button className="w-full bg-green-900 hover:bg-green-800 text-green-300 border border-green-500">
                    <Wallet className="w-4 h-4 mr-2" />
                    DEPOSIT TO AGENT
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-orange-300 border-green-500 text-green-700 hover:bg-green-900 hover:text-green-300"
                  >
                    WITHDRAW FUNDS
                  </Button>
                </CardContent>
              </Card>

              {/* Traded Assets */}
              <Card className="bg-black/80 border-green-500 border-2 flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    ASSET PORTFOLIO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tradedAssets.map((asset, index) => (
                    <div key={index} className="border border-green-700 rounded p-3 bg-gray-900/90">
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
                              {asset.return}%
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
                              title="View on DexScreener"
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
          </div>
        </div>
      </div>
    </>
  )
}
