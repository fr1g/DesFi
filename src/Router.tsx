import { BrowserRouter, useRoutes } from 'react-router'
import type { RouteObject } from 'react-router'
import { caseRoutes } from './cases'
// 全局样式入口（含各案例主题）；main.tsx 只负责挂载根路由
import './index.css'
import Index from './Index'

const routes: RouteObject[] = [
    { path: '/', element: <Index /> },
    // 注册各设计案例：展开案例导出的路由（path 为 /<案例名>/*，指向案例文件夹的 App）
    ...caseRoutes,
]

function AppRoutes() {
    return useRoutes(routes)
}

export default function Router() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    )
}
