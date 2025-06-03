"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAgentStats } from "@/app/_actions/agent-stats-actions"

// Constants
const REFRESH_INTERVAL = 10000 // 10 seconds for agent stats

export function useAgentStats() {
  const queryKey = ["agentStats"]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchAgentStats()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch agent stats")
      }
      
      return result.data
    },
    staleTime: REFRESH_INTERVAL / 2,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 3,
  })
} 