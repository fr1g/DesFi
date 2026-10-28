import type { RouteObject } from 'react-router'
import App from './App'
import Home from './Home'

/**
 * example 案例自己的路由，由根路由（src/Router.tsx）展开注册。
 * 顶层 path 为案例的挂载前缀，`/example/*` 覆盖本案例整个子树；
 * 案例内的页面相对它书写（如 path: 'about' 对应 /example/about）。
 */
const routes: RouteObject[] = [
    {
        path: '/example/*',
        Component: App,
        children: [
            // 页面做好后在这里逐条登记，例如：
            { index: true, Component: Home },
            // { path: 'about', Component: About },
        ],
    },
]

export default routes
