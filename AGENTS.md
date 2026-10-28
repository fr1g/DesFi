# AGENTS.md

「设计集」项目：一个 Vite + React + TSX 应用，用路由收纳多个互不干扰的设计案例。
本文件是 Agent 在本仓库工作时的约定，改动代码前先读它。

## 职责边界

- Agent 只负责代码对接与功能实现，一切功能必须建立在现有 UI 样式之上：复用已有的页面结构、类名与样式，不另起一套。
- Agent 不插手 UI 设计：不新增、移动或修改视觉呈现（布局、样式、配色、间距、文案排布等），只做 React、React Router 这类代码层面的对接。
- 功能实现需要还不存在的 UI 时，先停下向用户说明缺什么，等 UI 就位后再对接，不要自己临时造一个界面顶上。
- 豁免：用户给出颜色／动效规范、或要求 Agent 实现部分组件的动效时，Agent 可直接据此实现深色模式与对应动效，这不算插手 UI；规范没覆盖的部分仍然不动。

## 技术栈与命令

- Vite + React + TypeScript，组件一律用 `.tsx`；包管理用 pnpm。
- 路由：React Router v8（声明式 BrowserRouter + useRoutes）。RouteObject 支持 `Component` 字段，案例路由文件可保持 `.ts`。
- 样式：Tailwind CSS v4（`@tailwindcss/vite` 插件，无配置文件，主题写在 CSS 里）。
- 组件原语：Headless UI，`import { Dialog } from '@headlessui/react'`。
- 图标：`import { CloseIcon } from 'tdesign-icons-react'`。
- 工具：es-toolkit，`import { debounce } from 'es-toolkit'`。
- 动效：Motion（即 Framer Motion），`import { motion } from 'motion/react'`。
- 命令：`pnpm dev` / `pnpm build`（tsc -b + vite build）/ `pnpm lint`（oxlint）。改动后跑 build 和 lint。
- 浏览器验证案例页时，在 URL hash 里加 `@preview`（如 `/Gazette#@preview`），避免案例的 AI 内容声明弹窗。

## 目录与路由结构

- `src/main.tsx`：挂载根路由，并注册字体缓存用的 Service Worker；不引入样式。
- `src/Router.tsx`：根路由。BrowserRouter 包住 useRoutes；`/` 渲染首页 `src/Index.tsx`；展开 `src/cases.ts` 里的案例路由。全局样式入口 `src/index.css` 在这里引入。
- `src/Index.tsx`：首页框架。案例列表（来自 `src/cases.ts`）+ iframe 预览：hover 链接切换预览、点击跳转到案例页、iframe 按 bg-cover 方式铺满预览区并居中，加载中有淡入淡出遮盖（Motion）。
- `src/cases.ts`：所有案例路由的汇总，根路由与首页预览共用；新增案例在这里登记。
- `_shared/`：跨案例共享的代码（如 `lorem.ts` 的占位文本），不是设计案例，不需要在根路由注册。
- `src/index.css`：全局 Tailwind 入口（tailwindcss 导入、dark 变体、语义色注册表、各案例样式 @import）。
- 每个设计案例是根目录下的一个文件夹，文件夹名固定为 `_<案例名>.case` 格式（`<案例名>` 是整体占位符）：`_` 前缀让案例在文件管理器里排最前，`.case` 后缀与普通文件夹区分。**只有文件夹名用这个格式，文件夹内部的命名一律用案例名本身**——如案例 `example`：文件夹是 `_example.case`，内部是 `.case-example`、`/example`、`--color-example-*`。文件夹内固定四个文件：
    - `App.tsx`：案例入口 / Layout。渲染导航栏、`<Outlet />`、页脚；导航与页脚由用户提供后插入。
    - `Router.ts`：案例自己的路由（导出 `RouteObject[]`）。顶层 `path` 为 `/<案例名>/*`（覆盖案例整个子树），`Component` 指向本案例的 `App`；案例内页面相对该前缀书写。
    - `index.css`：案例主题与其他设计定义（带作用域，见下）。由全局入口 @import，App.tsx 不要再 import 它。
    - `README.md`：案例说明，初始为空。

## 新建设计案例

