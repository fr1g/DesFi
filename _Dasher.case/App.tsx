import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import {
    ChartAnalyticsIcon,
    CheckIcon,
    ChevronRightIcon,
    CloseIcon,
    EditIcon,
    ExtensionIcon,
    FileSafetyIcon,
    HistoryIcon,
    HomeIcon,
    InternetIcon,
    LogoutIcon,
    MenuIcon,
    SearchIcon,
    SettingIcon,
    SitemapIcon,
    UserAddIcon,
    UserIcon,
    UsergroupIcon,
    WifiIcon,
} from 'tdesign-icons-react'
import Search from './Search'
import UserPanel from './UserPanel'
import dasherLogo from './dasher.svg'
import { CURRENT_USER } from './mockUser'
import { telemetryStore } from './tools/telemetry'
import { EditModeContext } from './tiles/EditModeContext'
import { PreviewModeContext } from './tiles/PreviewModeContext'
import { useTileStatusCounts } from './tiles/TileStatus'
import { TileStatusProvider } from './tiles/TileStatusProvider'

type DrawerSide = 'left' | 'right'

type KeyIndicatorState = {
    keys?: string[]
    action?: string
    navigation?: string
}

type NavItem = {
    id: string
    label: string
    icon: ReactNode
    path?: string
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'overview',
        label: '系统概览',
        path: '/Dasher',
        icon: (
            <HomeIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'monitor',
        label: '监控中心',
        icon: (
            <ChartAnalyticsIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'policy',
        label: '策略中心',
        icon: (
            <FileSafetyIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'objects',
        label: '对象管理',
        icon: (
            <UsergroupIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'network',
        label: '网络配置',
        icon: (
            <SitemapIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'wireless',
        label: '无线管理',
        icon: (
            <WifiIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'vpn',
        label: '虚拟专网',
        icon: (
            <InternetIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'access',
        label: '接入管理',
        icon: (
            <UserAddIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'services',
        label: '扩展服务',
        icon: (
            <ExtensionIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'logs',
        label: '日志中心',
        icon: (
            <HistoryIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
    {
        id: 'settings',
        label: '设置 (关于)',
        path: '/Dasher/settings',
        icon: (
            <SettingIcon
                aria-hidden="true"
                className="size-5"
                fillColor="transparent"
                strokeColor="currentColor"
                strokeWidth={2}
            />
        ),
    },
]

const RAIL_WIDTH = 64
const DRAWER_WIDTH = 330
const RIGHT_PANEL_FADE_MS = 180
const FOCUSABLE_SELECTOR =
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const DRAWER_ROW_BASE =
    'flex relative h-12 w-full cursor-pointer items-center overflow-hidden text-base font-normal text-dsh-text-title transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-300/40'
const DRAWER_ROW_CLASS = `${DRAWER_ROW_BASE} bg-dsh-surface-2`
const DRAWER_ICON_CLASS = 'grid h-12 w-16 shrink-0 place-items-center'
const DRAWER_LABEL_CLASS = 'min-w-0 flex-1 whitespace-nowrap pr-4 text-right'
const RAIL_BUTTON_BASE =
    'grid size-12 shrink-0 place-items-center transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-300/40'
const RAIL_BUTTON_CLASS = `${RAIL_BUTTON_BASE} text-dsh-text-secondary hover:bg-stone-700 hover:text-dsh-text-title`

const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'

function getFocusable(container: HTMLElement | null) {
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true',
    )
}

function getFocusNavigationLabel(element: HTMLElement): string | null {
    const closestTile = element.closest<HTMLElement>('.dsh-tile')
    if (!closestTile) {
        const containedTile = element.querySelector<HTMLElement>('.dsh-tile')
        if (containedTile) {
            return containedTile.querySelector('h3')?.textContent?.trim() || null
        }
    }

    const title = closestTile?.querySelector('h3')?.textContent?.trim()
    if (closestTile === element) return title || null

    const rawLabel =
        element.getAttribute('aria-label')?.trim() ||
        element.textContent?.replace(/\s+/g, ' ').trim() ||
        element.getAttribute('placeholder')?.trim() ||
        element.getAttribute('name')?.trim()
    if (!rawLabel) return title || null

    let suffix = ''
    if (element instanceof HTMLButtonElement) suffix = '按钮'
    else if (element instanceof HTMLInputElement) suffix = '输入框'
    else if (element instanceof HTMLAnchorElement) suffix = '链接'

    const controlLabel =
        suffix && !rawLabel.endsWith(suffix) ? `${rawLabel}${suffix}` : rawLabel
    return title ? `${title}/${controlLabel}` : controlLabel
}

function DrawerMenuItem({
    item,
    active,
    expanded,
    onSelect,
}: {
    item: NavItem
    active: boolean
    expanded: boolean
    onSelect: () => void
}) {
    return (
        <button
            type="button"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            onClick={onSelect}
            className={`${DRAWER_ROW_BASE} ${active ? 'bg-stone-700' : 'bg-dsh-surface-2'}`}
        >
            <span aria-hidden="true" className={DRAWER_ICON_CLASS}>
                {item.icon}
            </span>
            <motion.span
                className={DRAWER_LABEL_CLASS}
                initial={false}
                animate={{ opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
            >
                {item.label}
            </motion.span>
        </button>
    )
}

type DrawerActionProps = {
    icon: ReactNode
    label: string
    expanded: boolean
    onClick: () => void
    pressed?: boolean
    shortcut?: string
}

function DrawerAction({ icon, label, expanded, onClick, pressed, shortcut }: DrawerActionProps) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={pressed}
            aria-keyshortcuts={shortcut?.replace('Ctrl', 'Control')}
            onClick={onClick}
            className={DRAWER_ROW_CLASS}
        >
            <span aria-hidden="true" className={DRAWER_ICON_CLASS}>
                {icon}
            </span>
            <motion.span
                className={DRAWER_LABEL_CLASS}
                initial={false}
                animate={{ opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
            >
                {label}
                {shortcut && (
                    <span className="ml-2 text-xs font-thin text-dsh-text-secondary">{shortcut}</span>
                )}
            </motion.span>
        </button>
    )
}

type DrawerRailProps = {
    side: DrawerSide
    items: NavItem[]
    open: boolean
    disabled: boolean
    editing: boolean
    onOpen: (trigger: HTMLElement) => void
    onToggleEditing: () => void
    onSearch?: (trigger: HTMLElement) => void
}

function DrawerRail({
    side,
    items,
    open,
    disabled,
    editing,
    onOpen,
    onToggleEditing,
    onSearch,
}: DrawerRailProps) {
    const isLeft = side === 'left'
    const label = isLeft ? '左侧' : '右侧'
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = normalizePath(location.pathname)
    const statusCounts = useTileStatusCounts()
    const errorCountLabel = statusCounts.error > 9 ? '9+' : String(statusCounts.error)

    return (
        <nav
            aria-label={
                isLeft
                    ? `${label}导航`
                    : `用户信息，${statusCounts.warn} 个警告，${statusCounts.error} 个错误`
            }
            data-tile-warnings={statusCounts.warn}
            data-tile-errors={statusCounts.error}
            className={`fixed top-0 bottom-0 z-40 flex w-16 flex-col items-center bg-dsh-surface-2 max-[787.98px]:hidden ${isLeft ? 'left-0 border-r-stone-50/50' : 'right-0 border-l-stone-50/50'
                }`}
        >
            {isLeft && onSearch && (
                <button
                    id="dasher-search-trigger"
                    type="button"
                    className={`${RAIL_BUTTON_CLASS} mt-2 relative group`}
                    aria-label="搜索"
                    aria-keyshortcuts="Control+K Meta+K"
                    onClick={(event) => onSearch(event.currentTarget)}
                >
                    <SearchIcon
                        aria-hidden="true"
                        className="size-5"
                        fillColor="transparent"
                        strokeColor="currentColor"
                        strokeWidth={2}
                    />
                    <div className='-bottom-1 left-1/2 -translate-x-1/2 scale-60 absolute opacity-70 group-hover:opacity-0 '>ctrl+K</div>
                </button>
            )}

            {!isLeft && (
                <div>
                    <div className="mt-2 grid size-12 place-items-center" aria-hidden="true">
                        <img src={dasherLogo} alt="" className="size-7 scale-80 invert" />
                    </div>
                    <div className="mt-2 grid size-12 place-items-center select-none -translate-y-1.5" aria-hidden="true">
                        <p
                            className="w-12 truncate text-center text-sm text-dsh-text-secondary translate-y-1.5"
                            title={CURRENT_USER.name}
                        >
                            {CURRENT_USER.name}
                        </p>
                        <p
                            className="w-12 truncate text-center text-xs/3 text-dsh-text-secondary/50!"
                            title={CURRENT_USER.role}
                        >
                            {CURRENT_USER.role}
                        </p>
                    </div>
                    {
                        statusCounts.error > 0 &&
                        <div className="mt-2 grid w-12 place-items-center select-none" aria-hidden="true">
                            <motion.p
                                key={errorCountLabel}
                                className="text-center text-xl text-dsh-error"
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.6, 1.6, 1] }}
                                transition={{
                                    duration: 0.66,
                                    times: [0, 0.1, 0.86, 1],
                                    ease: 'easeOut',
                                }}
                            >
                                {errorCountLabel}
                            </motion.p>
                            <p className="text-center text-xs/2 text-dsh-text-secondary/50!">
                                严重
                            </p>
                        </div>
                    }
                </div>
            )}

            {items.length > 0 && (
                <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto pt-2">
                    {items.map((item) => {
                        const active = Boolean(item.path && item.path === currentPath)

                        return item.path ? (
                            <button
                                key={item.id}
                                type="button"
                                title={item.label}
                                aria-label={item.label}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => navigate(item.path!)}
                                className={`${RAIL_BUTTON_BASE} ${active
                                    ? 'bg-stone-700 text-dsh-text-title'
                                    : 'text-dsh-text-secondary hover:bg-stone-700 hover:text-dsh-text-title'
                                    }`}
                            >
                                <span aria-hidden="true">{item.icon}</span>
                            </button>
                        ) : (
                            <span
                                key={item.id}
                                title={item.label}
                                className={RAIL_BUTTON_CLASS}
                            >
                                <span aria-hidden="true">{item.icon}</span>
                            </span>
                        )
                    })}
                </div>
            )}

            {isLeft && (
                <div className="mt-auto flex flex-col items-center gap-1 pb-2">
                    <button
                        type="button"
                        aria-label={editing ? '完成' : '编辑'}
                        aria-pressed={editing}
                        onClick={onToggleEditing}
                        className={RAIL_BUTTON_CLASS}
                    >
                        {editing ? (
                            <CheckIcon
                                aria-hidden="true"
                                className="size-5"
                                fillColor="transparent"
                                strokeColor="currentColor"
                                strokeWidth={2}
                            />
                        ) : (
                            <EditIcon
                                aria-hidden="true"
                                className="size-5"
                                fillColor="transparent"
                                strokeColor="currentColor"
                                strokeWidth={2}
                            />
                        )}
                    </button>

                    <button
                        id="dasher-left-trigger"
                        type="button"
                        className={RAIL_BUTTON_CLASS}
                        aria-label="展开左侧导航"
                        aria-expanded={open}
                        aria-controls="dasher-left-drawer"
                        aria-haspopup="dialog"
                        disabled={disabled}
                        onClick={(event) => onOpen(event.currentTarget)}
                    >
                        <ChevronRightIcon
                            aria-hidden="true"
                            className="size-5"
                            fillColor="transparent"
                            strokeColor="currentColor"
                            strokeWidth={2}
                        />
                    </button>
                </div>
            )}

            {!isLeft && (
                <div className="mt-auto flex flex-col items-center gap-1 pb-2">
                    <button
                        id={`dasher-${side}-trigger`}
                        type="button"
                        className={RAIL_BUTTON_CLASS}
                        aria-label="打开用户信息"
                        aria-expanded={open}
                        aria-controls={`dasher-${side}-drawer`}
                        aria-haspopup="dialog"
                        disabled={disabled}
                        onClick={(event) => onOpen(event.currentTarget)}
                    >
                        <UserIcon
                            aria-hidden="true"
                            className="size-5"
                            fillColor="transparent"
                            strokeColor="currentColor"
                            strokeWidth={2}
                        />
                    </button>
                </div>
            )}
        </nav>
    )
}

type DrawerPanelProps = {
    side: DrawerSide
    editing: boolean
    closing: boolean
    searchInputRef: RefObject<HTMLInputElement | null>
    onToggleEditing: () => void
    onClose: () => void
}

function DrawerPanel({
    side,
    editing,
    closing,
    searchInputRef,
    onToggleEditing,
    onClose,
}: DrawerPanelProps) {
    const isLeft = side === 'left'
    const label = isLeft ? '左侧' : '右侧'
    const panelLabel = isLeft ? `${label}导航抽屉` : '用户信息抽屉'
    const panelRef = useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const currentPath = normalizePath(location.pathname)

    useEffect(() => {
        const panel = panelRef.current
        if (!panel) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            const fullWidth = Math.min(DRAWER_WIDTH, window.innerWidth)
            setExpanded(entry.contentRect.width >= fullWidth - 1)
        })
        observer.observe(panel)
        return () => observer.disconnect()
    }, [])

    return (
        <motion.div
            ref={panelRef}
            id={`dasher-${side}-drawer`}
            role="dialog"
            aria-modal="true"
            aria-label={panelLabel}
            tabIndex={-1}
            className={`fixed top-0 bottom-0 z-[70] overflow-hidden bg-dsh-surface-2 outline-none ${isLeft ? 'left-0 border-r-stone-50/50' : 'right-0 border-l-stone-50/50'
                }`}
            initial={{ width: RAIL_WIDTH }}
            animate={{ width: DRAWER_WIDTH }}
            exit={{ width: RAIL_WIDTH }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ maxWidth: '100vw' }}
        >
            <motion.nav
                aria-label={isLeft ? `${label}导航` : '用户信息'}
                className="flex h-full flex-col"
                initial={false}
                animate={{ opacity: closing ? 0 : 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
            >
                {isLeft && <Search inputRef={searchInputRef} />}
                {isLeft && (
                    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pt-2.25">
                        {NAV_ITEMS.map((item) => (
                            <DrawerMenuItem
                                key={item.id}
                                item={item}
                                active={Boolean(item.path && item.path === currentPath)}
                                expanded={expanded}
                                onSelect={() => {
                                    if (item.path) navigate(item.path)
                                    onClose()
                                }}
                            />
                        ))}
                    </div>
                )}

                {!isLeft && (
                    <motion.div
                        className="flex shrink-0 items-center justify-end gap-3 px-4 pt-4"
                        initial={false}
                        animate={{ opacity: expanded ? 1 : 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        aria-hidden={!expanded}
                    >
                        <span className="text-base font-semibold tracking-[0.18em] text-dsh-text-title">
                            DASHER
                        </span>
                        <img src={dasherLogo} alt="" className="size-7 scale-80 invert" />
                    </motion.div>
                )}

                {!isLeft && <UserPanel expanded={expanded} />}

                <div className={`flex shrink-0 flex-col gap-1 pb-2 ${isLeft ? '' : 'mt-auto'}`}>
                    {isLeft && (
                        <DrawerAction
                            icon={
                                editing ? (
                                    <CheckIcon
                                        aria-hidden="true"
                                        className="size-5"
                                        fillColor="transparent"
                                        strokeColor="currentColor"
                                        strokeWidth={2}
                                    />
                                ) : (
                                    <EditIcon
                                        aria-hidden="true"
                                        className="size-5"
                                        fillColor="transparent"
                                        strokeColor="currentColor"
                                        strokeWidth={2}
                                    />
                                )
                            }
                            label={editing ? '完成' : '编辑'}
                            expanded={expanded}
                            pressed={editing}
                            onClick={onToggleEditing}
                        />
                    )}
                    {!isLeft && (
                        <DrawerAction
                            icon={
                                <LogoutIcon
                                    aria-hidden="true"
                                    className="size-5"
                                    fillColor="transparent"
                                    strokeColor="currentColor"
                                    strokeWidth={2}
                                />
                            }
                            label="退出登录"
                            expanded={expanded}
                            onClick={() => undefined}
                        />
                    )}
                    <DrawerAction
                        icon={
                            <CloseIcon
                                aria-hidden="true"
                                className="size-5"
                                fillColor="transparent"
                                strokeColor="currentColor"
                                strokeWidth={2}
                            />
                        }
                        label={isLeft ? '关闭左侧' : '关闭右侧'}
                        shortcut={isLeft ? 'Ctrl+S' : 'Ctrl+E'}
                        expanded={expanded}
                        onClick={onClose}
                    />
                </div>
            </motion.nav>
        </motion.div>
    )
}

export default function App() {
    const [openSide, setOpenSide] = useState<DrawerSide | null>(null)
    const [editing, setEditing] = useState(false)
    const [preview, setPreview] = useState(() => window.location.hash.includes('@preview'))
    const [keyIndicator, setKeyIndicator] = useState<KeyIndicatorState | null>(null)
    const [closingRight, setClosingRight] = useState(false)
    const restoreFocusRef = useRef<HTMLElement | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const focusSearchOnOpenRef = useRef(false)
    const keyIndicatorLocked = useRef(false)
    const keyIndicatorTimer = useRef<number | null>(null)
    const closeTimerRef = useRef<number | null>(null)

    useEffect(() => {
        const updatePreview = () => setPreview(window.location.hash.includes('@preview'))
        window.addEventListener('hashchange', updatePreview)
        return () => window.removeEventListener('hashchange', updatePreview)
    }, [])

    useEffect(() => {
        if (!preview) return

        // 预览页要展示完整图表，但数据固定在进入预览时的快照上。
        if (telemetryStore.getSnapshot().history.length < 2) {
            telemetryStore.step(60)
        }
        telemetryStore.pause()

        return () => telemetryStore.resume()
    }, [preview])

    const openDrawer = (side: DrawerSide, trigger: HTMLElement, focusSearch = false) => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
        }
        setClosingRight(false)
        focusSearchOnOpenRef.current = focusSearch
        restoreFocusRef.current = trigger
        setOpenSide(side)
    }

    const closeDrawer = useCallback(() => {
        if (openSide === 'right') {
            if (closingRight || closeTimerRef.current !== null) return
            setClosingRight(true)
            closeTimerRef.current = window.setTimeout(() => {
                closeTimerRef.current = null
                setOpenSide(null)
            }, RIGHT_PANEL_FADE_MS)
            return
        }
        setOpenSide(null)
    }, [openSide, closingRight])

    const closeDrawerRef = useRef(closeDrawer)

    useEffect(() => {
        closeDrawerRef.current = closeDrawer
    }, [closeDrawer])

    useEffect(() => {
        return () => {
            if (closeTimerRef.current !== null) {
                window.clearTimeout(closeTimerRef.current)
                closeTimerRef.current = null
            }
        }
    }, [])

    const openSearch = (trigger: HTMLElement) => {
        const floating = document.getElementById('dasher-floating-trigger')
        const visibleTrigger = trigger.offsetParent
            ? trigger
            : floating instanceof HTMLElement
                ? floating
                : trigger
        openDrawer('left', visibleTrigger, true)
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => searchInputRef.current?.focus())
        })
    }

    const toggleEditing = () => {
        setEditing((value) => !value)
        setOpenSide(null)
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

            const key = event.key.toLowerCase()
            if (key !== 's' && key !== 'e') return
            event.preventDefault()

            const side: DrawerSide = key === 's' ? 'left' : 'right'
            if (openSide === side) {
                closeDrawer()
                return
            }

            const rail = document.getElementById(
                side === 'left' ? 'dasher-left-trigger' : 'dasher-right-trigger',
            )
            const mobile = document.getElementById(
                side === 'left' ? 'dasher-floating-trigger' : 'dasher-floating-trigger-right',
            )
            const trigger = rail?.offsetParent ? rail : mobile?.offsetParent ? mobile : rail

            if (trigger instanceof HTMLElement) {
                openDrawer(side, trigger)
            } else {
                setOpenSide(side)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [openSide, closeDrawer])

    useEffect(() => {
        const modifierKeys = ['Control', 'Alt']
        const modifierLabels = (event: KeyboardEvent, exclude?: string) => [
            ...(event.ctrlKey && exclude !== 'Control' ? ['Ctrl'] : []),
            ...(event.altKey && exclude !== 'Alt' ? ['Alt'] : []),
        ]
        let keyboardFocus = false
        let keyboardFocusTimer = 0
        const clearTimer = () => {
            if (keyIndicatorTimer.current === null) return
            window.clearTimeout(keyIndicatorTimer.current)
            keyIndicatorTimer.current = null
        }
        const hideIndicator = () => {
            keyIndicatorLocked.current = false
            clearTimer()
            setKeyIndicator(null)
        }
        const showIndicator = (next: KeyIndicatorState) => {
            keyIndicatorLocked.current = true
            clearTimer()
            setKeyIndicator(next)
            keyIndicatorTimer.current = window.setTimeout(() => {
                keyIndicatorLocked.current = false
                keyIndicatorTimer.current = null
                setKeyIndicator(null)
            }, 1000)
        }
        const showShortcut = (keys: string[], action: string) =>
            showIndicator({ keys, action })
        const showNavigation = (label: string) => showIndicator({ navigation: label })

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
                keyboardFocus = true
                window.clearTimeout(keyboardFocusTimer)
                keyboardFocusTimer = window.setTimeout(() => {
                    keyboardFocus = false
                }, 500)
            }

            if (modifierKeys.includes(event.key)) {
                keyIndicatorLocked.current = false
                clearTimer()
                setKeyIndicator({ keys: modifierLabels(event) })
                return
            }

            const searchShortcut =
                (event.ctrlKey || event.metaKey) &&
                !event.shiftKey &&
                !event.altKey &&
                event.key.toLowerCase() === 'k'

            if (searchShortcut) {
                event.preventDefault()
                document.getElementById('dasher-search-trigger')?.click()

                if (!event.ctrlKey) return

                showShortcut([...modifierLabels(event), 'K'], '搜索')
                return
            }

            const drawerShortcut =
                event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.altKey &&
                (event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'e')

            if (drawerShortcut) {
                showShortcut(
                    [...modifierLabels(event), event.key.toUpperCase()],
                    event.key.toLowerCase() === 's' ? '切换左栏' : '切换右栏',
                )
                return
            }

            const hasPreviewModifier = event.ctrlKey || event.altKey
            if (!hasPreviewModifier) return
            if (!keyIndicatorLocked.current) {
                setKeyIndicator({ keys: modifierLabels(event) })
            }
        }

        const handleFocusIn = (event: FocusEvent) => {
            if (!keyboardFocus) return
            keyboardFocus = false
            window.clearTimeout(keyboardFocusTimer)

            const target = event.target
            if (!(target instanceof HTMLElement)) return
            const label = getFocusNavigationLabel(target)
            if (!label) return
            showNavigation(label)
        }

        const handleFocusOut = (event: FocusEvent) => {
            if (!keyboardFocus || event.relatedTarget !== null) return
            showNavigation('浏览器')
        }

        const handlePointerDown = () => {
            keyboardFocus = false
            window.clearTimeout(keyboardFocusTimer)
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!modifierKeys.includes(event.key) || keyIndicatorLocked.current) return
            const keys = modifierLabels(event, event.key)
            setKeyIndicator(keys.length > 0 ? { keys } : null)
        }

        const handleBlur = () => {
            hideIndicator()
        }

        const handleWindowFocus = () => {
            keyboardFocus = false
            window.clearTimeout(keyboardFocusTimer)
            hideIndicator()
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)
        document.addEventListener('focusin', handleFocusIn)
        document.addEventListener('focusout', handleFocusOut)
        document.addEventListener('pointerdown', handlePointerDown, true)
        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleWindowFocus)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
            document.removeEventListener('focusin', handleFocusIn)
            document.removeEventListener('focusout', handleFocusOut)
            document.removeEventListener('pointerdown', handlePointerDown, true)
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleWindowFocus)
            window.clearTimeout(keyboardFocusTimer)
            clearTimer()
        }
    }, [])

    useEffect(() => {
        if (openSide === null) {
            restoreFocusRef.current?.focus()
            restoreFocusRef.current = null
            return
        }

        const panel = document.getElementById(`dasher-${openSide}-drawer`)
        const focusable = getFocusable(panel)
        const focusSearch = openSide === 'left' && focusSearchOnOpenRef.current
        focusSearchOnOpenRef.current = false
        const initialFocus =
            focusSearch && searchInputRef.current
                ? searchInputRef.current
                : openSide === 'left'
                    ? focusable.find((element) => element !== searchInputRef.current) ?? panel
                    : focusable[0] ?? panel
        initialFocus?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                closeDrawerRef.current()
                return
            }
            if (event.key !== 'Tab') return

            const currentPanel = document.getElementById(`dasher-${openSide}-drawer`)
            if (!currentPanel) return
            const items = getFocusable(currentPanel)
            if (items.length === 0) {
                event.preventDefault()
                currentPanel.focus()
                return
            }

            const first = items[0]
            const last = items[items.length - 1]
            const active = document.activeElement
            const outside = active === null || !currentPanel.contains(active) || active === currentPanel

            if (outside) {
                event.preventDefault()
                    ; (event.shiftKey ? last : first).focus()
                return
            }
            if (event.shiftKey && active === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && active === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [openSide])

    return (
        <TileStatusProvider>
            <EditModeContext.Provider value={editing}>
                <div className="case-Dasher min-h-screen bg-dsh-surface-0 font-normal text-dsh-text relative font-maple-mono">
                    <div inert={openSide !== null}>
                        <DrawerRail
                            side="left"
                            items={NAV_ITEMS}
                            open={openSide === 'left'}
                            disabled={openSide !== null}
                            editing={editing}
                            onOpen={(trigger) => openDrawer('left', trigger)}
                            onToggleEditing={toggleEditing}
                            onSearch={openSearch}
                        />
                        <DrawerRail
                            side="right"
                            items={[]}
                            open={openSide === 'right'}
                            disabled={openSide !== null}
                            editing={editing}
                            onOpen={(trigger) => openDrawer('right', trigger)}
                            onToggleEditing={toggleEditing}
                        />
                        <div className="pointer-events-none fixed left-1/2 top-0 z-[1000] -translate-x-1/2">
                            <AnimatePresence>
                                {keyIndicator && (
                                    <motion.div
                                        key="key-indicator"
                                        id="key-indicator"
                                        role="status"
                                        aria-live="polite"
                                        className="flex w-fit items-center gap-2 bg-stone-700 px-2 py-1 text-sm outline outline-2 -outline-offset-1 outline-dsh-hairline"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.12, ease: 'easeOut' }}
                                    >
                                        {keyIndicator.navigation ? (
                                            <span className="text-dsh-text-title">
                                                导航：{keyIndicator.navigation}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="text-dsh-text-title">
                                                    {keyIndicator.keys?.join(' + ')}
                                                </span>
                                                {keyIndicator.action && (
                                                    <span className="text-dsh-text-secondary">
                                                        {keyIndicator.action}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <PreviewModeContext.Provider value={preview}>
                            <Outlet />
                        </PreviewModeContext.Provider>

                        <div className='fixed z-50 bottom-0 left-0 right-0 outline-1 -outline-offset-1 outline-dsh-hairline hidden max-[787.98px]:flex will-change-auto bg-dsh-surface-2 overflow-hidden'>
                            <button
                                type="button"
                                id="dasher-floating-trigger"
                                className="grid size-14 cursor-pointer place-items-center bg-dsh-surface-2 text-dsh-text grow  transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-stone-300/40 "
                                aria-label="打开左侧导航"
                                aria-expanded={openSide === 'left'}
                                aria-controls="dasher-left-drawer"
                                aria-haspopup="dialog"
                                disabled={openSide !== null}
                                onClick={(event) => openDrawer('left', event.currentTarget)}
                            >
                                <MenuIcon
                                    aria-hidden="true"
                                    className="size-6"
                                    fillColor="transparent"
                                    strokeColor="currentColor"
                                    strokeWidth={2}
                                />
                            </button>
                            <div className='w-px bg-stone-300/10'></div>
                            <button
                                type="button"
                                id="dasher-floating-trigger-right"
                                className="grid size-14 cursor-pointer place-items-center bg-dsh-surface-2 text-dsh-text grow  transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-stone-300/40 "
                                aria-label="打开用户信息"
                                aria-expanded={openSide === 'right'}
                                aria-controls="dasher-right-drawer"
                                aria-haspopup="dialog"
                                disabled={openSide !== null}
                                onClick={(event) => openDrawer('right', event.currentTarget)}
                            >
                                <UserIcon
                                    aria-hidden="true"
                                    className="size-6"
                                    fillColor="transparent"
                                    strokeColor="currentColor"
                                    strokeWidth={2}
                                />
                            </button>
                        </div>

                    </div>

                    <AnimatePresence>
                        {openSide !== null && (
                            <motion.button
                                key="dasher-drawer-scrim"
                                type="button"
                                tabIndex={-1}
                                aria-hidden="true"
                                className="fixed inset-0 z-[60] cursor-pointer bg-stone-950/30"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                onClick={closeDrawer}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {openSide !== null && (
                            <DrawerPanel
                                key={openSide}
                                side={openSide}
                                editing={editing}
                                closing={closingRight}
                                searchInputRef={searchInputRef}
                                onToggleEditing={toggleEditing}
                                onClose={closeDrawer}
                            />
                        )}
                    </AnimatePresence>

                    <span className="sr-only" aria-live="polite">
                        {editing ? '编辑模式已开启' : '编辑模式已关闭'}
                    </span>

                    {/* 页脚插槽 */}
                </div>
            </EditModeContext.Provider>
        </TileStatusProvider>
    )
}
