"use client"

// Import section components
import { Header } from "@/components/sections/header"
import { PerformanceGraph } from "@/components/sections/performance-graph"
import { TerminalLogs } from "@/components/sections/terminal-logs"
import { AgentProfile } from "@/components/sections/agent-profile"
import { DepositInterface } from "@/components/sections/deposit-interface"
import { CurrentAssets } from "@/components/sections/current-assets"

export default function CryptoTraderMatrix() {
  return (
    <>
      {/* Matrix Grid Background */}
      <div className="matrix-rain"></div>

      <div className="min-h-screen text-green-400 font-mono p-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Header />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
            {/* Left Column - Performance Graph and Terminal */}
            <div className="lg:col-span-2 space-y-4">
              <PerformanceGraph />

              <TerminalLogs />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <AgentProfile />

              <DepositInterface />

              <CurrentAssets />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}