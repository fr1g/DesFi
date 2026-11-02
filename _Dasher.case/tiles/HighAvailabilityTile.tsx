import { useEffect, useRef, useState } from 'react'
import { MODULE_WIDTH } from '../useModuleWidth'
import Tile from './Tile'

const WIDE_THRESHOLD = MODULE_WIDTH * 1.5
const INITIAL_EVENT_DELAY_MS = 3000
const RETRY_COUNTDOWN_SECONDS = 5
const RECOVERY_COOLDOWN_MS = 60000
const CHART_WIDTH = 240
const CHART_HEIGHT = 64
const HEARTBEAT_BASELINE = 40
const HEARTBEAT_PATH =
    'M0 40 H34 L40 34 L46 40 H68 L74 44 L80 10 L86 54 L92 40 H124 C134 40 138 30 148 30 C158 30 162 40 172 40 H240'
const HEARTBEAT_AREA = `${HEARTBEAT_PATH} L${CHART_WIDTH} ${CHART_HEIGHT} L0 ${CHART_HEIGHT} Z`

function AvailabilityWatermark({ error = false }: { error?: boolean }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-[42%] text-dsh-text-disabled/[0.32] ${error
                ? 'group-hover:text-dsh-error/[0.4]'
                : 'group-hover:text-dsh-success/[0.45]'
                }`}
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
                    y1={HEARTBEAT_BASELINE}
                    y2={HEARTBEAT_BASELINE}
                    stroke="currentColor"
                    strokeOpacity="0.28"
                    strokeDasharray="2 4"
                />
                <path d={HEARTBEAT_AREA} fill="url(#dsh-ha-watermark-fill)" />
                <path
                    d={HEARTBEAT_PATH}
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
    const [eventPhase, setEventPhase] = useState<'initial' | 'active' | 'cooldown'>(
        'initial',
    )
    const [remaining, setRemaining] = useState(RETRY_COUNTDOWN_SECONDS)
    const [lastSyncSeconds, setLastSyncSeconds] = useState(3)
    const isWide = measuredWide ?? wide
    const eventActive = eventPhase === 'active'

    useEffect(() => {
        const timer = window.setInterval(() => {
            setLastSyncSeconds((value) => value + 1)
        }, 1000)
        return () => window.clearInterval(timer)
    }, [])

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

    useEffect(() => {
        let timer: number

        if (eventPhase === 'initial') {
            timer = window.setTimeout(() => {
                setRemaining(RETRY_COUNTDOWN_SECONDS)
                setEventPhase('active')
            }, INITIAL_EVENT_DELAY_MS)
        } else if (eventPhase === 'active') {
            timer = window.setTimeout(() => {
                if (remaining <= 1) {
                    setLastSyncSeconds(0)
                    setRemaining(RETRY_COUNTDOWN_SECONDS)
                    setEventPhase('cooldown')
                } else {
                    setRemaining((value) => value - 1)
                }
            }, 1000)
        } else {
            timer = window.setTimeout(() => {
                setRemaining(RETRY_COUNTDOWN_SECONDS)
                setEventPhase('active')
            }, RECOVERY_COOLDOWN_MS)
        }

        return () => window.clearTimeout(timer)
    }, [eventPhase, remaining])

    return (
        <Tile
            title="高可用"
            status={eventActive ? 'danger' : 'success'}
            measureId="ha"
        >
            <div ref={contentRef} className="relative flex flex-col gap-2">
                {isWide && <AvailabilityWatermark error={eventActive} />}
                <div
                    className={`relative z-10 flex flex-col gap-2 ${
                        isWide ? 'max-w-[55%]' : ''
                    }`}
                >
                    <p
                        className={
                            eventActive
                                ? 'text-dsh-error'
                                : 'text-dsh-text group-hover:text-dsh-success'
                        }
                    >
                        {eventActive ? '主备心跳中断' : '双机热备同步正常'}
                    </p>
                    <p
                        className={
                            eventActive
                                ? 'text-sm font-thin text-dsh-error/80'
                                : 'text-sm font-thin text-dsh-text-secondary'
                        }
                    >
                        {eventActive
                            ? `倒计时自动重试：${remaining}s`
                            : `主备切换 0 次 · 上次同步 ${lastSyncSeconds}s 前`}
                    </p>
                    <button type="button" className="dsh-link-button self-start text-sm">
                        查看拓扑
                    </button>
                </div>
            </div>
        </Tile>
    )
}
