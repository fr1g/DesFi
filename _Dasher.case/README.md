# Dasher

Dasher 是一个仅深色、高密度、零 gutter 的企业级路由器后台案例。视觉上保持扁平、克制，信息层级主要靠 1px 边界、状态点和排版建立。

本文件是当前生效的设计与实现规范，不再按日期累积变更记录；新增规则直接归入对应章节。

## 1. 布局与栅格

### 1.1 模块

- 横向单位是 **330px**；所有 tile 和内容宽度必须是 330 的整数倍。
- 内容区在视口中居中，最多 5 列 / 1650px；页面级零 padding、零 margin。
- RGL 的 `margin` 和 `containerPadding` 都是 `0`，块之间没有 gutter，相邻 tile 共用 1px 边界。
- 视口宽度决定列数：`clamp(floor((viewportWidth - 128) / 330), 1, 5)`。

| 列数 | 视口宽度 | 内容宽度 |
| --- | --- | --- |
| 1 | `< 788px` | 330px |
| 2 | `788–1117px` | 660px |
| 3 | `1118–1447px` | 990px |
| 4 | `1448–1777px` | 1320px |
| 5 | `≥ 1778px` | 1650px |

- 窄于 788px 时隐藏两侧固定 rail，改用底部悬浮控制条。
- 2 列及以上，两侧各预留 64px 的固定 rail 空间；1 列只保留页面居中留白。

### 1.2 垂直量化

- 纵向单位是 **8px**：`rowHeight = 8`。
- 默认 `text-base` 行高 24px（3 × 8）；tile 高度按内容计算，`h = ceil(tile 总高度 / 8)`。
- 标准结果：单行 24 + 32 = 56 → `h=7`；双行 80 → `h=10`；三行 104 → `h=13`。
- 只允许横向 resize；高度由内容决定，不允许手动拉高。WAN 图表和资源图表的布局高度固定，其他可测内容 tile 实测回写高度。

### 1.3 Tile 内部

- 内边距统一 `p-4`（16px）；1U tile 的内容宽度是 `330 - 32 = 298px`。
- tile 根节点是 flex column：标题与内容之间有 8px 根 gap + 8px content 上边距；内容列自身 gap 为 16px。
- 内容高度实测会包含 padding、标题、根 gap、content 上边距和 content 高度；带底部操作区的 tile 还会包含预留的操作区高度。

## 2. 背景、表面与颜色

### 2.1 大背景

- 页面根背景：`surface-0`（`stone-900`）。
- 在根背景上叠加 `stone-200/5` 的 45° 细斜纹：1px 线宽、8px 周期。
- `Home` 外层和网格容器保持透明，让斜纹在 tile 间隙和页面留白中透出。
- tile、抽屉和悬浮条使用自己的表面色，不透明，不显示斜纹。

### 2.2 表面层级

| 用途 | 值 | token |
| --- | --- | --- |
| 页面背景 | `stone-900` | `bg-dsh-surface-0` |
| tile 卡片 | `stone-800` | `.dsh-tile-frame` / `bg-dsh-surface-2` |
| 抽屉 / 收窄 rail / 悬浮条 | `stone-800` | `bg-dsh-surface-2` |
| 备用表面 | `stone-900` | `bg-dsh-surface-1` |

- 页面与 card 的层级同时依靠 `stone-900` / `stone-800` 的底色差和 `stone-600` 的 1px 边界，不再假设两者同色。
- 抽屉收窄与展开都使用 `surface-2`，切换宽度时不换底色。

### 2.3 颜色白名单

仅深色模式，不写浅色值、不使用 `dark:` 变体。全案例只使用以下颜色：

- 中性：Tailwind `stone` 全色阶，`stone-50` 除外；`stone-950` 只能以低透明度遮罩出现，不能作实色 surface。
- 状态：`emerald-400`、`amber-400`、`red-400`。
- 强调：`amber-500`、`amber-600`。
- 图表线色：`olive` / `mist` / `mauve` 的 300、400、500、600；300 新增用于设置 (关于) 页的颜色名标注。
- 设置 (关于) 页的取色逻辑卡里，颜色名称使用对应色相的 300/80 文字变体（`text-stone-300/80`、`text-emerald-300/80`、`text-amber-300/80`、`text-red-300/80`、`text-dsh-series-*-300/80`）。
- 链接：默认 `slate-500`、hover `slate-400`、active `slate-500/80`、visited `mauve-700`（slate 与 mauve-700 仅限链接用途）。
- 发丝线：`white/10`。
- tile 边界：`stone-600`；焦点：`stone-300/40`。

