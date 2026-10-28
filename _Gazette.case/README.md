# Gazette 案例

法式英语的架空新闻网站（United Republics · La Gazette des Républiques），设计进行中。
本文是当前实现状态，供上下文压缩／交接时快速接手；设计方面的调整由用户负责。

## 结构

- App.tsx：Layout。固定顶栏（左「更多」、右「朗读」）+ `<Outlet />` + 页脚（报头、联系方式、简介）。
    - 导航抽屉（Motion 从左侧推入）：Fermer le menu / Actualités du jour（/Gazette）/ Dossier Justice（/Gazette/topic/law；Topic 页未建、无路由）。
    - 选项 hover/focus：文字左移 38px，右侧图标淡入（CloseIcon / ArticleIcon / InstitutionIcon，currentColor，见 `MENU_ITEMS` 与 `HOVER_SHIFT`）。
    - 无障碍：真 button、aria-expanded / aria-pressed、Esc 关闭、焦点归还与交接、抽屉 role=dialog aria-modal；朗读按钮用 speechSynthesis 读 `#content` 正文。
    - 全局图片噪点滤镜的 SVG 定义在此（隐藏 svg `#gz-grain`）。
- Paper.tsx：页面主标题容器（两种模式）。
    - ReactNode 标题（Index 用）：整个报头组合缩放到导航中槽，`NAV_FIT = 40px`，构成随缩放保留。
    - string 标题（Article 用 `article.title`）：hero 为 `text-3xl` 完整换行；收缩后单行 + ellipsis，字号 `NAV_STRING_FONT = 48px`、宽度 = 导航中槽。
    - 触发：向下滚动（wheel deltaY>0 / 触摸 / scrollY 增加）即收缩，不干预滚动位置；scrollY ≤ 4 且本次向下走过 ≥ 20px 才还原。占位块只在顶部（scrollY ≤ 8）收拢。
    - 标题与正文之间有「中间渐隐 + 正中 G」的分割线。
- ContentRenderHelper.tsx：按段渲染正文。
    - 行内 md：`**粗体**`、`*斜体*`、`<u>下划线</u>`。
    - `img::<url>::<alt>` 段落 → 插图（原比例、max-w 900、居中、muted 斜体图注）。
    - 首个文字段落首字放大（`DROP_CAP`）；插图段落不算。
- pages/Index.tsx：头版（网格搭建中），取 `/gazette/headlines.json`。
- pages/Article.tsx：文章页（`/Gazette/art/:pid`）。按 pid 取 `/gazette/<id>.json`；Paper 标题 = 文章标题（string）；署名行（作者 / 法语日期 / 浏览数）；正文走 ContentRenderHelper；有 loading 与 404 兜底。
- pages/Topic.tsx：空（法律专题页未做）。
- classes/：`Article` / `ArticlePreview`（+ partialContent、isMainContent、isTodayTop、imageUrl）、`Topic`（uniqueName / describe / useHero / articles）、`Advertisement`（`AD`：id(Date) / title / releasedBy / content / contact / imageUrl）。
- index.css：gz 主题 token、双层灰噪纸纹、底部投影（负 spread）、磨砂顶栏（`.gz-nav`，滚动后激活）、`.case-Gazette img` 噪点滤镜。

## 数据（public/gazette/）

- `headlines.json`：10 条 ArticlePreview（isTodayTop 唯一为 #1）；imageUrl 已填 #1/#4/#5/#7。
- `1.json`–`10.json`：十篇文章，`content` 每段单行字符串；#1/#5/#7 的第 3 段是 `img::` 插图。主题分布：法律 4 / 财经 3 / 教育 3（含头条交叉）。
- `topics/law.json`：法律专题（articles: 1/3/6/9）。
- `ads/lost-dalmatian.json`、`ads/used-citroen.json`：两条法语分类广告；广告组件未建。
- `images/<id>/*.webp`、`ads/*.webp`：全部 webp（cwebp -q 80，合计约 850KB，PNG 已删）。

## 待办 / 缺口

- 头版网格的文章卡片，并链接到 `/Gazette/art/<id>`；
- Topic 页 + `/Gazette/topic/:name` 路由注册（抽屉里的 Dossier Justice 目前落到空页）；
- 广告组件与广告位（读 ads JSON）；
- 无图文章 #2/#3/#6/#8/#9/#10 的配图（下一张建议 #6 洪水）。

## 注意

- 文本与图像均为 AI 生成、实体虚构；URL hash 不含 `@preview` 时 App.tsx 会弹警示（测试请带 `#@preview`）。
- 主题色 `gz-*` token 在 index.css；UI 样式调整由用户负责。
