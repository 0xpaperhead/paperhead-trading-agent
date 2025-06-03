"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAgentLogs } from "@/app/actions"

// Constants
const REFRESH_INTERVAL = 5000 // 5 seconds for logs (frequent updates)

export function useAgentLogs(limit: number = 10) {
  const queryKey = ["agentLogs", limit]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchAgentLogs(limit)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch agent logs")
      }
      
      return result.data
    },
    staleTime: REFRESH_INTERVAL / 2,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
  })
} 