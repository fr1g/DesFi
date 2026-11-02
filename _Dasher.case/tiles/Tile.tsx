import { useContext, useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import { EditModeContext } from './EditModeContext'
import { TileMeasureContext } from './TileMeasureContext'

type TileProps = {
    title?: string
    children?: ReactNode
    className?: string
    style?: CSSProperties
    measureId?: string
    status?: 'success' | 'warning' | 'danger'
}

const EDIT_INSET = 8

export default function Tile({
    title,
    children,
    className = '',
    style,
    measureId,
    status,
}: TileProps) {
    const measure = useContext(TileMeasureContext)
    const editing = useContext(EditModeContext)
    const rootRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const measured = Boolean(measureId && measure)

    useEffect(() => {
        if (!measureId || !measure) return
        const root = rootRef.current
        const content = contentRef.current
        if (!root || !content) return

        const update = () => {
            const rootStyle = getComputedStyle(root)
            const contentStyle = getComputedStyle(content)
            const rootGap =
                (Number.parseFloat(rootStyle.rowGap) ||
                    Number.parseFloat(rootStyle.gap) ||
                    0) * (titleRef.current && content ? 1 : 0)
            const natural =
                (Number.parseFloat(rootStyle.paddingTop) || 0) +
                (titleRef.current?.offsetHeight ?? 0) +
                rootGap +
                (Number.parseFloat(contentStyle.marginTop) || 0) +
                content.offsetHeight +
                (Number.parseFloat(rootStyle.paddingBottom) || 0)
            measure(measureId, natural)
        }

        update()
        const observer = new ResizeObserver(update)
        observer.observe(content)
        if (titleRef.current) observer.observe(titleRef.current)
        return () => observer.disconnect()
    }, [measure, measureId])

    return (
        <section
            ref={rootRef}
            className={`dsh-tile group flex gap-2 h-full min-h-0 flex-col p-4 text-base ${className}`}
            style={style}
        >
            <motion.div
                aria-hidden="true"
                className="dsh-tile-frame"
                initial={false}
                animate={{
                    top: editing ? EDIT_INSET : 0,
                    right: editing ? EDIT_INSET : 0,
                    bottom: editing ? EDIT_INSET : 0,
                    left: editing ? EDIT_INSET : 0,
                }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
            />
            {title && (
                <div className="relative shrink-0 items-center justify-between gap-2 ">
                    <h3 ref={titleRef} className="text-base font-semibold text-dsh-text-title">
                        {title}
                    </h3>
                    {status === 'warning' && (
                        <span
                            role="img"
                            aria-label="警告状态"
                            className="size-2 absolute top-0 right-0 rounded-full bg-dsh-warning"
                        />
                    )}
                </div>
            )}
            {children && (
                <div
                    ref={contentRef}
                    className={`mt-2 flex gap-4 flex-col ${measured ? 'shrink-0' : 'min-h-0 flex-1'}`}
                >
                    {children}
                </div>
            )}
        </section>
    )
}
