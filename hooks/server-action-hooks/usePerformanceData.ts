"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchPerformanceData } from "@/app/_actions/performance-actions"

// Constants
const REFRESH_INTERVAL = 30000 // 30 seconds for performance data

export function usePerformanceData(timeRange: string = "7d") {
  const queryKey = ["performance", timeRange]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchPerformanceData(timeRange)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch performance data")
      }
      
      return result.data
    },
    staleTime: REFRESH_INTERVAL / 2,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
  })
} 