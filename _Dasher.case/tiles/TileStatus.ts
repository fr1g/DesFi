import { createContext, useContext } from 'react'

export type TileStatus = {
    warn: boolean
    error: boolean
}

export type TileStatusCounts = {
    warn: number
    error: number
}

export type TileStatusRegistry = {
    setStatus: (id: string, status: TileStatus) => void
    clearStatus: (id: string) => void
}

export const TileStatusRegistryContext = createContext<TileStatusRegistry | null>(null)
export const TileStatusCountsContext = createContext<TileStatusCounts>({
    warn: 0,
    error: 0,
})

export function useTileStatusRegistry() {
    return useContext(TileStatusRegistryContext)
}

export function useTileStatusCounts() {
    return useContext(TileStatusCountsContext)
}
