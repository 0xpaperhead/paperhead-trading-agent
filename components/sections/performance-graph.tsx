"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { TradingChart } from "@/components/trading-chart"

export function PerformanceGraph() {
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
        <TradingChart />
      </CardContent>
    </Card>
  )
} 