import Tile from './tiles/Tile'

export default function Settings() {
    return (
        <main className="min-h-screen px-4 pb-28 pt-10 md:px-20 md:pt-16">
            <div className="mx-auto max-w-[990px]">
                <header className="max-w-[720px]">
                    <p className="text-sm font-thin tracking-[0.16em] text-dsh-text-secondary">
                        关于 DASHER
                    </p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-dsh-text-title">
                        设置 (关于)
                    </h1>
                    <p className="mt-4 text-base leading-7 text-dsh-text-secondary">
                        Dasher 是一套面向企业级路由器的深色后台原型。它用 330px
                        的模块、克制的色彩和明确的键盘反馈，把复杂的网络状态整理成可以快速扫读的界面。
                    </p>
                </header>

                <h2 className="sr-only">设计说明</h2>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                    <Tile title="取色逻辑">
                        <div className="flex flex-col gap-3 text-sm leading-6 text-dsh-text-secondary group ">
                            <p>
                                界面骨架只用 <span className="text-stone-300/80 font-semibold">stone</span>{' '}
                                中性色。状态色留给真正需要被注意的时刻：成功是{' '}
                                <span className="text-dsh-text-secondary transition group-hover:text-emerald-300/80">emerald</span>，警告是{' '}
                                <span className="text-dsh-text-secondary transition group-hover:text-amber-300/80">amber</span>，危险是{' '}
                                <span className="text-dsh-text-secondary transition group-hover:text-red-300/80">red</span>。图表线色收在{' '}
                                <span className="text-dsh-text-secondary transition group-hover:text-dsh-series-olive-300/80">olive</span>、
                                <span className="text-dsh-text-secondary transition group-hover:text-dsh-series-mist-300/80">mist</span>、
                                <span className="text-dsh-text-secondary transition group-hover:text-dsh-series-mauve-300/80">mauve</span>{' '}
                                三组低饱和色里。
                            </p>
                            <p>
                                所有色值集中在案例 index.css 的 token
                                中，组件不临时定义颜色，避免同一套界面出现色差。
                            </p>
                        </div>
                    </Tile>

                    <Tile title="响应式设计">
                        <div className="flex flex-col gap-3 text-sm leading-6 text-dsh-text-secondary">
                            <p>
                                横向以 330px
                                为一个模块，视口每增加一列就多容纳一个模块，最多五列；主网格不额外留
                                gutter，tile 之间用 1px 边界贴合。
                            </p>
                            <p>
                                纵向以 8px 为单位，高度主要由内容实测决定，图表使用固定布局高度；只允许横向拉伸。窄屏下网格收成单列，两侧
                                rail 隐藏，改为底部悬浮控制条。
                            </p>
                        </div>
                    </Tile>

                    <Tile title="全键盘导航">
                        <div className="flex flex-col gap-3 text-sm leading-6 text-dsh-text-secondary">
                            <p>
                                每个可访问对象都有清晰的 stone
                                焦点环。Tab / Shift+Tab 在可访问对象之间移动，抽屉打开后焦点被限制在面板内，关闭后回到原来的触发按钮。
                            </p>
                            <p>
                                顶部会短暂显示“导航：综合健康/刷新按钮”这样的位置提示；焦点离开页面进入浏览器
                                UI 时，提示会变成“导航：浏览器”。
                            </p>
                            <p>
                                Esc 关闭抽屉，Ctrl+S / Ctrl+E 切换左右面板，Ctrl+K 打开搜索。
                            </p>
                        </div>
                    </Tile>

                    <Tile title="悬浮才显色">
                        <div className="flex flex-col gap-3 text-sm leading-6 text-dsh-text-secondary group">
                            <p>
                                警告状态默认保持 tile
                                原色，只在标题右上角留下一个 <span className='group-hover:text-dsh-warning'>warning</span>
                                点；鼠标悬浮后，相关文字或数字才显示 <span className='group-hover:text-dsh-warning'>warning</span> 或{' '}
                                <span className='group-hover:text-dsh-success'>success</span> 色。危险状态不使用状态点，直接用红色文字吸引注意。
                            </p>
                            <p>
                                资源使用率也只给达到 90%
                                的指标着色，避免正常指标被<span className='group-hover:text-dsh-error '>误读</span>。颜色不是装饰，而是最后才出现的状态提示。
                            </p>
                        </div>
                    </Tile>
                </div>
            </div>
        </main>
    )
}