允许同色透明度（如 `bg-stone-900/60`、`text-amber-600/20`），但不得引入其他色相，也不写任意 hex / oklch。

**唯一例外**：系统概览的设备插图 `system-overview-router.svg` 保留 SVG 原始配色，不参与 UI 色板改写。

### 2.4 语义 token

| 用途 | 值 | token / 工具类 |
| --- | --- | --- |
| 标题 | `stone-100` | `text-dsh-text-title` + `font-semibold` |
| 正文 | `stone-200` | `text-dsh-text` + `font-normal` |
| 次要文字 | `stone-300` | `text-dsh-text-secondary` + `font-thin` |
| 禁用 / 占位 | `stone-500` | `text-dsh-text-disabled` + `line-through` + `italic` |
| 发丝线 | `white/10` | `border-dsh-hairline` |
| tile 边界 | `stone-600` | `--color-dsh-tile-outline` / `.dsh-tile-frame` |
| 焦点 | `stone-300/40` | 2px outline + offset |
| 遮罩 | `stone-950/30` | 抽屉 scrim |
| accent | `amber-500` / `amber-600` | `bg-dsh-accent` / `bg-dsh-accent-strong` |
| 成功 | `emerald-400` | `text-dsh-success` |
| 警告 | `amber-400` | `text-dsh-warning` |
| 错误 | `red-400` | `text-dsh-error` |

- 字重只保留三级：标题 `font-semibold`、正文 `font-normal`、次要 `font-thin`。
- 禁用态是状态，仍使用 `line-through` + `italic`，不能只靠颜色表达。
- 所有颜色 token 写在 `index.css` 的 `@theme static`，值使用字面色值；图表 JS 可以读取这些变量。

### 2.5 字体与链接

- 案例根字体：`font-maple-mono`。
- 标题和正文使用 `text-base`（16px）；次要说明常用 `text-sm`（14px）；数字展示按层级使用 `text-xl` – `text-5xl`，并保持 `font-semibold`。
- 所有 `<a>` 自动应用 slate 链接色和下划线；链接式按钮用 `.dsh-link-button`，同时重置按钮默认外观。
- 抽屉菜单是 button 导航，不套用链接色；`.dsh-drawer-link` 仅供未来的链接式菜单项使用。

## 3. 边界、焦点与状态

### 3.1 Tile 视觉层

- 每个 tile 根节点使用 `.dsh-tile`，内部放绝对定位的 `.dsh-tile-frame` 作为背景和边界层；内容层保持正常 `p-4`，不随视觉层内缩。
- `.dsh-tile-frame`：`bg-stone-800`，1px `stone-600` outline，`outline-offset: -0.5px`，让相邻边界重叠成一条均匀 1px 线。
- 不使用 border 表达 tile 边界；outline 不占盒模型，不产生 gutter。
- `.dsh-tile` 是 `relative` 定位上下文，底部操作区可以直接绝对定位。
- 编辑模式下视觉层通过 Motion 向内收缩 8px，块间视觉间隙变为 16px；内容尺寸和位置不变。

### 3.2 焦点

- `:focus-visible` 使用 2px `stone-300/40` outline + 2px offset，替换 tile 的边界 outline。
- 聚焦的 RGL item 用 `:has(.dsh-tile:focus-visible)` 提升 `z-index`，避免焦点环被相邻 tile 盖住。
- 全局 base 层提供 `a` / `button` / `input` / `select` / `textarea` / `[tabindex]` 的 focus-visible 兜底。

### 3.3 分隔线

- tile 内横向并列的信息如果容易混淆，使用 1px 竖直发丝线，不用 border。
- `.dsh-divider-v`：1px 宽、`margin-block: 15px`、`bg-dsh-hairline`，父容器用 flex row 让高度自适应。
- 系统概览使用较短的 hairline 竖线分隔设备插图与信息列表，并加 `aria-hidden`。

### 3.4 状态语义

| 状态 | 状态点 | 内容颜色规则 | 案例 |
| --- | --- | --- | --- |
| warning | 有，title 右上角 8px `amber-400` 圆点 | 默认保持正文/tile 原色；仅 hover 时给相关内容和数字显示 warning 色 | 综合健康、接口状态、系统资源 |
| success | 无 | 默认原色；仅 hover 时显示 success 色 | 高可用 |
| danger | 无 | 不使用 hover；关键文字直接显示 `red-400` | 严重事件 |

