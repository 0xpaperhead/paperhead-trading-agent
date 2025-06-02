"use client"

import { createChart, LineSeries, IChartApi, ISeriesApi, LineStyle, Time, LineData } from "lightweight-charts"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react"
import { Expand, X } from "lucide-react"
import OverlayPortal from "./ui/OverlayPortal"
import { PerformanceDataPoint } from "@/types/types"
import { createPortal } from "react-dom"

interface ChartProps {
  children?: ReactNode
  data: Array<PerformanceDataPoint>
  timeRange: string
  onTimeRangeChange: (range: string) => void
  isLoading?: boolean
  className?: string
}

interface ChartContainerProps extends ChartProps {
  container: HTMLDivElement
  isFullScreen?: boolean
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

const timeRanges = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "Max", days: 0 },
]

export function TradingChart(props: ChartProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [fullscreenContainer, setFullscreenContainer] = useState<HTMLDivElement | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedDataPoint[]>([])
  const [hoveredData, setHoveredData] = useState<ProcessedDataPoint | null>(null)
  const [currentValue, setCurrentValue] = useState(0)
  const [currentPercentage, setCurrentPercentage] = useState(0)

  // Chart refs for both regular and fullscreen
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const fullscreenChartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const fullscreenTooltipRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const handleRef = useCallback((ref: HTMLDivElement | null) => setContainer(ref), [])
  const handleFullscreenRef = useCallback((ref: HTMLDivElement | null) => setFullscreenContainer(ref), [])

  // Process data to calculate percentage changes
  useEffect(() => {
    if (props.data.length > 0) {
      const baseValue = props.data[0].value
      const processed = props.data.map(item => {
        let unixTimestamp = item.timestamp
        
        return {
          time: unixTimestamp,
          value: Math.max(-100, ((item.value - baseValue) / baseValue) * 100),
          originalValue: item.value,
          percentChange: Math.max(-100, ((item.value - baseValue) / baseValue) * 100),
          timestamp: unixTimestamp,
          formattedDate: new Date(unixTimestamp * 1000).toLocaleDateString("default", {
            month: "short",
            day: "numeric"
          }),
          hourFormat: new Date(unixTimestamp * 1000).toLocaleTimeString("default", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }),
        }
      })

      setProcessedData(processed)
      setCurrentValue(props.data[props.data.length - 1].value)
      setCurrentPercentage(processed[processed.length - 1].percentChange)
    }
  }, [props.data])

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

  // Main chart effect - handles both regular and fullscreen
  useLayoutEffect(() => {
    const activeContainerRef = isFullScreen ? fullscreenChartContainerRef : chartContainerRef
    const activeTooltipRef = isFullScreen ? fullscreenTooltipRef : tooltipRef
    
    if (!activeContainerRef.current || props.isLoading) return

    // Clean up existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove()
      chartInstanceRef.current = null
      lineSeriesRef.current = null
    }

    // Get container dimensions
    const containerWidth = activeContainerRef.current.clientWidth || (isFullScreen ? window.innerWidth * 0.95 : 800)
    const containerHeight = activeContainerRef.current.clientHeight || (isFullScreen ? window.innerHeight * 0.8 : 400)

    // Only create chart if container has valid dimensions
    if (containerWidth > 0 && containerHeight > 0) {
      const chart = createChart(activeContainerRef.current, {
        width: containerWidth,
        height: containerHeight,
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
      })

      chartInstanceRef.current = chart

      if (processedData.length > 0) {
        // Prepare chart data with proper time formatting
        const uniqueChartPoints = new Map()
        processedData.forEach(item => {
          let timeValue = item.time
          
          if (timeValue < 946684800) {
            console.warn("Invalid timestamp detected:", timeValue)
            return
          }
          
          uniqueChartPoints.set(timeValue, {
            time: timeValue as Time,
            value: item.value
          })
        })

        const chartPoints = Array.from(uniqueChartPoints.values())
        chartPoints.sort((a, b) => (a.time as number) - (b.time as number))

        const lastValue = chartPoints[chartPoints.length - 1]?.value || 0

        // Create new series
        lineSeriesRef.current = chart.addSeries(LineSeries, {
          color: lastValue >= 0 ? "#10b981" : "#ef4444",
          lineWidth: 2,
          priceScaleId: "right",
          priceFormat: {
            type: "custom",
            formatter: (price: number) => `${price.toFixed(1)}%`
          },
        })

        // Add zero line
        lineSeriesRef.current.createPriceLine({
          price: 0,
          color: "#6b7280",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed
        })

        // Set data
        lineSeriesRef.current.setData(chartPoints as LineData<Time>[])
        chart.timeScale().fitContent()

        // Subscribe to crosshair move for tooltip
        if (activeTooltipRef.current) {
          chart.subscribeCrosshairMove(param => {
            if (!param.point || !param.time || !activeTooltipRef.current) {
              if (activeTooltipRef.current) {
                activeTooltipRef.current.style.display = "none"
              }
              setHoveredData(null)
              return
            }

            if (param.point.x < 0 || param.point.x > activeContainerRef.current!.clientWidth ||
              param.point.y < 0 || param.point.y > activeContainerRef.current!.clientHeight) {
              activeTooltipRef.current.style.display = "none"
              setHoveredData(null)
              return
            }

            const closestPoint = processedData.reduce((prev, curr) =>
              Math.abs(curr.timestamp - Math.floor(Number(param.time))) <
                Math.abs(prev.timestamp - Math.floor(Number(param.time))) ? curr : prev
            )

            activeTooltipRef.current.style.display = "block"
            activeTooltipRef.current.style.left = `${param.point.x}px`
            activeTooltipRef.current.style.top = `${param.point.y}px`
            setHoveredData(closestPoint)
          })
        }
      }

      // Setup resize observer
      resizeObserverRef.current = new ResizeObserver(entries => {
        if (chartInstanceRef.current && entries[0]) {
          try {
            const entry = entries[0]
            const width = entry.contentRect.width
            const height = entry.contentRect.height

            if (width > 0 && height > 0) {
              chartInstanceRef.current.applyOptions({ width, height })
            }
          } catch (error) {
            console.warn("Chart resize failed:", error)
          }
        }
      })

      resizeObserverRef.current.observe(activeContainerRef.current)
    }

    return () => {
      if (resizeObserverRef.current && activeContainerRef.current) {
        resizeObserverRef.current.unobserve(activeContainerRef.current)
        resizeObserverRef.current = null
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove()
        chartInstanceRef.current = null
        lineSeriesRef.current = null
      }
    }
  }, [processedData, props.isLoading, isFullScreen])

  // Separate effect to fit content when timeRange changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.timeScale().fitContent()
    }
  }, [props.timeRange])

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

  const renderChartContent = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    tooltipRef: React.RefObject<HTMLDivElement | null>
  ) => (
    <div className="relative flex-1">
      {props.isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-green-500">Loading performance data...</div>
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
                <p className={`font-medium text-lg mb-1 ${hoveredData.percentChange >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
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
            {timeRanges.map(range => (
              <button
                key={range.label}
                className={`px-3 py-1 text-xs rounded border transition-colors ${props.timeRange === range.label
                    ? "border-green-400 bg-green-900/20 text-green-300"
                    : "border-green-700 text-green-500 hover:border-green-500"
                  }`}
                onClick={() => props.onTimeRangeChange(range.label)}
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

        <div ref={handleRef} className={`flex-1 relative ${props.className || ''}`}>
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
                {timeRanges.map(range => (
                  <button
                    key={range.label}
                    className={`px-3 py-1 text-xs rounded border transition-colors ${props.timeRange === range.label
                        ? "border-green-400 bg-green-900/20 text-green-300"
                        : "border-green-700 text-green-500 hover:border-green-500"
                      }`}
                    onClick={() => props.onTimeRangeChange(range.label)}
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
            <div ref={handleFullscreenRef} className="flex-1 relative">
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

export const TradingChartContainer = forwardRef<IChartApi, ChartContainerProps>((props, ref) => {
  const { children, container, data, isLoading, isFullScreen = false } = props
  const [processedData, setProcessedData] = useState<ProcessedDataPoint[]>([])
  const [hoveredData, setHoveredData] = useState<ProcessedDataPoint | null>(null)
  const [currentValue, setCurrentValue] = useState(0)
  const [currentPercentage, setCurrentPercentage] = useState(0)

  // Standard TradingView API refs
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Process data to calculate percentage changes
  useEffect(() => {
    if (data.length > 0) {
      const baseValue = data[0].value
      const processed = data.map(item => {
        // Convert timestamp to proper unix timestamp in seconds if needed
        let unixTimestamp = item.timestamp
        
        return {
          time: unixTimestamp,
          value: Math.max(-100, ((item.value - baseValue) / baseValue) * 100),
          originalValue: item.value,
          percentChange: Math.max(-100, ((item.value - baseValue) / baseValue) * 100),
          timestamp: unixTimestamp,
          formattedDate: new Date(unixTimestamp * 1000).toLocaleDateString("default", {
            month: "short",
            day: "numeric"
          }),
          hourFormat: new Date(unixTimestamp * 1000).toLocaleTimeString("default", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }),
        }
      })

      setProcessedData(processed)
      setCurrentValue(data[data.length - 1].value)
      setCurrentPercentage(processed[processed.length - 1].percentChange)
    }
  }, [data])

  // Initialize chart when container changes
  useLayoutEffect(() => {
    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      lineSeriesRef.current = null
    }

    // Get container dimensions
    const containerWidth = container.clientWidth || (isFullScreen ? window.innerWidth * 0.95 : 800)
    const containerHeight = container.clientHeight || (isFullScreen ? window.innerHeight * 0.8 : 400)

    // Only create chart if container has valid dimensions
    if (containerWidth > 0 && containerHeight > 0) {
      const chart = createChart(container, {
        width: containerWidth,
        height: containerHeight,
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
      })

      chartRef.current = chart

      // Setup resize observer
      resizeObserverRef.current = new ResizeObserver(entries => {
        if (chartRef.current && entries[0]) {
          try {
            const entry = entries[0]
            const width = entry.contentRect.width
            const height = entry.contentRect.height

            if (width > 0 && height > 0) {
              chartRef.current.applyOptions({ width, height })
            }
          } catch (error) {
            console.warn("Chart resize failed:", error)
          }
        }
      })

      resizeObserverRef.current.observe(container)
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        lineSeriesRef.current = null
      }
    }
  }, [container, isFullScreen])

  // Update chart data when processedData changes
  useLayoutEffect(() => {
    if (!chartRef.current || processedData.length === 0) return

    // Prepare chart data with proper time formatting
    const uniqueChartPoints = new Map()
    processedData.forEach(item => {
      // Ensure timestamp is valid and in seconds
      let timeValue = item.time
      
      // Validate timestamp range (should be reasonable unix timestamp)
      if (timeValue < 946684800) { // Before year 2000
        console.warn("Invalid timestamp detected:", timeValue)
        return
      }
      
      uniqueChartPoints.set(timeValue, {
        time: timeValue as Time,
        value: item.value
      })
    })

    const chartPoints = Array.from(uniqueChartPoints.values())
    chartPoints.sort((a, b) => (a.time as number) - (b.time as number))

    // Debug log to check time values
    console.log("Chart points sample:", chartPoints.slice(0, 3).map(p => ({
      time: p.time,
      date: new Date((p.time as number)).toISOString()
    })))

    const lastValue = chartPoints[chartPoints.length - 1]?.value || 0

    // Create or update series
    if (!lineSeriesRef.current) {
      // Create new series
      lineSeriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: lastValue >= 0 ? "#10b981" : "#ef4444",
        lineWidth: 2,
        priceScaleId: "right",
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `${price.toFixed(1)}%`
        },
      })

      // Add zero line
      lineSeriesRef.current.createPriceLine({
        price: 0,
        color: "#6b7280",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed
      })

      // Subscribe to crosshair move for tooltip
      chartRef.current.subscribeCrosshairMove(param => {
        if (!param.point || !param.time || !tooltipRef.current) {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = "none"
          }
          setHoveredData(null)
          return
        }

        if (param.point.x < 0 || param.point.x > container.clientWidth ||
          param.point.y < 0 || param.point.y > container.clientHeight) {
          tooltipRef.current.style.display = "none"
          setHoveredData(null)
          return
        }

        const closestPoint = processedData.reduce((prev, curr) =>
          Math.abs(curr.timestamp - Math.floor(Number(param.time))) <
            Math.abs(prev.timestamp - Math.floor(Number(param.time))) ? curr : prev
        )

        tooltipRef.current.style.display = "block"
        tooltipRef.current.style.left = `${param.point.x}px`
        tooltipRef.current.style.top = `${param.point.y}px`
        setHoveredData(closestPoint)
      })
    } else {
      // Update existing series color
      lineSeriesRef.current.applyOptions({
        color: lastValue >= 0 ? "#10b981" : "#ef4444",
      })
    }

    // Set data using standard API
    lineSeriesRef.current.setData(chartPoints as LineData<Time>[])
    chartRef.current.timeScale().fitContent()

    // Apply time scale options to ensure proper formatting
    setTimeout(() => {
      if (chartRef.current) {
        try {
          chartRef.current.timeScale().applyOptions({
            timeVisible: true,
            secondsVisible: false,
          })
        } catch (error) {
          console.warn("Time scale formatting failed:", error)
        }
      }
    }, 100)
  }, [processedData, container])

  useImperativeHandle(ref, () => chartRef.current!, [])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-green-500">Loading performance data...</div>
      </div>
    )
  }

  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-green-600">
        <div>
          <p className="font-medium">No data available</p>
          <p className="text-sm">Please try a different timeframe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
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
            <p className={`font-medium text-lg mb-1 ${hoveredData.percentChange >= 0 ? "text-green-400" : "text-red-400"
              }`}>
              {formatPercent(hoveredData.percentChange)}
            </p>
            <p className="text-xs text-green-500">
              {formatCurrency(hoveredData.originalValue)}
            </p>
          </>
        )}
      </div>

      {children}
    </div>
  )
})
TradingChartContainer.displayName = "TradingChartContainer"
