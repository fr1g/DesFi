import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
    TileStatusCountsContext,
    TileStatusRegistryContext,
    type TileStatus,
} from './TileStatus'

export function TileStatusProvider({ children }: { children: ReactNode }) {
    const [statuses, setStatuses] = useState<Record<string, TileStatus>>({})

    const setStatus = useCallback((id: string, status: TileStatus) => {
        setStatuses((previous) => {
            const current = previous[id]
            if (
                current &&
                current.warn === status.warn &&
                current.error === status.error
            ) {
                return previous
            }
            return { ...previous, [id]: status }
        })
    }, [])

    const clearStatus = useCallback((id: string) => {
        setStatuses((previous) => {
            if (!(id in previous)) return previous
            const next = { ...previous }
            delete next[id]
            return next
        })
    }, [])

    const registry = useMemo(
        () => ({ setStatus, clearStatus }),
        [setStatus, clearStatus],
    )

    const counts = useMemo(() => {
        let warn = 0
        let error = 0
        Object.values(statuses).forEach((status) => {
            if (status.warn) warn += 1
            if (status.error) error += 1
        })
        return { warn, error }
    }, [statuses])

    return (
        <TileStatusRegistryContext.Provider value={registry}>
            <TileStatusCountsContext.Provider value={counts}>
                {children}
            </TileStatusCountsContext.Provider>
        </TileStatusRegistryContext.Provider>
    )
}