- warning 点使用 `Tile` 的 `status="warning"`，不额外画边框或改变底色。
- hover 语义色只作用于“出问题的内容”，不要给整个 tile 染色。
- **综合健康**：warning；hover 时分数 89 显示 success，问题文本和“中等”告警显示 warning。
- **接口状态**：warning；异常 ETH 图标默认正文色，hover 才显示 warning；离线图标保持 `opacity-30`。
- **系统资源**：warning；CPU/RAM 原始占用任一达到 90% 时显示 warning 点，hover 只给达到阈值的对应数字加 warning 色。
- **高可用**：success；默认原色，hover 时文字和右侧心电水印显示 success 色；严重事件期间切到 error 色。
- **严重事件**：danger；BGP 等关键信息直接使用 `red-400`，不需要状态点或 hover。

## 4. Tile 结构

### 4.1 结构

- 标题：`text-base font-semibold text-dsh-text-title`。
- 内容：默认 `text-dsh-text`；次要信息用 `text-sm font-thin text-dsh-text-secondary`。
- warning 状态点在标题行右上角，大小为 `size-2`。
- `Tile` 提供 `hasWarning` / `hasError` 两个可选布尔参数；根节点会暴露 `has-warning` / `has-error` 类名。未显式传入时，`status="warning"` / `status="danger"` 分别作为默认值。
- `TileStatusProvider` 通过 context 实时汇总 warn / error 数量；右侧收窄 rail 用 `useTileStatusCounts` 消费，并把数量写到 `data-tile-warnings` / `data-tile-errors` 与右 rail 的 `aria-label`。右 rail 的 error 数字在可见值变化时用 Motion 放大到 1.1，维持约 500ms 后回到 1。
- 内容高度由实测决定；有图表等无内在高度的内容使用布局固定高度。

### 4.2 底部操作区

- 有底部操作按钮的 tile，根节点必须为 `relative`。
- 操作区用 `absolute inset-x-4 bottom-4 z-10` 固定在卡片底部，左右和下边距取正常 `p-4`。
- 操作区脱离文档流，tile 必须预留底部空间：`padding-bottom: calc(var(--dsh-card-actions-height) + 2rem)`，CSS 类为 `.dsh-tile-actions`；`HealthTile` 已使用。
- 滚动内容容器也需要同样的 `padding-bottom`，操作区放在滚动容器外。
- 操作按钮在 DOM 中位于内容之后，保证 Tab 顺序；`z-10` 保证在滚动内容之上。
- 建议操作区高度落在 8px 的倍数上；按钮高度固定时可写常量，多行时用 `ResizeObserver` 实测。

### 4.3 图标与插图

- UI 图标使用 TDesign React 图标，尺寸通常 `size-5`；ETH 图标使用 `TvIcon`（透明填充、`currentColor` 描边、`strokeWidth=2`）。
- 系统概览左侧使用 `system-overview-router.svg` 等距路由插图：约 72px、`object-contain`、装饰性 `alt=""`，保留原始 SVG 配色。
- 设备插图与 TDesign 界面图标分开处理，不把插图强制改成 `currentColor`。

## 5. 布局引擎与响应式

### 5.1 RGL 配置

- `Home.tsx` 接入 RGL v2；`cols = width / 330`、`rowHeight = 8`、零 margin / containerPadding。
- 每个断点维护独立的 layout override；`onLayoutChange` 同步拖拽和横向 resize。
- RGL 子元素外层必须包一层普通 DOM（当前 `<div key=...>`），否则 RGL 注入的定位样式会被组件吞掉。
- `react-grid-layout` 和 `uplot` 不在首屏白名单，必须留在 Dasher 的懒加载边界内。

### 5.2 断点布局基线

| 列数 | 基线布局 |
| --- | --- |
| 5 | 顶部 system 2U + interface 3U；health 3U + WAN 2U；resources 3U + connectivity 2U；底部 ha 1U + critical 2U，随后 ha 自动补到 3U |
| 4 | 顶部 2U + 2U；health 2U + WAN 2U；resources 2U + connectivity 2U；底部 ha/critical 各 2U |
| 3 | system 1U + interface 2U；health 2U + WAN 1U；resources 2U + connectivity 1U；底部 ha 1U + critical 2U |
| 2 | 各 tile 满宽纵向堆叠；底部 ha / critical 各 1U 并排 |
| 1 | 所有 tile 满宽纵向堆叠 |

