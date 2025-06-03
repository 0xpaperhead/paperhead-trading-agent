"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Terminal,
  Bot,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Circle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react"
import { useAgentLogs } from "@/hooks/server-action-hooks/useAgentLogs"

export function TerminalLogs() {
  const { data: logs, isLoading, error, refetch } = useAgentLogs(10)

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
    <Card className="bg-black/80 border-green-500 border-2 h-1/2">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-300 flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          AGENT TERMINAL
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)] min-h-[200px] p-4 overflow-hidden flex flex-col">
        <div className="bg-black rounded p-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-green-500 animate-pulse">Loading logs...</div>
          ) : error ? (
            <div className="text-red-500">Error loading logs: {error.message}</div>
          ) : logs && logs.length > 0 ? (
            logs.map((log) => (
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
            ))
          ) : (
            <div className="text-green-500">No logs available</div>
          )}
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
              onClick={() => refetch()}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-green-600 text-xs">{logs?.length || 0} logs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 