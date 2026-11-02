import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import FullSignature from './FullSignature'
import {
    PageTransitionContext,
    usePageTransition,
} from './PageTransitionContext'

const COVER_DURATION = 0.6
const COVER_MS = COVER_DURATION * 1000
const EXIT_DURATION = 0.65
const EXIT_MIDDLE_DELAY = 0.5
const EXIT_BOTTOM_DELAY = EXIT_MIDDLE_DELAY + 0.3
const REVEAL_END_MS = (EXIT_BOTTOM_DELAY + EXIT_DURATION) * 1000 + 50

const SIGNATURE_HOLD_MS = 500
const SIGNATURE_FADE_DURATION = 0.3
const SIGNATURE_FADE_MS = SIGNATURE_FADE_DURATION * 1000

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

type TransitionPhase = 'idle' | 'covering' | 'covered' | 'signatureFading' | 'revealing'

export function RouteReadyReporter({ children }: { children: ReactNode }) {
    const { notifyReady } = usePageTransition()
    const location = useLocation()

    useEffect(() => {
        notifyReady(location.pathname)
    }, [location.pathname, notifyReady])

    return <>{children}</>
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const [phase, setPhase] = useState<TransitionPhase>('idle')
    const phaseRef = useRef<TransitionPhase>('idle')
    const targetRef = useRef<string | null>(null)
    const routeReadyRef = useRef(false)
    const signatureDoneRef = useRef(false)
    const signatureTimersRef = useRef<number[]>([])

    const updatePhase = useCallback((next: TransitionPhase) => {
        phaseRef.current = next
        setPhase(next)
    }, [])

    const clearSignatureTimers = useCallback(() => {
        signatureTimersRef.current.forEach((timer) => window.clearTimeout(timer))
        signatureTimersRef.current = []
    }, [])

    const scheduleSignatureFade = useCallback(
        (holdMs: number) => {
            if (phaseRef.current !== 'covered' || signatureTimersRef.current.length > 0) {
                return
            }

            const startFade = () => {
                if (phaseRef.current !== 'covered') return
                updatePhase('signatureFading')
                const fadeTimer = window.setTimeout(() => {
                    if (phaseRef.current === 'signatureFading') updatePhase('revealing')
                }, SIGNATURE_FADE_MS)
                signatureTimersRef.current.push(fadeTimer)
            }

            if (holdMs > 0) {
                const holdTimer = window.setTimeout(startFade, holdMs)
                signatureTimersRef.current.push(holdTimer)
            } else {
                startFade()
            }
        },
        [updatePhase],
    )

    const handleSignatureComplete = useCallback(() => {
        if (phaseRef.current !== 'covered') return
        signatureDoneRef.current = true
        if (routeReadyRef.current) scheduleSignatureFade(SIGNATURE_HOLD_MS)
    }, [scheduleSignatureFade])

    const start = useCallback(
        (to: string) => {
            if (phaseRef.current !== 'idle') return
            clearSignatureTimers()
            targetRef.current = to
            routeReadyRef.current = false
            signatureDoneRef.current = false
            updatePhase('covering')
        },
        [clearSignatureTimers, updatePhase],
    )

    const notifyReady = useCallback(
        (pathname: string) => {
            if (!targetRef.current || pathname !== targetRef.current) return
            routeReadyRef.current = true
            if (phaseRef.current === 'covered' && signatureDoneRef.current) {
                scheduleSignatureFade(0)
            }
        },
        [scheduleSignatureFade],
    )

    useEffect(() => {
        if (phase !== 'covering') return

        const timer = window.setTimeout(() => {
            updatePhase('covered')
            const target = targetRef.current
            if (target) navigate(target)
        }, COVER_MS)

        return () => window.clearTimeout(timer)
    }, [phase, navigate, updatePhase])

    useEffect(() => {
        if (phase !== 'revealing') return

        const timer = window.setTimeout(() => {
            targetRef.current = null
            routeReadyRef.current = false
            signatureDoneRef.current = false
            clearSignatureTimers()
            updatePhase('idle')
        }, REVEAL_END_MS)

        return () => window.clearTimeout(timer)
    }, [phase, clearSignatureTimers, updatePhase])

    useEffect(() => () => clearSignatureTimers(), [clearSignatureTimers])

    const api = useMemo(() => ({ start, notifyReady }), [start, notifyReady])
    const revealing = phase === 'revealing'
    const showSignature = phase === 'covered' || phase === 'signatureFading'

    const layerTransition = (exitDelay: number) =>
        revealing
            ? { duration: EXIT_DURATION, delay: exitDelay, ease: EASE }
            : { duration: COVER_DURATION, ease: EASE }

    return (
        <PageTransitionContext.Provider value={api}>
            {children}
            {phase !== 'idle' && (
                <div
                    aria-hidden="true"
                    className="pointer-events-auto fixed inset-0 z-[2000] overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-zinc-300 will-change-transform"
                        initial={{ y: '100%' }}
                        animate={{ y: revealing ? '-100%' : '0%' }}
                        transition={layerTransition(EXIT_BOTTOM_DELAY)}
                    />
                    <motion.div
                        className="absolute inset-0 bg-zinc-600 will-change-transform"
                        initial={{ y: '100%' }}
                        animate={{ y: revealing ? '-100%' : '0%' }}
                        transition={layerTransition(EXIT_MIDDLE_DELAY)}
                    />
                    <motion.div
                        className="absolute inset-0 bg-linear-to-b from-zinc-800 via-zinc-800 to-zinc-700 will-change-transform"
                        initial={{ y: '100%' }}
                        animate={{ y: revealing ? '-100%' : '0%' }}
                        transition={layerTransition(0)}
                    />

                    {showSignature && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
                            <motion.div
                                className="w-[min(1040px,94vw)] scale-50 text-zinc-50"
                                initial={{ opacity: 1 }}
                                animate={{
                                    opacity: phase === 'signatureFading' ? 0 : 1,
                                }}
                                transition={{
                                    duration: SIGNATURE_FADE_DURATION,
                                    ease: 'easeOut',
                                }}
                            >
                                <FullSignature onComplete={handleSignatureComplete} />
                            </motion.div>
                        </div>
                    )}
                </div>
            )}
        </PageTransitionContext.Provider>
    )
}