- 初始高度中，system / interface / health / connectivity / ha / critical 由内容实测；WAN 图表和 resources 图表使用布局固定高度。
- 顶部 system 与 interface 并排时按两者的较高自然高度统一。
- 测量回写：measured tile 的标题行与内容层使用 `shrink-0`，避免内容被 RGL 已分配的高度反向压缩；各 tile 的 ResizeObserver 先把自然高度写入 ref，再由 `requestAnimationFrame` 合并、统一回写 `h`，避免每块 tile 单独触发一轮布局。
- `stretchTrailingRow` 只增高：3/4/5 列时把 ha / critical 补到右侧列的最低底边；2 列时两者互相补齐；1 列不处理。增高时遇到下方横向重叠的 tile 只补到它的顶边，避免把被拖到上方的 tile 继续往下推，形成高度/重排循环。

### 5.3 横向补位

- 纯文字 tile 视为可伸缩：`health` / `connectivity` / `ha` / `critical`。
- `stretchTextTileRows` 只处理行尾空位：取本行最左的可伸缩块加宽，后续同一行 tile 整体右移。
- 扩展后的完整矩形不能与跨行 tile 重叠；遇到跨行占用时从最大宽度逐列回退，能补多少补多少。
- 4/5 列默认会把底部 ha 补到 2U/3U，critical 保持 2U；3 列若右上方有 connectivity 跨行占用，ha 可能只补到 2U。
- 手动缩放 ha / health 后，该列进入手动布局状态，暂停自动横向补位，避免自动逻辑把手动宽度撑回去。
- `ha` 在 2U 及以上时，内容区右侧显示单次心电心跳的 SVG 水印：`aria-hidden`、`pointer-events-none`；静止为低透明度 stone，hover 时跟随 success 色，事件期间跟随 error 色。水印用 `ResizeObserver` 跟随 tile 实际内容宽度，缩回 1U 时立即卸载。

### 5.4 纵向重排

- `bestFitCompactor` 先做默认 vertical 吸顶，再扫描相邻 y 行带的空档：
  - 优先尝试下一行某个子集宽度之和正好等于本行空档总额，把本行左对齐后整组补位。
  - 找不到精确组合时，按宽度完全相等 / 最窄的单个 tile 逐空档回退。
  - 所有移动都检查完整 `w × h`；跨行 tile 放不下就保留空档。
- 只搬紧邻下一行，不跨多行搜索。
- 空档补位最后再吸顶，避免中间位置残留。

### 5.5 编辑模式

- `editing` 状态提升到 App，经 `EditModeContext` 下发给 Home。
- 入口在左 rail 底部和左面板底部（`EditIcon` / 完成态 `CheckIcon`）；任意入口切换后关闭抽屉。
- 只有编辑模式启用拖拽和 e/w 横向 resize；高度不手动拉。
- 编辑态视觉层整体内缩 8px，块间视觉间隙固定 16px；`.dsh-tile` 的 cursor 为 `grab`。
- 退出编辑模式时递增 `layoutVersion`，并把它并入 `GridLayout` 的 key，强制重新初始化一次、重新压缩并重新测量，确保尾部高度补齐规则在手动编辑后仍然生效。
- 拖拽中的 RGL item `z-index: 20`，视觉层底色切到 `surface-2`，边界改为 2px dashed accent，cursor 为 `grabbing`。
- `dragConfig.cancel` 排除按钮、链接、输入框等交互元素。

## 6. 导航、抽屉与用户区

### 6.1 Rail 与抽屉尺寸

