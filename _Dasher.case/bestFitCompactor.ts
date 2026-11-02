import { verticalCompactor } from 'react-grid-layout'
import type { Compactor } from 'react-grid-layout'
import { fillNextRowGaps } from './layout'

/**
 * 默认垂直吸顶 -> 行带空档按“正好/最窄”补位 -> 再吸顶。
 * 只对紧邻下一行的 item 做搬运，不会把更后面的 tile 跨行提到前面。
 */
export const bestFitCompactor: Compactor = {
    type: 'vertical',
    allowOverlap: false,
    compact(layout, cols) {
        const compacted = verticalCompactor.compact(layout, cols)
        const filled = fillNextRowGaps(compacted, cols)
        return verticalCompactor.compact(filled, cols)
    },
}
