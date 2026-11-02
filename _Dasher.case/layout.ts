import type { Layout, LayoutItem } from 'react-grid-layout'

export const ROW_HEIGHT = 8

// 5 列是 1650px 的基准布局；高度单位是 8px 行。
const LAYOUT_5: Layout = [
    { i: 'system', x: 0, y: 0, w: 2, h: 52, minW: 1 },
    { i: 'interface', x: 2, y: 0, w: 3, h: 52, minW: 1 },
    { i: 'health', x: 0, y: 52, w: 3, h: 65, minW: 1 },
    { i: 'wan-rate', x: 3, y: 52, w: 2, h: 39, minW: 1 },
    { i: 'wan-quality', x: 3, y: 91, w: 2, h: 26, minW: 1 },
    { i: 'resources', x: 0, y: 117, w: 3, h: 30, minW: 1 },
    { i: 'connectivity', x: 3, y: 117, w: 2, h: 30, minW: 1 },
    { i: 'ha', x: 0, y: 147, w: 1, h: 18, minW: 1 },
    { i: 'critical', x: 1, y: 147, w: 2, h: 18, minW: 1 },
]

const LAYOUT_4: Layout = [
    { i: 'system', x: 0, y: 0, w: 2, h: 52, minW: 1 },
    { i: 'interface', x: 2, y: 0, w: 2, h: 52, minW: 1 },
    { i: 'health', x: 0, y: 52, w: 2, h: 65, minW: 1 },
    { i: 'wan-rate', x: 2, y: 52, w: 2, h: 39, minW: 1 },
    { i: 'wan-quality', x: 2, y: 91, w: 2, h: 26, minW: 1 },
    { i: 'resources', x: 0, y: 117, w: 2, h: 30, minW: 1 },
    { i: 'connectivity', x: 2, y: 117, w: 2, h: 30, minW: 1 },
    { i: 'ha', x: 0, y: 147, w: 1, h: 18, minW: 1 },
    { i: 'critical', x: 1, y: 147, w: 2, h: 18, minW: 1 },
]

const LAYOUT_3: Layout = [
    { i: 'system', x: 0, y: 0, w: 1, h: 52, minW: 1 },
    { i: 'interface', x: 1, y: 0, w: 2, h: 52, minW: 1 },
    { i: 'health', x: 0, y: 52, w: 2, h: 65, minW: 1 },
    { i: 'wan-rate', x: 2, y: 52, w: 1, h: 39, minW: 1 },
    { i: 'wan-quality', x: 2, y: 91, w: 1, h: 26, minW: 1 },
    { i: 'resources', x: 0, y: 117, w: 2, h: 30, minW: 1 },
    { i: 'connectivity', x: 2, y: 117, w: 1, h: 30, minW: 1 },
    { i: 'ha', x: 0, y: 147, w: 1, h: 18, minW: 1 },
    { i: 'critical', x: 1, y: 147, w: 2, h: 18, minW: 1 },
]

const LAYOUT_2: Layout = [
    { i: 'system', x: 0, y: 0, w: 2, h: 52, minW: 1 },
    { i: 'interface', x: 0, y: 52, w: 2, h: 52, minW: 1 },
    { i: 'health', x: 0, y: 104, w: 2, h: 65, minW: 1 },
    { i: 'wan-rate', x: 0, y: 169, w: 2, h: 39, minW: 1 },
    { i: 'wan-quality', x: 0, y: 208, w: 2, h: 26, minW: 1 },
    { i: 'resources', x: 0, y: 234, w: 2, h: 30, minW: 1 },
    { i: 'connectivity', x: 0, y: 264, w: 2, h: 30, minW: 1 },
    { i: 'ha', x: 0, y: 294, w: 1, h: 18, minW: 1 },
    { i: 'critical', x: 1, y: 294, w: 1, h: 18, minW: 1 },
]

const LAYOUT_1: Layout = [
    { i: 'system', x: 0, y: 0, w: 1, h: 52, minW: 1 },
    { i: 'interface', x: 0, y: 52, w: 1, h: 75, minW: 1 },
    { i: 'health', x: 0, y: 127, w: 1, h: 65, minW: 1 },
    { i: 'wan-rate', x: 0, y: 192, w: 1, h: 39, minW: 1 },
    { i: 'wan-quality', x: 0, y: 231, w: 1, h: 26, minW: 1 },
    { i: 'resources', x: 0, y: 257, w: 1, h: 30, minW: 1 },
    { i: 'connectivity', x: 0, y: 287, w: 1, h: 30, minW: 1 },
    { i: 'ha', x: 0, y: 317, w: 1, h: 18, minW: 1 },
    { i: 'critical', x: 0, y: 335, w: 1, h: 18, minW: 1 },
]

export const LAYOUTS: Record<number, Layout> = {
    1: LAYOUT_1,
    2: LAYOUT_2,
    3: LAYOUT_3,
    4: LAYOUT_4,
    5: LAYOUT_5,
}

/**
 * 单个 trailing tile 的增高：目标底边之外，遇到下方横向重叠的 tile 时只到它的顶边，
 * 避免继续把已有的占位向下推，造成高度/重排反馈。
 */