- 左右各一条常驻 64px `DrawerRail`；抽屉展开宽度 330px，窄视口最多 `100vw`。
- 收窄 rail 顶部：左侧是 SearchIcon，右侧是纯展示的 Dasher logo；rail 底部左侧是展开按钮，右侧是 UserIcon 打开用户抽屉。
- 展开只能通过 rail 底部按钮触发；不能点击 logo 打开抽屉。
- 左抽屉 11 个分类：系统概览、监控中心、策略中心、对象管理、网络配置、无线管理、虚拟专网、接入管理、扩展服务、日志中心、设置 (关于)。系统概览回到案例 index `/Dasher`；设置 (关于) 打开 `/Dasher/settings`；其他分类页尚未实现，点击只关闭抽屉。
- 左抽屉按当前路径给对应菜单行加 `bg-stone-700`（与 hover 同色）并设置 `aria-current="page"`；当前只有系统概览和设置 (关于) 有匹配路由。
- 收窄 rail 保留完整分类图标；其中系统概览和设置 (关于) 是可点击按钮，按当前路径用同样的 `bg-stone-700` 高亮，其他分类仍是静态预览。
- 设置 (关于) 页使用案例现有的 Tile、stone 色板和 8px 节奏，分四块说明取色逻辑、响应式设计、全键盘导航与悬浮显色规则。
- 抽屉背景收窄 / 展开都使用 `surface-2`，不换色。

### 6.2 行节奏与展开动效

- 菜单行和 rail 使用 48px 行高、4px gap、64px 图标列；图标中心与 rail 对齐。
- 顶部 padding：收窄 rail 8px，展开面板 10px；底部统一 8px。
- 文字和图标尺寸一致：`text-base`、`size-5`。
- 标签始终占位、`opacity: 0`；宽度达到完整展开值后 fade-in，开始收起时 fade-out。文字出现时不推开图标。
- 关闭右侧面板时先把 nav 内容整体淡出（150ms），180ms 后再触发面板宽度收窄；关闭按钮、Esc、scrim 和 `Ctrl+E` 共用同一关闭路径。左面板仍即时收起。
- 左面板底部：编辑、关闭左侧；右面板底部：退出登录（演示，无真实逻辑）、关闭右侧。
- 右抽屉顶部是右对齐的 `DASHER` 字标 + logo，随完整展开 fade-in。

### 6.3 用户信息

- 右抽屉 `UserPanel` 展示头像、用户名、角色、组织、邮箱、上次登录、登录 IP、状态。
- `mockUser.ts` 中当前用户为 `admin` / `超级管理员`。
- 系统概览当前用户行显示用户名，角色作为次级小字附加；设备型号仍为占位。
- 退出登录只是演示操作行，不执行真实登出。

### 6.4 移动端

- 窄于 788px 时隐藏两条 rail，底部出现贴视口悬浮条：左侧 MenuIcon 打开左抽屉，右侧 UserIcon 打开用户抽屉。
- 打开抽屉时显示全屏 scrim（`bg-stone-950/30`，z-60），点击 scrim 或按 Esc 关闭。
- 左右抽屉按功能域分开。当前实现仍共用一个 `openSide`，同一时间只能开一侧；设计目标为两侧独立开合，待拆分状态、scrim 和焦点管理。
- 抽屉打开时背景与 rail 为 `inert`，抽屉为 `role="dialog"` + `aria-modal`。
- 焦点移入抽屉并 Tab 循环；关闭后焦点归还触发按钮；trigger、菜单项、操作行、编辑/关闭按钮都使用 `stone-300/40` focus ring。

## 7. 搜索与快捷键

- 搜索是独立 `Search.tsx`，位于左 rail 顶部；点击搜索按钮会展开左抽屉并聚焦输入框（`Ctrl+K` 同样）。通过底部展开按钮或快捷键打开左面板时，初始焦点落在第一个导航项，不自动聚焦搜索框。输入框使用 `focus-within` 2px `stone-300/40` ring。
- 输入用 es-toolkit debounce 300ms；暂无候选源，稳定后固定显示“无结果”（absolute 覆盖层，不推挤菜单）。
- `Ctrl+K` / `Cmd+K` 模拟点击搜索按钮；只有 Ctrl+K 显示顶部提示。
- `Ctrl+S` 切换左面板，`Ctrl+E` 切换右面板；同一个键再按一次关闭。
- 顶部 `#key-indicator`：
  - 只在按下 Ctrl / Alt 时预览当前修饰键，Shift 和 Meta 不触发。
  - 执行已收录快捷键后显示组合与行为，1s 后隐藏；修饰键松开时若无锁定则立即隐藏。
  - 已收录文案：`Ctrl + K` / “搜索”，`Ctrl + S` / “切换左栏”，`Ctrl + E` / “切换右栏”。
  - Tab / Shift+Tab（以及方向键触发的焦点移动）把焦点送进可访问对象时，显示 `导航：<标识符>`，1s 后隐藏。标识符由当前 tile 标题和焦点控件组成；控件追加类型后缀，如“综合健康/刷新按钮”“搜索输入框”。
  - 键盘焦点从文档移出、进入浏览器 UI 时短暂显示 `导航：浏览器`；窗口失焦（页面 blur）时顶部指示立即移除，包括快捷键和导航提示。
