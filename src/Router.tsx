import { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router'
import type { RouteObject } from 'react-router'
import { caseRoutes } from './cases'
// 全局样式入口（含各案例主题）；main.tsx 只负责挂载根路由
import './index.css'
import Index from './Index'
import { PageTransitionProvider, RouteReadyReporter } from './PageTransition'

const routes: RouteObject[] = [
    { path: '/', element: <Index /> },
    // 注册各设计案例：展开案例导出的路由（path 为 /<案例名>/*，指向案例文件夹的 App）
    ...caseRoutes,
]

// 统一的懒加载边界：案例路由用 React.lazy 整体懒加载，fallback 不渲染内容
function AppRoutes() {
    return (
        <Suspense fallback={null}>
            <RouteReadyReporter>{useRoutes(routes)}</RouteReadyReporter>
        </Suspense>
    )
}

export default function Router() {
    return (
        <BrowserRouter>
            <PageTransitionProvider>
                <AppRoutes />
            </PageTransitionProvider>
        </BrowserRouter>
    )
}
