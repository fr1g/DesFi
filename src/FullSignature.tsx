import { useCallback, useEffect, useRef } from 'react'

const VIEW_BOX = '0 0 3204 1366.63'
const D_PATHS = [
    'M3185,226.35c-52.38,34.75-298.26,497.64-574.51,575.26-68.09,19.13-142.29-7.37-180.76-66.72-37.84-58.38-50.91-138.2-13.38-198.74,45.58-62.05,16.5,245.54-129.05,276.21-104.91,22.11-118.96-90.94-67.54-191.04,55.32-107.69,179.56-95.81,158.95-88.72-136.8,55.61-205.45,219.23-269.72,266.53-20.83,15.33-54.95,13.37-66.29-9.88-47.4-97.24-42.39-354.46,146.54-734.83,44.71-98.48,64,16.35-123.5,396.81-36.88,74.84-22,64.7-104.59,122.42-54.1,37.82-76.26,45.68-256.84,160.16-39.12,30.67-12.69,96.44,86.41,75.23,91.2-19.52,85.35-82.33,68.31-111.92-98.67-169.86-159.99-90.33-100.25-155.29,57.85-62.9,179.95-109.92,159.87-103.74-17.37,5.35-426.41,187.46-428.93,375.81-.46,34.18,99.36-322.22,112.14-281.05-55.36,202.98-459.69,501.28-226.41-.36,11.65-25.04-91.29,263.13-222.95,279.1-67.99,8.25-143.28-101.67-10.56-288.68,12.42-10.11-215.97,273.99-238.3,299.86-113.28,131.24-304.27,412.53-199.16,513.89,54.62,52.67,99.07-82.46,190.21-446.29,45.25-180.63,49.68-289.57-11.18-363.03-21.12-25.49,91.01,54.18,31.05,181.34-40.12,85.09-107.54,110.62-138.09,103.99-199.19-43.24,27.03-266.27,37.55-278.61',
    'M1567.07,468.99c7.48-4.06,53.55-27.23,58.2-29.81',
    'M2305.15,312.65c-13.39-7.05-363.38-43.99-374.35-43.96',
    'M525.91,19c-11.58,13-11.3,12.5-16.86,18.9C72.06,540.58,18.66,1616.97,167.93,1267.96,563.45,343.23-136.54,548.29,51.91,535.51c283.5-19.22,369.09,37.62,493.96-6.39,29.11-10.26-142.23,370.58-124.56,289.57,12.41-56.89,140.1-269.14,371.1-287.59,6.74-.54,26.8-1.07,20.48-1.11',
    'M522.34,468.99c13.62-7.18,49.06-24.13,59.62-29.81',
]

const BASE_SPEED = 2300
const MIN_STROKE_MS = 220
const INITIAL_DELAY = 500
const SPEED = 1.8
const STROKE_SPEED: Record<number, number> = { 3: 1.8, 4: 1.8 }
const SEQUENCE = [3, 0]
const SYNC = [4, 1, 2]
const TOTAL_MS = 1000
const REVERSED = new Set([0, 2])

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1
    const bx = 3 * (x2 - x1) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = 3 * (y2 - y1) - cy
    const ay = 1 - cy - by
    const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s
    const sampleY = (s: number) => ((ay * s + by) * s + cy) * s
    const sampleDX = (s: number) => (3 * ax * s + 2 * bx) * s + cx

    return (t: number): number => {
        if (t <= 0) return 0
        if (t >= 1) return 1
        let s = t
        for (let i = 0; i < 8; i += 1) {
            const error = sampleX(s) - t
            const derivative = sampleDX(s)
            if (Math.abs(error) < 1e-6) return sampleY(s)
            if (Math.abs(derivative) < 1e-7) break
            s -= error / derivative
            if (s < 0 || s > 1) break
        }
        let low = 0
        let high = 1
        for (let i = 0; i < 26; i += 1) {
            s = (low + high) / 2
            if (sampleX(s) < t) low = s
            else high = s
        }
        return sampleY(s)
    }
}

const easeBezier = cubicBezier(0.5, 0.1, 0.5, 0.9)

function invertEase(fn: (t: number) => number, target: number): number {
    let low = 0
    let high = 1
    for (let i = 0; i < 40; i += 1) {
        const mid = (low + high) / 2
        if (fn(mid) < target) low = mid
        else high = mid
    }
    return (low + high) / 2
}

type StrokeItem = {
    el: SVGPathElement
    L: number
    rev: boolean
    speedMul: number
    i: number
    iTotal: number
    travel: number
    prevEnd: DOMPoint | null
    t0: number
    dur: number
    startPt: DOMPoint
    endPt: DOMPoint
    syncMark: boolean
}

type FullSignatureProps = {
    onComplete?: () => void
}

