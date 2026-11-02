import { useEffect, useRef, useState } from 'react'
import { MODULE_WIDTH } from '../useModuleWidth'
import Tile from './Tile'

const WIDE_THRESHOLD = MODULE_WIDTH * 1.5
const SYNC_LATENCY = [
    12, 11, 13, 10, 9, 11, 8, 9, 7, 10, 6, 8, 5, 7, 6, 9, 5, 4, 6, 5, 4, 5, 3, 4,
]
const CHART_WIDTH = 240
const CHART_HEIGHT = 64
const CHART_PADDING = 6

const chartMin = Math.min(...SYNC_LATENCY)
const chartMax = Math.max(...SYNC_LATENCY)
const chartRange = chartMax - chartMin || 1
const chartPoints = SYNC_LATENCY.map((value, index) => {
    const x = (index / (SYNC_LATENCY.length - 1)) * CHART_WIDTH
    const y =
        CHART_PADDING +
        (1 - (value - chartMin) / chartRange) *
            (CHART_HEIGHT - CHART_PADDING * 2)
    return [x, y] as const
})
const chartLinePath = chartPoints
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
const chartAreaPath = `${chartLinePath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`

function AvailabilityWatermark() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] text-dsh-text-disabled/[0.32] group-hover:text-dsh-success/[0.45]"
        >
            <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
            >
                <defs>
                    <linearGradient
                        id="dsh-ha-watermark-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <line
                    x1="0"
                    x2={CHART_WIDTH}
                    y1={CHART_HEIGHT - 0.5}
                    y2={CHART_HEIGHT - 0.5}
                    stroke="currentColor"
                    strokeOpacity="0.28"
                    strokeDasharray="2 4"
                />
                <path d={chartAreaPath} fill="url(#dsh-ha-watermark-fill)" />
                <path
                    d={chartLinePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    )
}

export default function HighAvailabilityTile({ wide = false }: { wide?: boolean }) {
    const contentRef = useRef<HTMLDivElement>(null)
    const [measuredWide, setMeasuredWide] = useState<boolean | null>(null)
    const isWide = measuredWide ?? wide

    useEffect(() => {
        const node = contentRef.current
        if (!node) return

        const observer = new ResizeObserver(([entry]) => {
            const width = entry?.contentRect.width ?? 0
            if (width > 0) setMeasuredWide(width >= WIDE_THRESHOLD)
        })
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return (
        <Tile title="高可用" status="success" measureId="ha">
            <div ref={contentRef} className="relative flex flex-col gap-2">
                {isWide && <AvailabilityWatermark />}
                <div
                    className={`relative z-10 flex flex-col gap-2 ${
                        isWide ? 'max-w-[55%]' : ''
                    }`}
                >
                    <p className="text-dsh-text group-hover:text-dsh-success">
                        双机热备同步正常
                    </p>
                    <p className="text-sm font-thin text-dsh-text-secondary">
                        主备切换 0 次 · 上次同步 12s 前
                    </p>
                    <button type="button" className="dsh-link-button self-start text-sm">
                        查看拓扑
                    </button>
                </div>
            </div>
        </Tile>
    )
}
