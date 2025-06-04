"use client"

import { createChart, LineSeries, IChartApi, ISeriesApi, LineStyle, Time, LineData } from "lightweight-charts"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react"
import { Expand, X } from "lucide-react"
import { createPortal } from "react-dom"
import { usePerformanceData } from "@/hooks/server-action-hooks/usePerformanceData"

interface ChartProps {
  children?: ReactNode
  className?: string
}

interface ProcessedDataPoint {
  time: number
  value: number
  originalValue: number
  percentChange: number
  timestamp: number
  formattedDate: string
  hourFormat: string
}

const TIME_RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "Max", days: 0 },
]

const CHART_CONFIG = {
  layout: {
    background: { color: "transparent" },
    textColor: "#22c55e",
  },
  grid: {
    vertLines: { color: "#22c55e", style: 1, visible: true },
    horzLines: { color: "#22c55e", style: 1, visible: true },
  },
  crosshair: {
    mode: 1,
    vertLine: { visible: true, labelVisible: false },
    horzLine: { visible: true, labelVisible: false },
  },
  rightPriceScale: {
    borderColor: "#22c55e",
    scaleMargins: { top: 0.1, bottom: 0.1 },
    mode: 0,
    autoScale: true,
  },
  timeScale: {
    borderColor: "#22c55e",
    timeVisible: true,
    secondsVisible: false,
    rightOffset: 12,
    barSpacing: 3,
    fixLeftEdge: false,
    lockVisibleTimeRangeOnResize: true,
    rightBarStaysOnScroll: true,
    visible: true,
  },
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function TradingChart(props: ChartProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [processedData, setProcessedData] = useState<ProcessedDataPoint[]>([])
  const [hoveredData, setHoveredData] = useState<ProcessedDataPoint | null>(null)
  const [currentValue, setCurrentValue] = useState(0)
  const [currentPercentage, setCurrentPercentage] = useState(0)

  // Fetch performance data
  const { data: performanceData, isLoading, error } = usePerformanceData(timeRange)

  // Chart refs for both regular and fullscreen
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const fullscreenChartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const fullscreenTooltipRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Process data to calculate percentage changes
  useEffect(() => {
    if (performanceData && performanceData.length > 0) {
      const baseValue = performanceData[0].value
      const processed = performanceData.map(item => ({
        time: item.timestamp,
        value: Math.max(-100, ((item.value - baseValue) / baseValue) * 100),
        originalValue: item.value,
        percentChange: Math.max(-100, ((item.value - baseValue) / baseValue) * 100),
        timestamp: item.timestamp,
        formattedDate: new Date(item.timestamp * 1000).toLocaleDateString("default", {
          month: "short",
          day: "numeric"
        }),
        hourFormat: new Date(item.timestamp * 1000).toLocaleTimeString("default", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }),
      }))

      setProcessedData(processed)
      setCurrentValue(performanceData[performanceData.length - 1].value)
      setCurrentPercentage(processed[processed.length - 1].percentChange)
    }
  }, [performanceData])

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
    }
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isFullScreen])

  const createChartInstance = useCallback((container: HTMLDivElement, isFullscreen: boolean) => {
    const containerWidth = container.clientWidth || (isFullscreen ? window.innerWidth * 0.95 : 800)
    const containerHeight = container.clientHeight || (isFullscreen ? window.innerHeight * 0.8 : 400)

    if (containerWidth <= 0 || containerHeight <= 0) return null

    return createChart(container, {
      ...CHART_CONFIG,
      width: containerWidth,
      height: containerHeight,
    })
  }, [])

  const setupChart = useCallback((chart: IChartApi, tooltipEl: HTMLDivElement, containerEl: HTMLDivElement) => {
    const lastValue = processedData.length > 0 ? processedData[processedData.length - 1]?.value || 0 : 0

    const lineSeries = chart.addSeries(LineSeries, {
      color: lastValue >= 0 ? "#10b981" : "#ef4444",
      lineWidth: 2,
      priceScaleId: "right",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${price.toFixed(1)}%`
      },
    })

    // Add zero line
    lineSeries.createPriceLine({
      price: 0,
      color: "#6b7280",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed
    })

    // Subscribe to crosshair move for tooltip
    chart.subscribeCrosshairMove(param => {
      if (!param.point || !param.time) {
        tooltipEl.style.display = "none"
        setHoveredData(null)
        return
      }

      if (param.point.x < 0 || param.point.x > containerEl.clientWidth ||
        param.point.y < 0 || param.point.y > containerEl.clientHeight) {
        tooltipEl.style.display = "none"
        setHoveredData(null)
        return
      }

      if (processedData.length > 0) {
        const closestPoint = processedData.reduce((prev, curr) =>
          Math.abs(curr.timestamp - Math.floor(Number(param.time))) <
            Math.abs(prev.timestamp - Math.floor(Number(param.time))) ? curr : prev
        )

        tooltipEl.style.display = "block"
        tooltipEl.style.left = `${param.point.x}px`
        tooltipEl.style.top = `${param.point.y}px`
        setHoveredData(closestPoint)
      }
    })

    return lineSeries
  }, [processedData])

  const updateChartData = useCallback(() => {
    if (!chartInstanceRef.current || !lineSeriesRef.current || processedData.length === 0) return

    // Prepare chart data
    const uniqueChartPoints = new Map()
    processedData.forEach(item => {
      if (item.time < 946684800) {
        console.warn("Invalid timestamp detected:", item.time)
        return
      }

      uniqueChartPoints.set(item.time, {
        time: item.time as Time,
        value: item.value
      })
    })

    const chartPoints = Array.from(uniqueChartPoints.values())
    chartPoints.sort((a, b) => (a.time as number) - (b.time as number))

    const lastValue = chartPoints[chartPoints.length - 1]?.value || 0

    // Update series color based on performance
    lineSeriesRef.current.applyOptions({
      color: lastValue >= 0 ? "#10b981" : "#ef4444",
    })

    // Set data and fit content
    lineSeriesRef.current.setData(chartPoints as LineData<Time>[])
    chartInstanceRef.current.timeScale().fitContent()
  }, [processedData])

  const setupResizeObserver = useCallback((chart: IChartApi, container: HTMLDivElement) => {
    const resizeObserver = new ResizeObserver(entries => {
      if (chart && entries[0]) {
        try {
          const entry = entries[0]
          const width = entry.contentRect.width
          const height = entry.contentRect.height

          if (width > 0 && height > 0) {
            chart.applyOptions({ width, height })
          }
        } catch (error) {
          console.warn("Chart resize failed:", error)
        }
      }
    })

    resizeObserver.observe(container)
    return resizeObserver
  }, [])

  // Chart initialization and cleanup
  useLayoutEffect(() => {
    const activeContainerRef = isFullScreen ? fullscreenChartContainerRef : chartContainerRef
    const activeTooltipRef = isFullScreen ? fullscreenTooltipRef : tooltipRef

    if (!activeContainerRef.current || !activeTooltipRef.current || isLoading) return

    // Clean up existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove()
      chartInstanceRef.current = null
      lineSeriesRef.current = null
    }

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
      resizeObserverRef.current = null
    }

    // Create new chart
    const chart = createChartInstance(activeContainerRef.current, isFullScreen)
    if (!chart) return

    chartInstanceRef.current = chart
    lineSeriesRef.current = setupChart(chart, activeTooltipRef.current, activeContainerRef.current)
    resizeObserverRef.current = setupResizeObserver(chart, activeContainerRef.current)

    // Apply data immediately if available
    if (processedData.length > 0) {
      setTimeout(() => updateChartData(), 0)
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove()
        chartInstanceRef.current = null
        lineSeriesRef.current = null
      }
    }
  }, [isFullScreen, isLoading, createChartInstance, setupChart, setupResizeObserver, updateChartData, processedData])

  // Update chart data when processedData changes
  useEffect(() => {
    updateChartData()
  }, [updateChartData])

  // Fit content when timeRange changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.timeScale().fitContent()
    }
  }, [timeRange])

  const renderChartContent = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    tooltipRef: React.RefObject<HTMLDivElement | null>
  ) => (
    <div className="relative flex-1">
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-64">
          <div className="text-green-500 animate-pulse">Loading performance data...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full text-center text-red-500">
          <span>Error loading performance data: {error.message}</span>
        </div>
      ) : processedData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-green-600">
          <div>
            <p className="font-medium">No data available</p>
            <p className="text-sm">Please try a different timeframe</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="w-full h-full" />

          {/* Performance Display */}
          <div className="absolute top-2 left-2 p-2 rounded bg-black/80 z-10">
            <div className={`font-medium ${currentPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatPercent(currentPercentage)}
            </div>
            <div className="text-xs text-green-500">
              {formatCurrency(currentValue)}
            </div>
          </div>

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="absolute p-2 border shadow-sm rounded max-w-xs z-10 transform -translate-x-1/2 pointer-events-none bg-black/90 border-green-500/50"
            style={{ display: "none" }}
          >
            {hoveredData && (
              <>
                <p className="text-xs mb-1 text-green-400">
                  {new Date(hoveredData.timestamp * 1000).toLocaleString()}
                </p>
                <p className={`font-medium text-lg mb-1 ${hoveredData.percentChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercent(hoveredData.percentChange)}
                </p>
                <p className="text-xs text-green-500">
                  {formatCurrency(hoveredData.originalValue)}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Time Range Selector and Fullscreen Button */}
        <div className="flex justify-between items-center mb-4 px-6">
          <div className="flex gap-2">
            {TIME_RANGES.map(range => (
              <button
                key={range.label}
                className={`px-3 py-1 text-xs rounded border transition-colors ${timeRange === range.label
                  ? "border-green-400 bg-green-900/20 text-green-300"
                  : "border-green-700 text-green-500 hover:border-green-500"
                  }`}
                onClick={() => setTimeRange(range.label)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="p-2 rounded border border-green-700 text-green-500 hover:border-green-500 hover:bg-green-900/20"
            aria-label="Enter full screen"
          >
            <Expand className="w-4 h-4" />
          </button>
        </div>

        <div className={`flex-1 relative ${props.className || ''}`}>
          {renderChartContent(chartContainerRef, tooltipRef)}
        </div>
      </div>

      {/* Fullscreen Portal */}
      {isFullScreen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative w-[95vw] h-[90vh] bg-gray-900 border border-green-500/30 rounded-lg overflow-hidden flex flex-col">
            {/* Fullscreen Header */}
            <div className="p-6 flex justify-between items-center border-b border-green-500/30">
              <div className="flex gap-2">
                {TIME_RANGES.map(range => (
                  <button
                    key={range.label}
                    className={`px-3 py-1 text-xs rounded border transition-colors ${timeRange === range.label
                      ? "border-green-400 bg-green-900/20 text-green-300"
                      : "border-green-700 text-green-500 hover:border-green-500"
                      }`}
                    onClick={() => setTimeRange(range.label)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsFullScreen(false)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-green-500"
                aria-label="Exit full screen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fullscreen Chart Container */}
            <div className="flex-1 relative">
              {renderChartContent(fullscreenChartContainerRef, fullscreenTooltipRef)}
            </div>

            {/* Fullscreen Footer */}
            <div className="p-4 border-t border-green-500/30 text-center">
              <button
                onClick={() => setIsFullScreen(false)}
                className="text-xs text-gray-400 hover:text-green-400"
              >
                Press ESC or click X to exit full screen
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
