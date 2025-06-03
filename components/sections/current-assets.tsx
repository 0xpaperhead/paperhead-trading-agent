"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ExternalLink } from "lucide-react"
import { useTradedAssets } from "@/hooks/server-action-hooks/useTradedAssets"

function truncateAddress(address: string): string {
  return `${address.slice(0, 5)}••••${address.slice(-5)}`
}

export function CurrentAssets() {
  const { data: tradedAssets, isLoading, error } = useTradedAssets()

  return (
    <Card className="bg-black/80 border-green-500 border-2 flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-300 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          CURRENT ASSETS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-green-500 animate-pulse">Loading assets...</div>
        ) : error ? (
          <div className="text-red-500">Error loading assets: {error.message}</div>
        ) : tradedAssets && tradedAssets.length > 0 ? (
          tradedAssets.map((asset, index) => (
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
          ))
        ) : (
          <div className="text-green-500">No assets available</div>
        )}
      </CardContent>
    </Card>
  )
} 