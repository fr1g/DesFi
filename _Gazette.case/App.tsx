import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArticleIcon, CloseIcon, InstitutionIcon, SoundIcon, TabIcon, type IconProps } from 'tdesign-icons-react';
import { HeroSlotContext } from './HeroSlotContext'

const MENU_ITEMS: { to: string, label: string, icon: ComponentType<IconProps> }[] = [
    { to: '/Gazette', label: 'Actualités du jour', icon: ArticleIcon },
    { to: '/Gazette/topic/law', label: 'Dossier Justice', icon: InstitutionIcon },
]

const HOVER_SHIFT = -38; // 悬停时文字左移量（= 图标 30px + 间隙 8px），让出右侧空间给图标淡入

export default function App() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [speaking, setSpeaking] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    // 全宽 hero 的挂载点：div 挂载后把节点经 context 交给页面
    const [heroSlotNode, setHeroSlotNode] = useState<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!window.location.hash.includes("@preview")) {
            alert("警告：这个设计案例包含的文本和图像内容全部都是AI生成，所提及实体均为虚构，不反映、影射、代表现实，仅供撑起一套设计并让体验有趣一些。\n" +
                "Warning: The text and images in this design case are entirely AI-generated. All entities mentioned are fictional and do not reflect, allude to, or represent reality; they exist only to support the design and make the experience a little more interesting.")
        }
    }, []);

    const closeMenu = () => {
        setMenuOpen(false)
        // 关闭后把焦点还给触发按钮（键盘用户不会丢失上下文）
        menuButtonRef.current?.focus()
    }

    // 菜单打开：聚焦关闭按钮，Esc 可关闭
    useEffect(() => {
        if (!menuOpen) return
        closeButtonRef.current?.focus()
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false)
                menuButtonRef.current?.focus()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [menuOpen])

    // 朗读本页：用系统语音合成读正文；卸载时停止
    useEffect(() => {
        return () => window.speechSynthesis?.cancel()
    }, [])

    const { pathname } = useLocation()

    // 导航结束（新路由已挂载）后回到页首
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    // 滚动后给导航栏切磨砂底：Paper 页面由标题收缩逻辑负责，专题页没有 Paper，这里统一兜底
    useEffect(() => {
        const root = document.querySelector('.case-Gazette')
        const onScroll = () => {
            if (window.scrollY > 8) root?.classList.add('is-scrolled')
            else root?.classList.remove('is-scrolled')
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // 站内链接跳转前先回顶：否则新页面挂载时读到上一页残留的滚动位置，Paper 会误判成"读者已经滚过"而直接缩掉大标题
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            const target = event.target instanceof Element ? event.target.closest('a[href]') : null
            if (!(target instanceof HTMLAnchorElement)) return
            if (target.target && target.target !== '_self') return
            if (target.hasAttribute('download')) return
            const url = new URL(target.href, window.location.href)
            if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
            window.scrollTo(0, 0)
        }
        const onPopState = () => window.scrollTo(0, 0)
        document.addEventListener('click', onClick, true)
        window.addEventListener('popstate', onPopState)
        return () => {
            document.removeEventListener('click', onClick, true)
            window.removeEventListener('popstate', onPopState)
        }
    }, [])

    const toggleSpeaking = () => {
        if (!('speechSynthesis' in window)) return
        if (speaking) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
            return
        }
        const content = document.getElementById('content')
        const text = (content ?? document.body).innerText.trim()
        if (!text) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setSpeaking(true)
    }

    return (
        <div className="case-Gazette min-h-screen bg-background font-times text-gz-foreground transition">
            {/* 全局图片噪点滤镜：CSS 里 .case-Gazette img 统一引用这个定义 */}
            <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
                <filter id="gz-grain" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                    <feComponentTransfer>
                        <feFuncR type="linear" slope="0" intercept="0.55" />
                        <feFuncG type="linear" slope="0" intercept="0.55" />
                        <feFuncB type="linear" slope="0" intercept="0.55" />
                        <feFuncA type="linear" slope="0.18" intercept="0" />
                    </feComponentTransfer>
                    <feBlend in="SourceGraphic" mode="multiply" />
                </filter>
            </svg>
            <nav className='gz-nav w-full bg-transparent flex justify-center fixed z-30' aria-label='Barre de navigation'>
                <div className='max-w-[1280px] w-full flex'>
                    <button
                        ref={menuButtonRef}
                        type='button'
                        className='gz-cubeButton'
                        aria-label='Ouvrir le menu'
                        aria-haspopup='dialog'
                        aria-expanded={menuOpen}
                        title='Ouvrir le menu'
                        onClick={() => setMenuOpen(true)}
                    >
                        {/* "更多" 按钮：打开左侧推入式菜单 */}
                        <TabIcon fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />
                    </button>
                    <div className='grow'>
                        {/* 大标题空间，留空 */}
                    </div>
                    <button
                        type='button'
                        className='gz-cubeButton'
                        aria-label={speaking ? 'Arrêter la lecture' : 'Lire la page'}
                        aria-pressed={speaking}
                        title={speaking ? 'Arrêter la lecture' : 'Lire la page'}
                        onClick={toggleSpeaking}
                    >
                        {/* "阅读屏幕" 按钮：语音朗读正文 */}
                        <SoundIcon fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />
                    </button>
                </div>
            </nav>
            {/* 点击更多按钮展开导航：从左侧推入的 gz 主题色菜单 */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className='fixed inset-0 z-50'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className='absolute inset-0 bg-gz-foreground/30' onClick={closeMenu} aria-hidden='true' />
                        <motion.nav
                            role='dialog'
                            aria-modal='true'
                            aria-label='菜单'
                            className='absolute inset-y-0 left-0 flex h-full w-[min(420px,80vw)] flex-col bg-gz-primary text-gz-primary-foreground pr-1.5 shadow-lg'
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <button
                                ref={closeButtonRef}
                                type='button'
                                className='relative flex w-full items-center justify-end p-3 pb-4 text-right text-3xl hover:bg-white/10'
                                onMouseEnter={() => setHoveredItem("close")}
                                onMouseLeave={() => setHoveredItem(null)}
                                onFocus={() => setHoveredItem("close")}
                                onBlur={() => setHoveredItem(null)}
                                onClick={closeMenu}
                            >
                                <motion.span
                                    animate={{ x: hoveredItem === "close" ? HOVER_SHIFT : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Fermer le menu
                                </motion.span>
                                <div aria-hidden='true' className='pointer-events-none absolute right-0 top-1/2 -translate-y-1/2'>
                                    <motion.span
                                        className='inline-flex translate-y-0.75 -translate-x-1.5'
                                        animate={{ opacity: hoveredItem === "close" ? 1 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CloseIcon fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />
                                    </motion.span>
                                </div>
                            </button>
                            {MENU_ITEMS.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className='relative flex items-center justify-end p-3 pb-4 text-right text-3xl hover:bg-white/10'
                                    onMouseEnter={() => setHoveredItem(item.to)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onFocus={() => setHoveredItem(item.to)}
                                    onBlur={() => setHoveredItem(null)}
                                    onClick={closeMenu}
                                >
                                    <motion.span
                                        animate={{ x: hoveredItem === item.to ? HOVER_SHIFT : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                    <div aria-hidden='true' className='pointer-events-none absolute right-0 top-1/2 -translate-y-1/2'>
                                        <motion.span
                                            className='inline-flex translate-y-0.75 -translate-x-1.5'
                                            animate={{ opacity: hoveredItem === item.to ? 1 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <item.icon fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />
                                        </motion.span>
                                    </div>
                                </Link>
                            ))}
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* 专题页的全宽 hero 挂载点：位于纸张之外、固定导航之下，由页面 portal 填充 */}
            <div id='gz-hero-slot' ref={setHeroSlotNode} />
            <HeroSlotContext.Provider value={heroSlotNode}>
                <div className='pt-12 w-[1145px] mx-auto'>
                    <div id='content' className='gazette-paper p-5 min-h-[85vh]'>
                        <Outlet />
                    </div>
                </div>
            </HeroSlotContext.Provider>
            <div className='h-12'></div>
            <footer className='p-5 bg-gz-secondary  relative'>
                <h3 className='text-gz-accent-foreground text-3xl'>
                    <span className="block font-bold" style={{ lineHeight: '85%' }}>G<span className="scale-y-80 translate-y-[5%] inline-block">AZETTE</span></span>
                </h3>
                <div className='flex w-full justify-between'>
                    <div className='mt-5 flex flex-col flex-wrap gap-x-8 gap-y-1 text-sm text-gz-muted-foreground'>
                        <div className='space-x-3'>
                            <span>Rédaction : <a className='underline underline-offset-4 hover:text-gz-foreground' href='#nothing-here...'>redaction@gazette.ur</a></span>
                            <span>Téléphone : +33 6 44 92 10 38</span>
                        </div>
                        <a
                            className='underline underline-offset-4 hover:text-gz-foreground'
                            ref={(el) => {
                                // React 19 会拦截 JSX 里的 javascript: href，这里直接写 DOM 属性保证原样生效
                                el?.setAttribute("href", "javascript:alert('nothing lol')");
                            }}
                        >Nous recrutons — rejoignez us!</a>
                        <p className=' text-sm text-gz-muted-foreground'>
                            Totále vueers: <span className='text-gz-secondary-foreground italic'>1,145,141,919,810</span>
                        </p>
                        <p className=' text-sm text-gz-muted-foreground'>
                            Licence de publication n° UR-GZ-1919-0417 · Les Républiques-Unies
                        </p>
                    </div>
                    <p className='mt-5 max-w-[720px] text-xs/3 leading-relaxed text-gz-muted-foreground text-right relative bottom-0'>
                        Founded in 1919 in Aurelle, La Gazette des Républiques — known simply as the Gazette — is the journal of record of the United Republics. From the chambers of the Assemblée to the dockets of the Cour de Cassation, our correspondants and photographers document the Republics from the Cévennes to the Marne. The Gazette is published daily, without subvention from the Conseil des ministres, under the sole authority of its rédaction; our publicité is reviewed by an independent comité, and our errors are corrected in print, in the same typeface, c'same prominence as the mistake.
                    </p>
                </div>

            </footer>
        </div>
    )
}