- 关闭按钮行显示 `Ctrl+S` / `Ctrl+E` 快捷键提示，提示放在同一 Motion opacity label 内，只在面板完全展开后显示。

## 8. 数据与图表

- 数据来自 `tools/telemetry`：1s 随机游走、60 点历史；场景包括 calm、congested、cpu-spike、memory-pressure、outage。
- 图表组件 `tiles/TimeSeriesChart.tsx` 负责 uPlot 实例、`ResizeObserver` 尺寸和 `setData` 更新；uPlot 随 Home 懒加载。
- 图表坐标轴使用 `text-secondary`，网格使用 hairline。
- 线色：
  - WAN 速率：下行 mist-500、上行 olive-500。
  - WAN 质量：时延 mauve-500、抖动 olive-400。
  - 资源使用率：CPU mist-500、内存 mauve-500。
- 系统概览：路由器插图 + 发丝竖线 + 设备信息；设备型号为占位，当前用户显示用户名和角色。
- 综合健康：warning；分数、问题、告警列表和底部刷新按钮；tile 宽度为 1U 时（包括编辑缩窄到 1U）告警列表隐藏 leader dots，改为右对齐堆叠，时间与程度各占一行。
- 接口状态：9 个 ETH；异常状态 warning dot，异常图标 hover 变 warning，离线图标 `opacity-30`。
- 资源使用率：CPU 整数百分比；内存总量固定 4GB，显示一位小数；CPU/RAM 任一原始占用 ≥90% 进入 warning。
- 连接总览：下联 AP 0、下联终端 1、连接数 72，纵向数字简报。
- 高可用：success；双机热备状态、切换次数、上次同步和拓扑入口；2U+ 单次心电心跳水印。加载 3s 后进入一次 danger 定时事件，显示“主备心跳中断 / 倒计时自动重试：5s→1s”；5s 后恢复，冷却 60s 后再次触发并循环，期间会计入右侧 error 数量。上次同步秒数在组件初始化时为 3s，随后每秒递增；每次严重事件倒计时结束视为 mock solve，秒数归零并重新计时。
- 严重事件：danger；事件数、BGP 标题、影响范围与持续时间。tile 宽度至少 2U 时，右侧增加低透明度 error 色感叹号水印；内容层限宽 2U（`calc(660px - 2rem)`）并保持在上层，1U 时隐藏水印。
- `#@preview` 预览模式：App 读取并监听 hash 中的 `@preview`，通过 `PreviewModeContext` 下发，同时把 telemetry 预填到 60 点历史后暂停。图表继续渲染，但数据固定在进入预览时的快照上，不再随时间更新。`ResourceUsageTile` 的 CPU/RAM 占用仍显示 `-`，并停用资源 warning 状态；高可用的静态 SVG 水印继续显示。
- 其他未接数据的 tile 保持原型占位。

## 9. 动效与无障碍

- 结构性动效一律使用 Motion（`import { motion } from 'motion/react'`）：抽屉宽度、scrim、标签 fade、设备/用户区 fade、编辑态视觉层内缩、顶部快捷键提示。
- 不引入另一套动画库或新增 CSS keyframes；普通 hover 的颜色过渡沿用既有 Tailwind transition。
- tile 可聚焦时提供 focus ring；抽屉和菜单支持完整键盘操作。
- 装饰性元素（插图、静默图标、水印）使用 `aria-hidden` 或空 `alt`；warning 点提供“警告状态”可访问名称。
- 编辑状态通过 live region 通知；编辑按钮使用 `aria-pressed`。

## 10. 工程约束与工具

- 白名单依赖可直接静态 import；`react-grid-layout` 和 `uplot` 必须留在懒加载边界内。
- package CSS 通过案例内的本地包装文件导入：`_Dasher.case/styles/react-grid-layout.css`、`_Dasher.case/styles/uplot.css`。
- RGL 子元素外层保留普通 DOM 包装；不要直接把 tile 组件作为 RGL child。
- 模拟数据说明：`tools/telemetry/README.md`。
- 图表库：`uplot`（非白名单，必须懒加载）。
- 系统概览插图：`system-overview-router.svg`（原始配色例外）。
