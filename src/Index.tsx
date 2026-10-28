import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { caseRoutes } from './cases'
import hsMark from './_hs.svg'

type CasePreview = {
    path: string
    label: string
}

// 从案例路由里推导预览项：path 即案例挂载前缀，label 由案例名首字母大写
const casePreviews: CasePreview[] = caseRoutes
    .filter((route) => route.path)
    .map((route) => {
        const name = (route.path ?? '').replace(/^\//, '').split('/')[0]
        return {
            path: `/${name}`,
            label: name.charAt(0).toUpperCase() + name.slice(1),
        }
    })

export default function Index() {
    const [preview, setPreview] = useState(casePreviews[0]?.path ?? '')
    const [loading, setLoading] = useState(true)

    const subProjName = casePreviews.find((item) => item.path === preview)?.label ?? ''
    const marqueeText = `PREVIEW [${subProjName.toUpperCase()}] - DES FEIRON -`

    const showPreview = (path: string) => {
        if (path === preview) return
        setLoading(true)
        setPreview(path)
    }

    return <div className="w-full h-screen md:flex bg-zinc-900 text-zinc-50 select-none! overflow-hidden font-oppo-sans relative">
        {/* 手写标识：目录页左上角，反色后以白线显示，高度 60px */}
        <img src={hsMark} alt='' aria-hidden='true' className="pointer-events-none absolute left-0 top-0 z-10 h-[60px] w-auto invert" />
        <div id="index" className="md:min-w-1/5 md:max-w-1/4 bg-zinc-900 flex flex-col border-b-4 border-b-zinc-900 h-full">
            <div className="bg-zinc-800  w-full py-5 px-1.5 text-5xl relative md:opacity-0 border-b-4 md:border-b-0 border-b-zinc-500 ">
                <h1 className="text-right w-full -translate-y-1 -translate-x-1 "><span className="hidden md:inline-block opacity-0">_</span><span className="md:hidden">Feiron's Designs</span></h1>
            </div>
            {casePreviews.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={
                        'item block transition text-3xl p-3 text-right pb-4 ' +
                        (item.path === preview
                            ? 'bg-zinc-50 text-zinc-900'
                            : 'bg-zinc-800 hover:bg-zinc-600')
                    }
                    onMouseEnter={() => showPreview(item.path)}
                    onFocus={() => showPreview(item.path)}
                >
                    {item.label}
                </Link>
            ))}
        </div>
        <div className="grow hidden md:flex md:flex-col">
            <div className="bg-zinc-800  w-full py-5 px-1.5 text-5xl relative">
                <h1 className="text-right w-full -translate-y-1 -translate-x-1">Feiron's Designs</h1>
            </div>
            {/* 预览区：容器裁切，iframe 按 bg-cover 铺满并居中（16:9） */}
            <div className="relative grow overflow-hidden @container-size">
                <iframe
                    title="案例预览"
                    src={`${preview}#@preview`}
                    onLoad={(event) => {
                        // 预览与站点同源，直接锁死内层文档滚动（只影响 iframe 里的这份文档）
                        const doc = event.currentTarget.contentDocument
                        if (doc) {
                            doc.documentElement.style.overflow = 'hidden'
                            doc.body.style.overflow = 'hidden'
                        }
                        setLoading(false)
                    }}
                    className="aspect-video w-[max(100cqw,calc(100cqh*16/9))] h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none scrollbar-none bg-zinc-950"
                ></iframe>
                {/* 右下角斜向 marquee：right 450 − bottom 150 = 300，使斜带内缘恒为右下角 300×300 等腰直角三角形的斜边（与屏幕尺寸无关） */}
                <div className="pointer-events-none absolute -right-[550px] -bottom-[150px] w-[900px] origin-bottom-left -rotate-45 overflow-hidden bg-zinc-800 py-2 text-zinc-100">
                    <motion.div
                        className="flex w-max text-3xl tracking-[0.2em] whitespace-nowrap border-y-zinc-600 border-y-2"
                        animate={{ x: ['-50%', '0%'] }}
                        transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
                    >
                        {Array.from({ length: 8 }, (_, index) => (
                            <span key={index} className="pr-[1ch] pb-1">
                                {marqueeText}
                            </span>
                        ))}
                    </motion.div>
                </div>
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            className="absolute inset-0 bg-zinc-800/90"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
}
