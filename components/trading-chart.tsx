"use client"

import { createChart, LineSeries, AreaSeries } from "lightweight-charts"
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

const Context = createContext()

export function Chart(props) {
  const [container, setContainer] = useState(false)
  const handleRef = useCallback((ref) => setContainer(ref), [])
  return (
    <div ref={handleRef} className="w-full h-full overflow-hidden">
      {container && <ChartContainer {...props} container={container} />}
    </div>
  )
}

export const ChartContainer = forwardRef((props, ref) => {
  const { children, container, layout, ...rest } = props

  const chartApiRef = useRef({
    isRemoved: false,
    api() {
      if (!this._api && !this.isRemoved) {
        // Get container dimensions with proper bounds checking
        const containerWidth = Math.max(container.clientWidth - 10, 200)
        const containerHeight = Math.max(container.clientHeight - 10, 150)

        this._api = createChart(container, {
          ...rest,
          layout,
          width: containerWidth,
          height: containerHeight,
        })
        this._api.timeScale().fitContent()
      }
      return this._api
    },
    free(series) {
      if (this._api && series && !this.isRemoved) {
        try {
          this._api.removeSeries(series)
        } catch (error) {
          // Ignore disposal errors
          console.warn("Series removal failed:", error)
        }
      }
    },
    remove() {
      if (this._api && !this.isRemoved) {
        try {
          this.isRemoved = true
          this._api.remove()
          this._api = null
        } catch (error) {
          // Ignore disposal errors
          console.warn("Chart removal failed:", error)
        }
      }
    },
  })

  useLayoutEffect(() => {
    const currentRef = chartApiRef.current
    const chart = currentRef.api()

    const handleResize = () => {
      if (currentRef.isRemoved || !chart) return

      try {
        // Get container dimensions with proper bounds checking
        const containerWidth = Math.max(container.clientWidth - 10, 200)
        const containerHeight = Math.max(container.clientHeight - 10, 150)

        chart.applyOptions({
          ...rest,
          width: containerWidth,
          height: containerHeight,
        })
      } catch (error) {
        // Ignore resize errors on disposed charts
        console.warn("Chart resize failed:", error)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      currentRef.remove()
    }
  }, [])

  useLayoutEffect(() => {
    const currentRef = chartApiRef.current
    if (!currentRef.isRemoved) {
      currentRef.api()
    }
  }, [])

  useLayoutEffect(() => {
    const currentRef = chartApiRef.current
    if (!currentRef.isRemoved && currentRef._api) {
      try {
        currentRef.api().applyOptions(rest)
      } catch (error) {
        console.warn("Chart options update failed:", error)
      }
    }
  }, [])

  useImperativeHandle(ref, () => chartApiRef.current.api(), [])

  useEffect(() => {
    const currentRef = chartApiRef.current
    if (!currentRef.isRemoved && currentRef._api) {
      try {
        currentRef.api().applyOptions({ layout })
      } catch (error) {
        console.warn("Chart layout update failed:", error)
      }
    }
  }, [layout])

  return <Context.Provider value={chartApiRef.current}>{props.children}</Context.Provider>
})
ChartContainer.displayName = "ChartContainer"

export const Series = forwardRef((props, ref) => {
  const parent = useContext(Context)
  const context = useRef({
    isRemoved: false,
    api() {
      if (!this._api && !this.isRemoved && !parent.isRemoved) {
        try {
          const { children, data, type, ...rest } = props
          this._api =
            type === "line" ? parent.api().addSeries(LineSeries, rest) : parent.api().addSeries(AreaSeries, rest)
          this._api.setData(data)
        } catch (error) {
          console.warn("Series creation failed:", error)
        }
      }
      return this._api
    },
    free() {
      if (this._api && !this.isRemoved && !parent.isRemoved) {
        try {
          this.isRemoved = true
          parent.free(this._api)
          this._api = null
        } catch (error) {
          console.warn("Series cleanup failed:", error)
        }
      }
    },
  })

  useLayoutEffect(() => {
    const currentRef = context.current
    currentRef.api()

    return () => currentRef.free()
  }, [])

  useLayoutEffect(() => {
    const currentRef = context.current
    if (!currentRef.isRemoved && currentRef._api) {
      try {
        const { children, data, ...rest } = props
        currentRef.api().applyOptions(rest)
      } catch (error) {
        console.warn("Series options update failed:", error)
      }
    }
  })

  useImperativeHandle(ref, () => context.current.api(), [])

  return <Context.Provider value={context.current}>{props.children}</Context.Provider>
})
Series.displayName = "Series"
