"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { TradingChart } from "@/components/trading-chart"
import { usePerformanceData } from "@/hooks/server-action-hooks/usePerformanceData"

export function PerformanceGraph() {
  const [timeRange, setTimeRange] = useState("7d")
  const { data: performanceData, isLoading, error } = usePerformanceData(timeRange)

  return (
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
        ) : error ? (
          <div className="flex items-center justify-center text-center text-red-500 h-52">
            <span className="text-center">
              Error loading performance data: {error.message}
            </span>
          </div>
        ) : (
          <TradingChart
            data={performanceData || []}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}
      </CardContent>
    </Card>
  )
} 