function stretchTileTo(
    layout: Layout,
    item: LayoutItem,
    targetBottom: number,
): LayoutItem {
    if (targetBottom <= item.y + item.h) return item

    let allowedBottom = targetBottom
    for (const other of layout) {
        if (other.i === item.i) continue
        const overlapsX =
            item.x < other.x + other.w && item.x + item.w > other.x
        if (!overlapsX || other.y < item.y + item.h) continue
        allowedBottom = Math.min(allowedBottom, other.y)
    }

    if (allowedBottom <= item.y + item.h) return item
    return { ...item, h: allowedBottom - item.y }
}

/**
 * 宽版底部 ha/critical 补到右侧列的最低底边；2 列时两者并排，互相补齐到较高者。
 * 只增高不缩回。
 */
export function stretchTrailingRow(layout: Layout, columns: number): Layout {
    if (columns === 2) {
        const ha = layout.find((item) => item.i === 'ha')
        const critical = layout.find((item) => item.i === 'critical')
        if (!ha || !critical) return layout

        const targetBottom = Math.max(ha.y + ha.h, critical.y + critical.h)
        let changed = false
        const next = layout.map((item) => {
            if (item.i !== 'ha' && item.i !== 'critical') return item
            const stretched = stretchTileTo(layout, item, targetBottom)
            if (stretched !== item) changed = true
            return stretched
        })
        return changed ? next : layout
    }

    if (columns < 3) return layout

    const wanRate = layout.find((item) => item.i === 'wan-rate')
    const wanQuality = layout.find((item) => item.i === 'wan-quality')
    if (!wanRate || !wanQuality) return layout

    const connectivity = layout.find((item) => item.i === 'connectivity')
    const targetBottom = Math.max(
        wanRate.y + wanRate.h,
        wanQuality.y + wanQuality.h,
        connectivity ? connectivity.y + connectivity.h : 0,
    )
    let changed = false
    const next = layout.map((item) => {
        if (item.i !== 'ha' && item.i !== 'critical') return item
        const stretched = stretchTileTo(layout, item, targetBottom)
        if (stretched !== item) changed = true
        return stretched
    })

    return changed ? next : layout
}

/**
 * 纯文字 tile 可以作为横向伸缩块填满行尾空位；带图表或图标的内容不参与。
 * `ha` 在 2U 及以上会显示装饰性图表水印。
 */
const STRETCHABLE_TEXT_TILE_IDS = new Set(['health', 'connectivity', 'ha', 'critical'])

function boxesOverlap(a: LayoutItem, b: LayoutItem) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    )
}

function layoutHasOverlap(items: readonly LayoutItem[]) {
    return items.some((item, index) =>
        items.slice(index + 1).some((other) => boxesOverlap(item, other)),
    )
}

/**
 * 行尾横向补位：优先由本行的纯文字 tile 吸收剩余列，后续 tile 整体右移。
 * 仅处理整行最右侧未到 columns 的情况，且扩展后不能与跨行 tile 重叠。
 */
export function stretchTextTileRows(layout: Layout, columns: number): Layout {
    let items: LayoutItem[] = layout.map((item) => ({ ...item }))
    const rowYs = [...new Set(items.map((item) => item.y))].sort((a, b) => a - b)

    for (const y of rowYs) {
        const rowItems = items.filter((item) => item.y === y)
        if (rowItems.length === 0 || rowItems.some((item) => item.static)) continue

        const rowRight = rowItems.reduce(
            (right, item) => Math.max(right, item.x + item.w),
            0,
        )
        const free = columns - rowRight
        if (free <= 0) continue

        const candidate = rowItems
            .filter((item) => STRETCHABLE_TEXT_TILE_IDS.has(item.i))
            .sort((a, b) => a.x - b.x)[0]
        if (!candidate) continue

        const maxGrow = Math.min(free, (candidate.maxW ?? columns) - candidate.w)
        if (maxGrow <= 0) continue

        const candidateRight = candidate.x + candidate.w
        let stretched: LayoutItem[] | null = null

        // 跨行 tile 可能只让出部分列；从最大可用宽度逐列回退，能补多少补多少。
        for (let grow = maxGrow; grow > 0; grow -= 1) {
            const next = items.map((item) => {
                if (item.i === candidate.i) return { ...item, w: item.w + grow }
                if (item.y === y && item.x >= candidateRight) {
                    return { ...item, x: item.x + grow }
                }
                return item
            })

            if (!layoutHasOverlap(next)) {
                stretched = next
                break
            }
        }

        if (!stretched) continue
        items = stretched
    }

    return items
}

/**
 * 开发期 HMR / 旧 state 可能还保留着没有新 tile 的 layout；
 * 把 base layout 里缺失的 item 补回去，避免新 child 不渲染。
 */
export function ensureLayoutItems(current: Layout, base: Layout): Layout {
    const ids = new Set(current.map((item) => item.i))
    const missing = base.filter((item) => !ids.has(item.i))
    return missing.length === 0 ? current : [...current, ...missing]
}

