import { createContext } from 'react'

export type TileMeasure = (id: string, naturalHeight: number) => void

export const TileMeasureContext = createContext<TileMeasure | null>(null)
