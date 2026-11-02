import { useEffect, useState } from 'react'
import { animate, motion, useReducedMotion } from 'motion/react'

const TITLE = "Feiron's Designs"
const CHARACTER_DELAY = 0.055
const START_DELAY = 0.15
const CURSOR_HIDE_DELAY = 1000

type TypingTextProps = {
    active?: boolean
}

export default function TypingText({ active = true }: TypingTextProps) {
    const reduceMotion = useReducedMotion()
    const [visibleCount, setVisibleCount] = useState(0)
    const [cursorVisible, setCursorVisible] = useState(true)
    const displayCount = active ? (reduceMotion ? TITLE.length : visibleCount) : 0

    useEffect(() => {
        if (!active) return

        if (reduceMotion) {
            const timer = window.setTimeout(() => setCursorVisible(false), CURSOR_HIDE_DELAY)
            return () => window.clearTimeout(timer)
        }

        let hideTimer = 0
        const typing = animate(0, TITLE.length, {
            duration: TITLE.length * CHARACTER_DELAY,
            delay: START_DELAY,
            ease: 'linear',
            onUpdate: (value) => {
                setVisibleCount(Math.min(TITLE.length, Math.ceil(value)))
            },
            onComplete: () => {
                setVisibleCount(TITLE.length)
                hideTimer = window.setTimeout(
                    () => setCursorVisible(false),
                    CURSOR_HIDE_DELAY,
                )
            },
        })

        return () => {
            typing.stop()
            window.clearTimeout(hideTimer)
        }
    }, [active, reduceMotion])

    return (
        <span className="inline-block whitespace-pre">
            <span className="sr-only">{TITLE}</span>
            <span aria-hidden="true" className="relative inline-block whitespace-pre">
                <span className="invisible">{TITLE}</span>
                <span className="absolute inset-0 whitespace-pre text-left">
                    {TITLE.slice(0, displayCount)}
                    {active && cursorVisible && (
                        <motion.span
                            className="ml-[0.08em] inline-block h-[0.82em] w-[0.055em] translate-y-[0.08em] bg-current align-baseline"
                            animate={
                                reduceMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }
                            }
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : {
                                          duration: 0.8,
                                          repeat: Infinity,
                                          ease: 'linear',
                                      }
                            }
                        />
                    )}
                </span>
            </span>
        </span>
    )
}
