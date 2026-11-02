import { useCallback, useContext, useRef, useState } from 'react'
import { GridLayout } from 'react-grid-layout'
import type { EventCallback, Layout } from 'react-grid-layout'
import './styles/react-grid-layout.css'
import { bestFitCompactor } from './bestFitCompactor'
import { LAYOUTS, ROW_HEIGHT, ensureLayoutItems, stretchTextTileRows, stretchTrailingRow } from './layout'
import CriticalEventsTile from './tiles/CriticalEventsTile'
import ConnectivityOverviewTile from './tiles/ConnectivityOverviewTile'
import HealthTile from './tiles/HealthTile'
import HighAvailabilityTile from './tiles/HighAvailabilityTile'
import { EditModeContext } from './tiles/EditModeContext'
import InterfaceStatusTile from './tiles/InterfaceStatusTile'
import ResourceUsageTile from './tiles/ResourceUsageTile'
import SystemOverviewTile from './tiles/SystemOverviewTile'
import { TileMeasureContext } from './tiles/TileMeasureContext'
import WanQualityTile from './tiles/WanQualityTile'
import WanRateTile from './tiles/WanRateTile'
import { MODULE_WIDTH, useModuleWidth } from './useModuleWidth'

const layoutEqual = (a: Layout, b: Layout) =>
    a.length === b.length &&
    a.every((item, index) => {
        const other = b[index]
        return (
            other !== undefined &&
            item.i === other.i &&
            item.x === other.x &&
            item.y === other.y &&
            item.w === other.w &&
            item.h === other.h
        )
    })

const SECTION_FOCUS =
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-300/40'

