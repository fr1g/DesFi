import { useEffect, useState } from 'react'

export const MODULE_WIDTH = 330
const MAX_COLUMNS = 5
/** 2 列起两侧各留 64px 给附加功能，最小断点不预留 */
const SIDE_SPACE = 64 * 2

function getModuleWidth() {
    if (typeof window === 'undefined') return MODULE_WIDTH * MAX_COLUMNS
    const viewportWidth = document.documentElement.clientWidth
    const columns = Math.min(
        MAX_COLUMNS,
        Math.max(1, Math.floor((viewportWidth - SIDE_SPACE) / MODULE_WIDTH)),
    )
    return columns * MODULE_WIDTH
}

/** 外层内容宽度：330 的整数倍，最多 5 列 / 1650px；2 列起的触发宽度另加 128px 侧边空间。 */
export function useModuleWidth() {
    const [width, setWidth] = useState(getModuleWidth)

    useEffect(() => {
        const update = () => setWidth(getModuleWidth())
        window.addEventListener('resize', update)
        update()
        return () => window.removeEventListener('resize', update)
    }, [])

    return width
}
