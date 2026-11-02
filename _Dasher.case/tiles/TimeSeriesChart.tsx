import { useEffect, useRef } from 'react'
import uPlot from 'uplot'
import '../styles/uplot.css'

export type ChartSeries = {
    label: string
    color: string
    data: number[]
}

type TimeSeriesChartProps = {
    x: number[]
    series: ChartSeries[]
    unit: string
    className?: string | undefined
}

function resolveColor(container: HTMLElement, color: string) {
    const match = color.match(/^var\((--[^)]+)\)$/)
    if (!match) return color
    return getComputedStyle(container).getPropertyValue(match[1]).trim() || color
}

export default function TimeSeriesChart({ x, series, unit, className = '' }: TimeSeriesChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const plotRef = useRef<uPlot | null>(null)
    const initialDataRef = useRef<uPlot.AlignedData>([x, ...series.map((item) => item.data)])
    const initialSeriesRef = useRef(series)
    const initialUnitRef = useRef(unit)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const initialSeries = initialSeriesRef.current
        const initialUnit = initialUnitRef.current
        const styles = getComputedStyle(container)
        const textColor = styles.getPropertyValue('--color-dsh-text-secondary').trim() || '#d6d3d1'
        const gridColor =
            styles.getPropertyValue('--color-dsh-hairline').trim() || 'rgba(255, 255, 255, 0.1)'

        const options: uPlot.Options = {
            width: Math.max(1, container.clientWidth),
            height: Math.max(1, container.clientHeight),
            padding: [8, 8, 0, 0],
            cursor: { show: false },
            legend: { show: false },
            scales: {
                x: { time: true },
                y: { auto: true },
            },
            axes: [
                {
                    stroke: textColor,
                    grid: { stroke: gridColor, width: 1 },
                    ticks: { stroke: gridColor, width: 1 },
                    font: '11px ui-sans-serif, system-ui, sans-serif',
                    size: 28,
                },
                {
                    stroke: textColor,
                    grid: { stroke: gridColor, width: 1 },
                    ticks: { stroke: gridColor, width: 1 },
                    font: '11px ui-sans-serif, system-ui, sans-serif',
                    size: 36,
                    label: initialUnit,
                    labelFont: '11px ui-sans-serif, system-ui, sans-serif',
                    labelSize: 14,
                },
            ],
            series: [
                {},
                ...initialSeries.map((item) => ({
                    label: item.label,
                    stroke: resolveColor(container, item.color),
                    width: 1.5,
                })),
            ],
        }

        const plot = new uPlot(options, initialDataRef.current, container)
        plotRef.current = plot

        const observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect
            if (!rect) return
            plot.setSize({
                width: Math.max(1, Math.floor(rect.width)),
                height: Math.max(1, Math.floor(rect.height)),
            })
        })
        observer.observe(container)

        return () => {
            observer.disconnect()
            plot.destroy()
            plotRef.current = null
        }
    }, [])

    useEffect(() => {
        plotRef.current?.setData([x, ...series.map((item) => item.data)])
    }, [x, series])

    return (
        <div className={`flex h-full min-h-0 flex-col  ${className ?? ''}`}>
            <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1 text-sm font-thin text-dsh-text-secondary">
                {series.map((item) => (
                    <span key={item.label} className="flex items-center gap-1">
                        <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                    </span>
                ))}
            </div>
            <div
                ref={containerRef}
                role="img"
                aria-label={`${series.map((item) => item.label).join('、')}（${unit}）`}
                className="min-h-0 flex-1"
            />
        </div>
    )
}