用户要求新建案例时会直接提供案例名（例如"复制 example 建一个 xxx 案例"），流程：

1. 把 `_example.case/` 整体复制为 `_<新案例名>.case/`。
2. 把新案例文件夹内部所有 `example` 字样替换为新案例名（容器类 `.case-example`、专属 token 前缀 `--color-example-*`、路由 path `/example`、注释等全部替换）；文件夹名保持 `_<新案例名>.case` 格式。
3. 在 `src/cases.ts` 里导入并展开新案例的路由（path 为 `/<新案例名>/*`，指向新案例的 `App`）；根路由与首页预览会自动带上它。
4. 补两处登记：`src/index.css` 里 @import 新案例的 index.css；`tsconfig.app.json` 的 include 加上 `_<新案例名>.case`。
5. 跑 `pnpm build` 与 `pnpm lint` 确认无误。

## 主题隔离（Tailwind）

思路：token 名字全局注册一次，值全部限定在案例作用域内，案例之间互不影响。

- 语义色注册表在 `src/index.css` 的 `@theme inline`（background / foreground / primary / secondary / muted / accent / border / ring 及各自的 -foreground）。工具类直接引用 `var(--primary)` 这类变量，不向 `:root` 写值。需要新增语义色名时在注册表加一行。
- 案例 `index.css` 把浅色值写在 `.case-<案例名>` 作用域里（容器类名见案例的 App.tsx，如 `.case-example`），深色值写在 `.dark .case-<案例名>` 下。
- 案例专属 token 在案例 `index.css` 里用 `@theme` 注册，名字带 `<案例名>-` 前缀（如 `--color-example-highlight`），避免跨案例撞名；对应工具类如 `bg-example-highlight`。
- Tailwind 原生刻度（`--font-*`、`--radius-*`、`--shadow-*` 等）可直接在案例作用域里覆盖，不用注册。
- 深色模式：任意祖先节点加 `.dark` 类即可切换（通常放 `<html>`），已配好 dark 变体，工具类也可用 `dark:` 前缀。

## 动效实现（Motion）

- 用户要求 Agent 实现部分组件的动效时，属于「不插手 UI」的豁免范围。
- 动效必须使用 Framer Motion（本项目的 `motion` 包，`import { motion } from 'motion/react'`）。如果它不支持或无法实现，先停下告诉用户，不要自行换库，也不要用 CSS 动画顶替。
- 用 `motion.div` 替换原有 `div` 时，原有 `className` 原封不动保留。
- 一切动效都通过 `motion.div` 的属性设置（initial / animate / transition / exit / variants / whileHover 等），用这些内联样式覆盖可能冲突的类名样式；不要为了做动效去改动 class 或样式文件。

## 字体

- 字体工具类在 `src/fonts.css` 的 `@theme` 注册（`--font-*` → `font-*`），全站可用：`font-lxgw-wenkai`、`font-lxgw-mono`（霞鹜文楷 / Mono）、`font-din`（D-DIN-PRO）、`font-oppo-sans`、`font-maple-mono`、`font-smiley-sans`（得意黑）、`font-jetbrains-mono`、`font-times`（Times New Roman / Tinos）。
- 来源：霞鹜文楷（含 Mono）由 index.html 引入的 jsDelivr 样式表提供（分片 woff2）；D-DIN-PRO、OPPO Sans、得意黑、Maple Mono、JetBrains Mono 的 @font-face 在 `src/fonts.css`，走 jsDelivr CDN。Tinos（`font-times` 的主字体，latin 子集）自托管在 `public/fonts/tinos-*.woff2`，不走 CDN；`font-times` 的汉字由后面的宋体/系统衬线兜底。
- 本地字体放 `public/fonts/`，@font-face 加在 `src/fonts.css`。
- `public/sw.js`：只缓存字体文件（woff/woff2/ttf/otf/eot，或请求类型为 font），其他请求一律透传不缓存；新增字体不用改它。由 `src/registerFontServiceWorker.ts` 注册。

## 代码风格

- 4 空格缩进。
- TS 开了 `verbatimModuleSyntax` 与 `erasableSyntaxOnly`：类型导入用 `import type`，不用 enum。
