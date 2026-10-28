import { Outlet } from 'react-router'

/**
 * example 案例的入口 / Layout。
 * 导航栏与页脚由设计稿提供后插入对应位置；页面内容通过 <Outlet /> 渲染
 * （案例内页面在本案例 Router.ts 的 children 里登记）。
 */
export default function App() {
    return (
        <div className="case-example min-h-screen bg-background text-foreground">
            {/* 导航栏插槽 */}

            <Outlet />

            {/* 页脚插槽 */}
        </div>
    )
}