function isOccupiedAt(items: readonly LayoutItem[], x: number, y: number) {
    return items.some(
        (item) => x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h,
    )
}

function isFreeRect(items: readonly LayoutItem[], candidate: LayoutItem, x: number, y: number) {
    const right = x + candidate.w
    const bottom = y + candidate.h
    return !items.some(
        (item) =>
            item.i !== candidate.i &&
            x < item.x + item.w &&
            right > item.x &&
            y < item.y + item.h &&
            bottom > item.y,
    )
}

/**
 * 如果下一行的某个子集宽度之和正好等于当前行空档总额，
 * 把当前行 item 左对齐到该行顶部，再把该子集整体补进剩余列。
 * 跨行/较高的 item 仍按完整矩形检查。
 */
function tryMergeNextRow(
    items: LayoutItem[],
    rowY: number,
    nextY: number,
    cols: number,
): LayoutItem[] | null {
    const current = items.filter((item) => item.y === rowY)
    if (current.length === 0 || current.some((item) => item.static)) return null

    const currentWidth = current.reduce((sum, item) => sum + item.w, 0)
    const above = items.filter((item) => item.y < rowY && item.y + item.h > rowY)
    const aboveWidth = above.reduce((sum, item) => sum + item.w, 0)
    const freeTotal = cols - currentWidth - aboveWidth
    if (freeTotal <= 0) return null

    const nextItems = items.filter((item) => item.y === nextY && !item.static)
    if (nextItems.length === 0) return null

    const currentSorted = [...current].sort((a, b) => a.x - b.x)
    const nextSorted = [...nextItems].sort((a, b) => a.x - b.x)
    const currentIds = new Set(current.map((item) => item.i))
    const stationaryBase = items.filter((item) => !currentIds.has(item.i))

    let bestPositions: Map<string, number> | null = null
    let bestCount = 0
    const maskLimit = 1 << nextSorted.length

    for (let mask = 1; mask < maskLimit; mask += 1) {
        const subset = nextSorted.filter((_, index) => (mask & (1 << index)) !== 0)
        if (subset.length <= bestCount) continue

        const width = subset.reduce((sum, item) => sum + item.w, 0)
        if (width !== freeTotal) continue

        const subsetIds = new Set(subset.map((item) => item.i))
        const stationary = stationaryBase.filter((item) => !subsetIds.has(item.i))
        const positions = new Map<string, number>()
        let x = 0
        let fits = true

        for (const item of currentSorted) {
            if (!isFreeRect(stationary, item, x, rowY)) {
                fits = false
                break
            }
            positions.set(item.i, x)
            x += item.w
        }
        if (!fits) continue

        for (const item of subset) {
            if (!isFreeRect(stationary, item, x, rowY)) {
                fits = false
                break
            }
            positions.set(item.i, x)
            x += item.w
        }
        if (!fits) continue

        bestPositions = positions
        bestCount = subset.length
    }

    if (!bestPositions) return null

    return items.map((item) => {
        const x = bestPositions.get(item.i)
        return x === undefined ? item : { ...item, x, y: rowY }
    })
}

/**
 * 行带空档补位：默认 vertical 吸顶之后，逐个 y 行带扫描。
 * 先尝试“下一行子集正好填满本行空档总额”，把本行左对齐并整组补位；
 * 找不到精确组合时，再回退到逐空档挑宽度完全相等/最窄的单个 item。
 */
export function fillNextRowGaps(layout: Layout, cols: number): Layout {
    let items: LayoutItem[] = layout.map((item) => ({ ...item }))
    const rowYs = [...new Set(items.map((item) => item.y))].sort((a, b) => a - b)

    for (let rowIndex = 0; rowIndex < rowYs.length - 1; rowIndex += 1) {
        const y = rowYs[rowIndex]
        const nextY = rowYs[rowIndex + 1]

        const merged = tryMergeNextRow(items, y, nextY, cols)
        if (merged) {
            items = merged
            continue
        }

        let x = 0

        while (x < cols) {
            if (isOccupiedAt(items, x, y)) {
                x += 1
                continue
            }

            let gapEnd = x
            while (gapEnd < cols && !isOccupiedAt(items, gapEnd, y)) gapEnd += 1
            const gapWidth = gapEnd - x

            const candidates = items.filter(
                (item) =>
                    item.y === nextY &&
                    !item.static &&
                    item.w <= gapWidth &&
                    isFreeRect(items, item, x, y),
            )

            if (candidates.length === 0) {
                x = gapEnd
                continue
            }

            const candidate = candidates.reduce((best, item) => {
                const bestExact = best.w === gapWidth ? 0 : 1
                const itemExact = item.w === gapWidth ? 0 : 1
                if (itemExact !== bestExact) return itemExact < bestExact ? item : best
                if (item.w !== best.w) return item.w < best.w ? item : best
                return item.x < best.x ? item : best
            })

            items = items.map((item) => (item.i === candidate.i ? { ...item, x, y } : item))
            x += candidate.w
        }
    }

    return items
}

