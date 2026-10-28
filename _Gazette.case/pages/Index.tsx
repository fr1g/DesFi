import { useEffect, useState } from "react";
import { Link } from "react-router";
import Paper from "../Paper";
import { ArticlePreview } from './../classes/Article'
import { AD } from './../classes/Advertisement'

const AD_FILES = ['/gazette/ads/lost-dalmatian.json', '/gazette/ads/used-citroen.json']


export default function Index() {
    const [content, setContent] = useState<null | ArticlePreview[]>(null)
    const [ads, setAds] = useState<null | AD[]>(null)
    useEffect(() => {
        if (content === null) {
            fetch('/gazette/headlines.json').then(async res => {
                setContent((await res.json()) as ArticlePreview[])
            }).catch(res => {
                console.error(res);
            })
        }
    }, [content])
    useEffect(() => {
        if (ads === null) {
            Promise.all(AD_FILES.map(url => fetch(url).then(res => res.json()))).then(data => {
                setAds(data.map(d => new AD(new Date(d.id), d.title, d.releasedBy, d.content, d.contact, d.imageUrl)))
            }).catch(res => {
                console.error(res);
            })
        }
    }, [ads])

    // 每篇文章文内的第一张插图（img:: 段落）——有图就在预览块标出来，预览图也优先用它
    const [illustrated, setIllustrated] = useState<null | Map<number, string | null>>(null)
    useEffect(() => {
        if (content === null) return
        let cancelled = false
        Promise.all(content.map(async preview => {
            const data = await fetch(`/gazette/${preview.id}.json`).then(res => res.json())
            const figure = (data.content as string[]).find(paragraph => paragraph.startsWith('img::'))
            return { id: preview.id as number, image: figure ? figure.split('::')[1] : null }
        })).then(rows => {
            if (!cancelled) setIllustrated(new Map(rows.map(row => [row.id, row.image])))
        }).catch(res => {
            console.error(res);
        })
        return () => { cancelled = true }
    }, [content])

    const lead = content?.find(p => p.isTodayTop) ?? content?.[0]
    const cards = content?.filter(p => p !== lead).slice(0, 4) ?? []
    // 头版四篇之后剩余的：侧栏拿一篇有图的，三连块放三篇其余
    const rest = content?.filter(p => p !== lead).slice(4) ?? []
    const side = rest.find(p => illustrated?.get(p.id) || p.imageUrl) ?? rest[0] ?? null
    const triple = rest.filter(p => p !== side).slice(0, 3)
    const leadImage = lead ? illustrated?.get(lead.id) ?? lead.imageUrl : null
    const sideImage = side ? illustrated?.get(side.id) ?? side.imageUrl : null
    // 编号 5 的配图单独占一格，并在图下注明它所属的文章
    const featured = content?.find(p => p.id === 5) ?? null
    const featuredImage = featured ? illustrated?.get(featured.id) ?? featured.imageUrl : null

    return <Paper title={
        <>
            <span>
                <span className="block font-bold text-gz-accent-foreground" style={{ lineHeight: '85%' }}>G<span className="scale-y-80 translate-y-[5%] inline-block">AZETTE</span></span>
                <span className="block text-7xl!">Aug_10, 1919</span>
            </span>
        </>
    }>
        <div className="grid grid-cols-9 gap-3">
            {lead && (
                <div className="col-span-full p-3">
                    {/* 头版新闻 */}
                    <h2 className="font-semibold text-4xl hover:underline text-justify "><Link to={`/Gazette/art/${lead.id}`}>{lead.title}</Link></h2>
                    <p className="text-lg py-0.5 text-justify">{lead.partialContent}</p>
                    <div className="image-container w-full h-64 border bg-center bg-no-repeat bg-cover" style={{ backgroundImage: leadImage ? `url(${leadImage})` : undefined }}></div>
                    {illustrated?.get(lead.id) && (
                        <p className="text-sm text-gz-muted-foreground italic text-justify">Contient une illustration.</p>
                    )}
                </div>
            )}
            <div className="col-span-6 grid gap-3">
                {cards.slice(0, 2).map(p => (
                    <div key={p.id} className="p-3">
                        <h3 className="font-semibold text-3xl hover:underline text-justify"><Link to={`/Gazette/art/${p.id}`}>{p.title}</Link></h3>
                        <p className="text-lg py-0.5 text-justify">{p.partialContent}</p>
                        {illustrated?.get(p.id) && (
                            <p className="text-sm text-gz-muted-foreground italic text-justify">Contient une illustration.</p>
                        )}
                    </div>
                ))}
            </div>
            <div className="col-span-3" id="news-side">
                {side && (
                    <div className="p-3">
                        <h3 className="font-semibold text-3xl hover:underline text-justify break-all hyphens-auto"><Link to={`/Gazette/art/${side.id}`}>{side.title.replace('imaires', 'i-maires')}</Link></h3>
                        <p className="text-lg py-0.5 text-justify">{side.partialContent}</p>
                        <div className="image-container w-full h-36 border bg-center bg-no-repeat bg-cover" style={{ backgroundImage: sideImage ? `url(${sideImage})` : undefined }}></div>
                        {illustrated?.get(side.id) && (
                            <p className="text-sm text-gz-muted-foreground italic text-justify">Contient une illustration.</p>
                        )}
                    </div>
                )}
            </div>
            <div className="col-span-full flex gap-3 bg-gz-secondary/70 border-x border-x-gz-secondary-foreground opacity-90">
                {/* 两则广告：图片放小，不占太多空间 */}
                {ads?.map(ad => (
                    <div key={ad.imageUrl} className="flex flex-1 items-start gap-3 p-3">
                        <img src={ad.imageUrl} alt={ad.title} className="h-24 w-auto" />
                        <div className="text-sm leading-snug">
                            <h4 className="font-bold">{ad.title}</h4>
                            <p className="py-0.5 text-justify">{ad.content}</p>
                            <p className="mt-1 text-gz-muted-foreground py-0.5 text-justify">{ad.releasedBy} — {ad.contact}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="col-span-3">
                {featured && (
                    <div className="p-3 h-[90%]">
                        <div className="image-container w-full h-full border bg-center bg-no-repeat bg-cover" style={{ backgroundImage: featuredImage ? `url(${featuredImage})` : undefined }}></div>
                        <p className="text-sm text-gz-muted-foreground italic text-justify">
                            Image issue de l’article <Link className="underline underline-offset-2" to={`/Gazette/art/${featured.id}`}>« {featured.title} »</Link>.
                        </p>
                    </div>
                )}
            </div>
            <div className="col-span-6 grid gap-3">
                {cards.slice(2, 4).map(p => (
                    <div key={p.id} className="p-3">
                        <h3 className="font-semibold text-3xl hover:underline text-justify"><Link to={`/Gazette/art/${p.id}`}>{p.title}</Link></h3>
                        <p className="text-lg py-0.5 text-justify">{p.partialContent}</p>
                        {illustrated?.get(p.id) && (
                            <p className="text-sm text-gz-muted-foreground italic text-justify">Contient une illustration.</p>
                        )}
                    </div>
                ))}
            </div>

            <div id="triple" className="col-span-full grid grid-cols-3 gap-3">
                {triple.map(p => (
                    <div key={p.id} className="p-3">
                        <h3 className="font-semibold text-2xl hover:underline text-justify"><Link to={`/Gazette/art/${p.id}`}>{p.title}</Link></h3>
                        <p className="text-lg py-0.5 text-justify">{p.partialContent}</p>
                        {illustrated?.get(p.id) && (
                            <p className="text-sm text-gz-muted-foreground italic text-justify">Contient une illustration.</p>
                        )}
                    </div>
                ))}
            </div>

        </div>
        <div aria-hidden="true" className="flex items-center gap-3 px-3.5 py-1 translate-y-1">
            <div className="h-px flex-1 bg-linear-to-l from-gz-muted-foreground/60 to-transparent" />
            <span className="text-base leading-none text-gz-muted-foreground italic font-thin">le joke</span>
            <div className="h-px flex-1 bg-linear-to-r from-gz-muted-foreground/60 to-transparent" />
        </div>
        <p className="p-3 indent-8 italic font-thin lowercase  text-justify opacity-90" id="joke">Radio Vallonne was asked whether the First President of the Cour de Cassation had suppressed a référe in the Fonds souverain inquiry. « In principle, no, » the station replied. « In practice, the référe has been in détention provisoire since Tuesday — together with its author. »</p>
        <div aria-hidden="true" className="flex items-center px-3.5 py-1">
            <div className="h-px flex-1 bg-linear-to-l from-gz-muted-foreground/60 to-transparent" />
            <div className="h-px flex-1 bg-linear-to-r from-gz-muted-foreground/60 to-transparent" />
        </div>
        <br />
    </Paper>
}
