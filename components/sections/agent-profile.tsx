"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot } from "lucide-react"
import { useAgentStats } from "@/hooks/server-action-hooks/useAgentStats"

export function AgentProfile() {
  const { data: agentStats, isLoading, error } = useAgentStats()

  return (
    <Card className="bg-black/80 border-green-500 border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-300 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AGENT PROFILE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-green-500 animate-pulse">Loading stats...</div>
        ) : error ? (
          <div className="text-red-500">Error loading stats: {error.message}</div>
        ) : agentStats ? (
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
          <div className="text-green-500">No stats available</div>
        )}
      </CardContent>
    </Card>
  )
} 