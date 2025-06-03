"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTradedAssets } from "@/app/_actions/traded-assets-actions"

// Constants
const REFRESH_INTERVAL = 5000 // 5 seconds for traded assets (frequent updates)

export function useTradedAssets() {
  const queryKey = ["tradedAssets"]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchTradedAssets()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch traded assets")
      }
      
      return result.data
    },
    staleTime: REFRESH_INTERVAL / 2,
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
  })
} 