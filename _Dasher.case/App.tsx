import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Outlet } from 'react-router'
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
import { telemetryStore } from './tools/telemetry'
import { EditModeContext } from './tiles/EditModeContext'
import { PreviewModeContext } from './tiles/PreviewModeContext'

type DrawerSide = 'left' | 'right'

type KeyIndicatorState = {
    keys: string[]
    action?: string
}

type NavItem = {
    id: string
    label: string
    icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'overview',
        label: '系统概览',
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
        label: '设备设置',
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
const FOCUSABLE_SELECTOR =
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const DRAWER_ROW_CLASS =
    'flex relative h-12 w-full cursor-pointer items-center overflow-hidden bg-dsh-surface-2 text-base font-normal text-dsh-text-title transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-300/40'
const DRAWER_ICON_CLASS = 'grid h-12 w-16 shrink-0 place-items-center'
const DRAWER_LABEL_CLASS = 'min-w-0 flex-1 whitespace-nowrap pr-4 text-right'
const RAIL_BUTTON_CLASS =
    'grid size-12 shrink-0 place-items-center text-dsh-text-secondary transition hover:bg-stone-700 hover:text-dsh-text-title focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-300/40'

function getFocusable(container: HTMLElement | null) {
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true',
    )
}

function DrawerMenuItem({
    item,
    expanded,
    onSelect,
}: {
    item: NavItem
    expanded: boolean
    onSelect: () => void
}) {
    return (
        <button
            type="button"
            aria-label={item.label}
            onClick={onSelect}
            className={DRAWER_ROW_CLASS}
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

    return (
        <nav
            aria-label={isLeft ? `${label}导航` : '用户信息'}
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
                <div className="mt-2 grid size-12 place-items-center" aria-hidden="true">
                    <img src={dasherLogo} alt="" className="size-7 scale-80 invert" />
                </div>
            )}

            {items.length > 0 && (
                <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto pt-2">
                    {items.map((item) => (
                        <span
                            key={item.id}
                            title={item.label}
                            className={RAIL_BUTTON_CLASS}
                        >
                            <span aria-hidden="true">{item.icon}</span>
                        </span>
                    ))}
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
    searchInputRef: RefObject<HTMLInputElement | null>
    onToggleEditing: () => void
    onClose: () => void
}

function DrawerPanel({
    side,
    editing,
    searchInputRef,
    onToggleEditing,
    onClose,
}: DrawerPanelProps) {
    const isLeft = side === 'left'
    const label = isLeft ? '左侧' : '右侧'
    const panelLabel = isLeft ? `${label}导航抽屉` : '用户信息抽屉'
    const panelRef = useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = useState(false)

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
            <nav aria-label={isLeft ? `${label}导航` : '用户信息'} className="flex h-full flex-col">
                {isLeft && <Search inputRef={searchInputRef} />}
                {isLeft && (
                    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pt-2.5">
                        {NAV_ITEMS.map((item) => (
                            <DrawerMenuItem
                                key={item.id}
                                item={item}
                                expanded={expanded}
                                onSelect={onClose}
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
            </nav>
        </motion.div>
    )
}

export default function App() {
    const [openSide, setOpenSide] = useState<DrawerSide | null>(null)
    const [editing, setEditing] = useState(false)
    const [preview, setPreview] = useState(() => window.location.hash.includes('@preview'))
    const [keyIndicator, setKeyIndicator] = useState<KeyIndicatorState | null>(null)
    const restoreFocusRef = useRef<HTMLElement | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const keyIndicatorLocked = useRef(false)
    const keyIndicatorTimer = useRef<number | null>(null)

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

    const openDrawer = (side: DrawerSide, trigger: HTMLElement) => {
        restoreFocusRef.current = trigger
        setOpenSide(side)
    }

    const openSearch = (trigger: HTMLElement) => {
        const floating = document.getElementById('dasher-floating-trigger')
        const visibleTrigger = trigger.offsetParent
            ? trigger
            : floating instanceof HTMLElement
                ? floating
                : trigger
        openDrawer('left', visibleTrigger)
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
                setOpenSide(null)
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
    }, [openSide])

    useEffect(() => {
        const modifierKeys = ['Control', 'Shift', 'Alt']
        const modifierLabels = (event: KeyboardEvent) => [
            ...(event.ctrlKey ? ['Ctrl'] : []),
            ...(event.shiftKey ? ['Shift'] : []),
            ...(event.altKey ? ['Alt'] : []),
        ]
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
        const showShortcut = (keys: string[], action: string) => {
            keyIndicatorLocked.current = true
            clearTimer()
            setKeyIndicator({ keys, action })
            keyIndicatorTimer.current = window.setTimeout(() => {
                keyIndicatorLocked.current = false
                keyIndicatorTimer.current = null
                setKeyIndicator(null)
            }, 1000)
        }

        const handleKeyDown = (event: KeyboardEvent) => {
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

            const hasPreviewModifier = event.ctrlKey || event.shiftKey || event.altKey
            if (!hasPreviewModifier) return
            if (!keyIndicatorLocked.current) {
                setKeyIndicator({ keys: modifierLabels(event) })
            }
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!modifierKeys.includes(event.key) || keyIndicatorLocked.current) return
            const keys = modifierLabels(event)
            setKeyIndicator(keys.length > 0 ? { keys } : null)
        }

        const handleBlur = () => {
            hideIndicator()
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)
        window.addEventListener('blur', handleBlur)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('blur', handleBlur)
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
            ; (focusable[0] ?? panel)?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                setOpenSide(null)
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
                                    <span className="text-dsh-text-title">
                                        {keyIndicator.keys.join(' + ')}
                                    </span>
                                    {keyIndicator.action && (
                                        <span className="text-dsh-text-secondary">
                                            {keyIndicator.action}
                                        </span>
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
                            onClick={() => setOpenSide(null)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {openSide !== null && (
                        <DrawerPanel
                            key={openSide}
                            side={openSide}
                            editing={editing}
                            searchInputRef={searchInputRef}
                            onToggleEditing={toggleEditing}
                            onClose={() => setOpenSide(null)}
                        />
                    )}
                </AnimatePresence>

                <span className="sr-only" aria-live="polite">
                    {editing ? '编辑模式已开启' : '编辑模式已关闭'}
                </span>

                {/* 页脚插槽 */}
            </div>
        </EditModeContext.Provider>
    )
}
