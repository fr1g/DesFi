import { useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router'
import { motion } from 'motion/react'
import { HeroSlotContext } from '../HeroSlotContext'
import { Topic as TopicModel } from '../classes/Topic'
import { ArticlePreview } from '../classes/Article'

const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const escapeXml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 专题封面：占满屏幕宽度的 hero，大标题压在平铺的专题字纹上 */
function TopicHero({ topic }: { topic: TopicModel }) {
    const title = topic.title ?? topic.uniqueName
    // repeat art：没有 useHero 大图时，把专题名做成平铺的幽灵字纹；
    // textLength 把整行字压进图块内（左右留白），平铺时不会出现断词裁切
    const tile = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='150'><text x='0' y='112' font-family='Tinos, Georgia, serif' font-size='92' font-weight='700' fill='rgb(197,102,30)' fill-opacity='0.10' textLength='560' lengthAdjust='spacingAndGlyphs'>${escapeXml(title.toUpperCase())}</text></svg>`
    return (
        <section className='relative w-full overflow-hidden border-b border-gz-border bg-gz-secondary'>
            {topic.useHero
                ? <div aria-hidden='true' className='absolute inset-0 bg-center bg-cover' style={{ backgroundImage: `url(${topic.useHero})` }} />
                : <div aria-hidden='true' className='absolute inset-0' style={{
                    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tile)}")`,
                    backgroundSize: '640px 150px',
                    // 上下边缘渐隐，避免平铺的整行字在 hero 边界被切一刀
                    maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
                }} />}
            <div className='relative mx-auto flex h-[72vh] min-h-[440px] w-full max-w-[1280px] flex-col justify-end gap-3 p-8 pt-20'>
                <p className='text-sm uppercase tracking-[0.35em] text-gz-muted-foreground'>{topic.uniqueName} — dossier</p>
                <h1 className='text-[min(11vw,168px)] font-bold leading-none text-gz-accent-foreground'>{title}</h1>
                <p className='max-w-[780px] text-lg text-gz-muted-foreground'>{topic.describe}</p>
            </div>
        </section>
    )
}

export default function Topic() {
    const { topicName } = useParams()
    const heroSlot = useContext(HeroSlotContext)
    // 状态带上专题名：换专题时按名字自然派生，effect 里无需同步重置
    const [loaded, setLoaded] = useState<null | { name: string; topic: TopicModel }>(null)
    const [failedName, setFailedName] = useState<null | string>(null)
    const [previews, setPreviews] = useState<null | ArticlePreview[]>(null)
    const topic = loaded && loaded.name === topicName ? loaded.topic : null
    const failed = failedName === topicName
    // 下滑超过 50px 才在导航栏正中央淡入标题
    const [scrolledPast, setScrolledPast] = useState(() => window.scrollY > 50)

    useEffect(() => {
        const onScroll = () => setScrolledPast(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!topicName) return
        let cancelled = false
        fetch(`/gazette/topics/${topicName}.json`).then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            if (cancelled) return
            setLoaded({
                name: topicName,
                topic: new TopicModel(data.uniqueName, data.describe, data.useHero, data.articles, data.title ?? null),
            })
        }).catch((res) => {
            if (cancelled) return
            console.error(res)
            setFailedName(topicName)
        })
        return () => {
            cancelled = true
        }
    }, [topicName])

    useEffect(() => {
        if (previews !== null) return
        fetch('/gazette/headlines.json').then((res) => res.json()).then((data) => {
            setPreviews(data as ArticlePreview[])
        }).catch((res) => {
            console.error(res)
        })
    }, [previews])

    if (!topic) {
        return <p className='text-gz-muted-foreground'>{failed ? 'Dossier introuvable.' : 'Chargement…'}</p>
    }

    // 最新四篇：一篇满宽 + 三篇并列；其余按时间排进目录列表
    const items = (previews ?? [])
        .filter((preview) => topic.articles.includes(preview.id))
        .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
    const latest = items.slice(0, 4)
    const older = items.slice(4)

    return <>
        <motion.h1
            className='pointer-events-none fixed left-1/2 top-0 z-40 flex h-12 max-w-[720px] -translate-x-1/2 select-none items-center overflow-hidden text-ellipsis whitespace-nowrap text-3xl'
            animate={{ opacity: scrolledPast ? 1 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
        >{topic.title ?? topic.uniqueName}</motion.h1>
        {heroSlot && createPortal(<TopicHero topic={topic} />, heroSlot)}
        <div className='grid grid-cols-3 gap-3'>
            {latest[0] && (
                <div className='col-span-full p-3'>
                    <h2 className='font-semibold text-4xl hover:underline text-justify'>
                        <Link to={`/Gazette/art/${latest[0].id}`}>{latest[0].title}</Link>
                    </h2>
                    <p className='text-lg py-0.5 text-justify'>{latest[0].partialContent}</p>
                    {latest[0].imageUrl && (
                        <div className='image-container w-full h-64 border bg-center bg-no-repeat bg-cover' style={{ backgroundImage: `url(${latest[0].imageUrl})` }} />
                    )}
                </div>
            )}
            {latest.slice(1).map((preview) => (
                <div key={preview.id} className='p-3'>
                    <h3 className='font-semibold text-2xl hover:underline text-justify'>
                        <Link to={`/Gazette/art/${preview.id}`}>{preview.title}</Link>
                    </h3>
                    <p className='text-lg py-0.5 text-justify'>{preview.partialContent}</p>
                </div>
            ))}
        </div>
        {older.length > 0 && (
            <div className='mt-3 p-3'>
                <h3 className='text-2xl font-semibold'>Archives du dossier</h3>
                <ul className='mt-2'>
                    {older.map((preview) => (
                        <li key={preview.id} className='flex items-baseline gap-2 text-lg'>
                            <Link className='shrink-0 hover:underline' to={`/Gazette/art/${preview.id}`}>{preview.title}</Link>
                            <span aria-hidden='true' className='grow border-b border-dotted border-gz-muted-foreground/70' />
                            <span className='shrink-0 italic text-gz-muted-foreground'>{formatDate(preview.releaseDate)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </>
}
