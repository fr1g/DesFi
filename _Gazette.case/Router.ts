import type { RouteObject } from 'react-router'
import App from './App'
import Index from './pages/Index'
import Article from './pages/Article'
import Topic from './pages/Topic'
import NotFound from './pages/NotFound'


/**
 * Gazette 案例自己的路由，由根路由（src/Router.tsx）展开注册。
 * 顶层 path 为案例的挂载前缀，`/Gazette/*` 覆盖本案例整个子树；
 * 案例内的页面相对它书写（如 path: 'about' 对应 /Gazette/about）。
 */
const routes: RouteObject[] = [
    {
        path: '/Gazette/*',
        Component: App,
        children: [
            // 页面做好后在这里逐条登记，例如：
            { index: true, Component: Index },
            { path: 'art/:pid', Component: Article },
            { path: 'topic/:topicName', Component: Topic },
            { path: '*', Component: NotFound }
        ],
    },
]

export default routes