export default function Home() {
    const width = useModuleWidth()
    const columns = width / MODULE_WIDTH
    const baseLayout = LAYOUTS[columns] ?? LAYOUTS[5]
    const [layoutByColumns, setLayoutByColumns] = useState<Record<number, Layout>>({})
    const [manualLayoutColumns, setManualLayoutColumns] = useState<Record<number, boolean>>({})
    const stretchHeights = useCallback(
        (next: Layout) => stretchTrailingRow(next, columns),
        [columns],
    )
    const rawLayout = stretchHeights(
        ensureLayoutItems(layoutByColumns[columns] ?? baseLayout, baseLayout),
    )
    const layout = manualLayoutColumns[columns]
        ? rawLayout
        : stretchTextTileRows(rawLayout, columns)
    const editing = useContext(EditModeContext)
    const naturalHeights = useRef<Record<number, Record<string, number>>>({})

    const updateCurrentLayout = useCallback(
        (updater: (current: Layout) => Layout) => {
            setLayoutByColumns((previous) => {
                const current = ensureLayoutItems(previous[columns] ?? baseLayout, baseLayout)
                const next = ensureLayoutItems(stretchHeights(updater(current)), baseLayout)
                if (layoutEqual(current, next)) return previous
                return { ...previous, [columns]: next }
            })
        },
        [baseLayout, columns, stretchHeights],
    )

    const handleLayoutChange = useCallback(
        (next: Layout) => {
            updateCurrentLayout(() => next)
        },
        [updateCurrentLayout],
    )

    const handleResizeStop = useCallback<EventCallback>(
        (_next, _oldItem, newItem) => {
            if (newItem?.i !== 'ha') return
            setManualLayoutColumns((previous) =>
                previous[columns] ? previous : { ...previous, [columns]: true },
            )
        },
        [columns],
    )

    const handleMeasure = useCallback(
        (id: string, naturalHeight: number) => {
            const measurements = (naturalHeights.current[columns] ??= {})
            measurements[id] = naturalHeight
            const h = Math.max(1, Math.ceil(naturalHeight / ROW_HEIGHT))
            const toRows = (value: number | undefined) =>
                value === undefined ? undefined : Math.max(1, Math.ceil(value / ROW_HEIGHT))

            updateCurrentLayout((current) => {
                const system = current.find((entry) => entry.i === 'system')
                const iface = current.find((entry) => entry.i === 'interface')
                const paired =
                    system !== undefined &&
                    iface !== undefined &&
                    system.y === iface.y &&
                    system.x < iface.x

                if (paired && (id === 'system' || id === 'interface')) {
                    const systemRows = toRows(measurements.system)
                    const interfaceRows = toRows(measurements.interface)
                    if (systemRows === undefined || interfaceRows === undefined) {
                        const item = id === 'system' ? system : iface
                        if (item.h === h) return current
                        return current.map((entry) => (entry.i === id ? { ...entry, h } : entry))
                    }
                    const rowHeight = Math.max(systemRows, interfaceRows)
                    if (system.h === rowHeight && iface.h === rowHeight) return current
                    return current.map((entry) =>
                        entry.i === 'system' || entry.i === 'interface'
                            ? { ...entry, h: rowHeight }
                            : entry,
                    )
                }

                const item = current.find((entry) => entry.i === id)
                if (!item || item.h === h) return current
                return current.map((entry) => (entry.i === id ? { ...entry, h } : entry))
            })
        },
        [columns, updateCurrentLayout],
    )

    const haWidth = layout.find((item) => item.i === 'ha')?.w ?? 1

    return (
        <div className={`min-h-screen w-full overflow-x-hidden ${editing ? 'is-editing' : ''} py-px`}>
            <div className="mx-auto" style={{ width }}>
                <TileMeasureContext.Provider value={handleMeasure}>
                    <GridLayout
                        key={columns}
                        width={width}
                        layout={layout}
                        onLayoutChange={handleLayoutChange}
                        onResizeStop={handleResizeStop}
                        gridConfig={{
                            cols: columns,
                            rowHeight: ROW_HEIGHT,
                            margin: [0, 0],
                            containerPadding: [0, 0],
                        }}
                        dragConfig={{
                            enabled: editing,
                            bounded: true,
                            cancel: 'button, a, input, select, textarea',
                        }}
                        resizeConfig={{ enabled: editing, handles: ['e', 'w'] }}
                        compactor={bestFitCompactor}
                    >
                        <div key="system" id="dasher-system" tabIndex={-1} className={SECTION_FOCUS}>
                            <SystemOverviewTile />
                        </div>
                        <div key="interface" id="dasher-interface" tabIndex={-1} className={SECTION_FOCUS}>
                            <InterfaceStatusTile />
                        </div>
                        <div key="health" id="dasher-health" tabIndex={-1} className={SECTION_FOCUS}>
                            <HealthTile compact={columns === 1} />
                        </div>
                        <div key="wan-rate" id="dasher-wan-rate" tabIndex={-1} className={SECTION_FOCUS}>
                            <WanRateTile />
                        </div>
                        <div
                            key="wan-quality"
                            id="dasher-wan-quality"
                            tabIndex={-1}
                            className={SECTION_FOCUS}
                        >
                            <WanQualityTile />
                        </div>
                        <div
                            key="resources"
                            id="dasher-resources"
                            tabIndex={-1}
                            className={SECTION_FOCUS}
                        >
                            <ResourceUsageTile />
                        </div>
                        <div
                            key="connectivity"
                            id="dasher-connectivity"
                            tabIndex={-1}
                            className={SECTION_FOCUS}
                        >
                            <ConnectivityOverviewTile />
                        </div>
                        <div key="ha" id="dasher-ha" tabIndex={-1} className={SECTION_FOCUS}>
                            <HighAvailabilityTile wide={haWidth >= 2} />
                        </div>
                        <div key="critical" id="dasher-critical" tabIndex={-1} className={SECTION_FOCUS}>
                            <CriticalEventsTile />
                        </div>
                    </GridLayout>
                </TileMeasureContext.Provider>
            </div>
        </div>
    )
}
