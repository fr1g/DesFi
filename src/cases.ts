import type { RouteObject } from 'react-router'
import exampleRoutes from '../_example.case/Router'
import gazetteRoutes from '../_Gazette.case/Router'

// 所有设计案例的路由汇总：根路由与首页预览共用这一份；新增案例在这里登记
export const caseRoutes: RouteObject[] = [...exampleRoutes, ...gazetteRoutes]
