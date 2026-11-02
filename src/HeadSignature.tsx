import { useCallback, useEffect, useRef, type CSSProperties } from 'react'

const VIEW_BOX = '0 0 833.11 1355.29'
const D_PATHS = [
    'M525.91,19c-11.58,13-11.3,12.5-16.86,18.9C72.06,540.58,18.66,1616.97,167.93,1267.96,563.45,343.23-136.54,548.29,51.91,535.51c283.5-19.22,369.09,37.62,493.96-6.39,29.11-10.26-142.23,370.58-124.56,289.57,12.41-56.89,140.1-269.14,371.1-287.59,6.74-.54,26.8-1.07,20.48-1.11',
    'M522.34,468.99c13.62-7.18,49.06-24.13,59.62-29.81',
]

const BASE_SPEED = 2300
const MIN_STROKE_MS = 220
const INITIAL_DELAY = 500
const SPEED = 1.7
const GAP_MS = 170
const STROKE_SPEED: Record<number, number> = { 0: 1.8, 1: 1.8 }
const ORDER = [0, 1]
const REVERSED = new Set<number>()

const easeIO = (t: number): number => 0.5 - 0.5 * Math.cos(Math.PI * t)

type StrokeItem = {
    el: SVGPathElement
    L: number
    rev: boolean
    speedMul: number
    i: number
    travel: number
    prevEnd: DOMPoint | null
    t0: number
    dur: number
    startPt: DOMPoint
    endPt: DOMPoint
}

type HeadSignatureProps = {
    className?: string
    active?: boolean
}

const inkStyle: CSSProperties = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 38,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    visibility: 'hidden',
}

export default function HeadSignature({ className = '', active = true }: HeadSignatureProps) {
    const pathRefs = useRef<Array<SVGPathElement | null>>([])
    const penRef = useRef<SVGGElement | null>(null)
    const timelineRef = useRef<StrokeItem[]>([])
    const totalRef = useRef(0)
    const startRef = useRef(0)
    const playingRef = useRef(false)
    const rafRef = useRef(0)

    const buildTimeline = useCallback(() => {
        const strokes = ORDER.map((pathIndex, index) => {
            const el = pathRefs.current[pathIndex] as SVGPathElement
            const length = el.getTotalLength()
            const rev = REVERSED.has(pathIndex)
            return {
                el,
                L: length,
                rev,
                i: index,
                speedMul: STROKE_SPEED[pathIndex] ?? 1,
                startPt: el.getPointAtLength(rev ? length : 0),
                endPt: el.getPointAtLength(rev ? 0 : length),
            }
        })

        let t = INITIAL_DELAY
        timelineRef.current = strokes.map((stroke) => {
            const travel = stroke.i > 0 ? GAP_MS : 0
            const prevEnd = stroke.i > 0 ? (strokes[stroke.i - 1]?.endPt ?? null) : null
            t += travel
            const duration = Math.max(
                MIN_STROKE_MS / stroke.speedMul,
                (stroke.L / (BASE_SPEED * SPEED * stroke.speedMul)) * 1000,
            )
            const item: StrokeItem = { ...stroke, travel, prevEnd, t0: t, dur: duration }
            t += duration
            return item
        })
        totalRef.current = t
    }, [])

    const renderAt = useCallback((ms: number): boolean => {
        let activeIndex = -1
        let activeProgress = 0
        let upcomingIndex = -1

        timelineRef.current.forEach((stroke, index) => {
            if (ms < stroke.t0) {
                stroke.el.style.visibility = 'hidden'
                if (
                    upcomingIndex < 0 &&
                    stroke.travel > 0 &&
                    ms >= stroke.t0 - stroke.travel
                ) {
                    upcomingIndex = index
                }
                return
            }

            stroke.el.style.visibility = 'visible'
            const local = Math.min(1, (ms - stroke.t0) / stroke.dur)
            const eased = easeIO(local)
            stroke.el.style.strokeDashoffset = String(
                (stroke.rev ? -1 : 1) * stroke.L * (1 - eased),
            )
            if (local < 1) {
                activeIndex = index
                activeProgress = eased
            }
        })

        const pen = penRef.current
        if (pen) {
            if (ms < INITIAL_DELAY || ms >= totalRef.current) {
                pen.setAttribute('opacity', '0')
            } else if (activeIndex >= 0) {
                const stroke = timelineRef.current[activeIndex]
                if (stroke) {
                    pen.setAttribute('opacity', '1')
                    const point = stroke.el.getPointAtLength(
                        (stroke.rev ? 1 - activeProgress : activeProgress) * stroke.L,
                    )
                    pen.setAttribute(
                        'transform',
                        `translate(${point.x} ${point.y})`,
                    )
                }
            } else if (upcomingIndex >= 0) {
                const stroke = timelineRef.current[upcomingIndex]
                if (stroke?.prevEnd) {
                    pen.setAttribute('opacity', '0.55')
                    const progress = easeIO((ms - (stroke.t0 - stroke.travel)) / stroke.travel)
                    const x = stroke.prevEnd.x + (stroke.startPt.x - stroke.prevEnd.x) * progress
                    const y = stroke.prevEnd.y + (stroke.startPt.y - stroke.prevEnd.y) * progress
                    pen.setAttribute('transform', `translate(${x} ${y})`)
                }
            }
        }

        return ms >= totalRef.current
    }, [])

    const play = useCallback(() => {
        buildTimeline()
        startRef.current = performance.now()
        if (playingRef.current) return
        playingRef.current = true

        const frame = (now: number) => {
            if (!playingRef.current) return
            if (renderAt(now - startRef.current)) {
                playingRef.current = false
            } else {
                rafRef.current = requestAnimationFrame(frame)
            }
        }

        rafRef.current = requestAnimationFrame(frame)
    }, [buildTimeline, renderAt])

    useEffect(() => {
        if (!active) return

        const paths = pathRefs.current
        const pen = penRef.current

        paths.forEach((path) => {
            if (!path) return
            const length = path.getTotalLength()
            path.style.strokeDasharray = String(length)
            path.style.strokeDashoffset = String(length)
        })

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            buildTimeline()
            renderAt(totalRef.current + 1)
        } else {
            play()
        }

        return () => {
            playingRef.current = false
            cancelAnimationFrame(rafRef.current)
            paths.forEach((path) => {
                if (path) path.style.visibility = 'hidden'
            })
            pen?.setAttribute('opacity', '0')
        }
    }, [active, buildTimeline, play, renderAt])

    return (
        <svg
            viewBox={VIEW_BOX}
            className={className}
            aria-hidden="true"
            focusable="false"
            style={{ display: 'block', overflow: 'visible' }}
        >
            {D_PATHS.map((path, index) => (
                <path
                    key={index}
                    ref={(element) => {
                        pathRefs.current[index] = element
                    }}
                    d={path}
                    style={inkStyle}
                />
            ))}
            <g ref={penRef} opacity={0}>
                <circle r={34} fill="currentColor" opacity={0.3} />
                <circle r={17} fill="currentColor" />
            </g>
        </svg>
    )
}
