import { createContext, useContext } from 'react'

export type PageTransitionApi = {
    start: (to: string) => void
    notifyReady: (pathname: string) => void
}

export const PageTransitionContext = createContext<PageTransitionApi | null>(null)

export function usePageTransition() {
    const context = useContext(PageTransitionContext)
    if (!context) {
        throw new Error('usePageTransition must be used inside PageTransitionProvider')
    }
    return context
}
