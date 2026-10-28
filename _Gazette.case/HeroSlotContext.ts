import { createContext } from 'react'

// 专题页的全宽 hero 挂载点：App 在纸张之外渲染 div#gz-hero-slot，
// 并通过这个 context 把节点交给页面，页面用 createPortal 把 hero 渲染进去。
export const HeroSlotContext = createContext<HTMLElement | null>(null)