export default function FullSignature({ onComplete }: FullSignatureProps) {
    const pathRefs = useRef<Array<SVGPathElement | null>>([])
    const timelineRef = useRef<StrokeItem[]>([])
    const totalRef = useRef(0)
    const startRef = useRef(0)
    const playingRef = useRef(false)
    const completedRef = useRef(false)
    const rafRef = useRef(0)

    const notifyComplete = useCallback(() => {
        if (completedRef.current) return
        completedRef.current = true
        onComplete?.()
    }, [onComplete])

    const buildTimeline = useCallback(() => {
        const iTotal = SEQUENCE.length
        const strokes = SEQUENCE.map((pathIndex, i) => {
            const el = pathRefs.current[pathIndex] as SVGPathElement
            const L = el.getTotalLength()
            const rev = REVERSED.has(pathIndex)
            return {
                el,
                L,
                rev,
                i,
                iTotal,
                speedMul: STROKE_SPEED[pathIndex] ?? 1,
                startPt: el.getPointAtLength(rev ? L : 0),
                endPt: el.getPointAtLength(rev ? 0 : L),
            }
        })

        let t = INITIAL_DELAY
        const items = strokes.map((stroke) => {
            let travel = 0
            let prevEnd: DOMPoint | null = null
            if (stroke.i > 0) {
                prevEnd = strokes[stroke.i - 1]?.endPt ?? null
                if (prevEnd) {
                    const distance = Math.hypot(
                        stroke.startPt.x - prevEnd.x,
                        stroke.startPt.y - prevEnd.y,
                    )
                    travel = Math.min(
                        340,
                        Math.max(140, (distance / (BASE_SPEED * SPEED)) * 1000 * 2.4),
                    )
                }
            }
            t += travel
            const duration = Math.max(
                MIN_STROKE_MS / stroke.speedMul,
                (stroke.L / (BASE_SPEED * SPEED * stroke.speedMul)) * 1000,
            )
            const item: StrokeItem = { ...stroke, travel, prevEnd, t0: t, dur: duration, syncMark: false }
            t += duration
            return item
        })

        const main = items[items.length - 1]
        if (main) {
            const samples: Array<{ len: number; x: number; y: number }> = []
            const sampleCount = 256
            for (let index = 0; index <= sampleCount; index += 1) {
                const length = (main.L * index) / sampleCount
                const point = main.el.getPointAtLength(length)
                samples.push({ len: length, x: point.x, y: point.y })
            }

            for (const pathIndex of SYNC) {
                const el = pathRefs.current[pathIndex] as SVGPathElement
                const L = el.getTotalLength()
                const rev = REVERSED.has(pathIndex)
                const speedMul = STROKE_SPEED[pathIndex] ?? 1
                const anchor = el.getPointAtLength(L / 2)
                let lengthAt = 0
                let bestDistance = Infinity
                for (const sample of samples) {
                    const distance =
                        (sample.x - anchor.x) ** 2 + (sample.y - anchor.y) ** 2
                    if (distance < bestDistance) {
                        bestDistance = distance
                        lengthAt = sample.len
                    }
                }
                const progressAt = main.rev ? 1 - lengthAt / main.L : lengthAt / main.L
                const localT = invertEase(easeBezier, Math.min(1, Math.max(0, progressAt)))
                const duration = Math.max(
                    MIN_STROKE_MS / speedMul,
                    (L / (BASE_SPEED * SPEED * speedMul)) * 1000,
                )
                items.push({
                    el,
                    L,
                    rev,
                    speedMul,
                    i: main.i,
                    iTotal,
                    travel: 0,
                    prevEnd: null,
                    t0: main.t0 + main.dur * localT,
                    dur: duration,
                    startPt: el.getPointAtLength(rev ? L : 0),
                    endPt: el.getPointAtLength(rev ? 0 : L),
                    syncMark: true,
                })
            }

            t = Math.max(t, ...items.map((item) => item.t0 + item.dur))
        }

        const scale = TOTAL_MS / t
        items.forEach((item) => {
            item.travel *= scale
            item.t0 *= scale
            item.dur *= scale
        })
        timelineRef.current = items
        totalRef.current = TOTAL_MS
    }, [])

    const renderAt = useCallback(
        (ms: number): boolean => {
            timelineRef.current.forEach((stroke) => {
                if (ms < stroke.t0) {
                    stroke.el.style.visibility = 'hidden'
                    return
                }

                stroke.el.style.visibility = 'visible'
                const local = Math.min(1, (ms - stroke.t0) / stroke.dur)
                const eased = easeBezier(local)
                stroke.el.style.strokeDashoffset = String(
                    (stroke.rev ? -1 : 1) * stroke.L * (1 - eased),
                )
            })

            const finished = ms >= totalRef.current
            if (finished) notifyComplete()
            return finished
        },
        [notifyComplete],
    )

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
        pathRefs.current.forEach((path) => {
            if (!path) return
            const length = path.getTotalLength()
            path.style.strokeDasharray = String(length)
            path.style.strokeDashoffset = String(length)
        })

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            buildTimeline()
            renderAt(totalRef.current + 1)
            notifyComplete()
        } else {
            play()
        }

        return () => {
            playingRef.current = false
            cancelAnimationFrame(rafRef.current)
        }
    }, [buildTimeline, notifyComplete, play, renderAt])

    return (
        <svg
            viewBox={VIEW_BOX}
            className="block h-auto w-full overflow-visible"
            aria-hidden="true"
            focusable="false"
        >
            {D_PATHS.map((path, index) => (
                <path
                    key={index}
                    ref={(element) => {
                        pathRefs.current[index] = element
                    }}
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={38}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ visibility: 'hidden' }}
                />
            ))}
        </svg>
    )
}
