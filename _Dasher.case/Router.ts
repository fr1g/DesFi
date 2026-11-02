import { lazy } from 'react'
import type { RouteObject } from 'react-router'

// Dasher 整体懒加载：App 与页面都走动态 import。react-grid-layout 不在依赖白名单，
// 只能出现在这些懒加载组件内部；新增页面同样用 lazy(() => import(...)) 引入。
const App = lazy(() => import('./App'))
const Home = lazy(() => import('./Home'))

/**
 * Dasher 案例自己的路由，由根路由（src/Router.tsx）展开注册。
 * 顶层 path 为案例的挂载前缀，`/Dasher/*` 覆盖本案例整个子树；
 * 案例内的页面相对它书写（如 path: 'about' 对应 /Dasher/about）。
 */
const routes: RouteObject[] = [
    {
        path: '/Dasher/*',
        Component: App,
        children: [
            // 页面做好后在这里逐条登记，例如：
            { index: true, Component: Home },
            // { path: 'about', Component: About },
        ],
    },
]

export default routes
