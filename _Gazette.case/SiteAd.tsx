import { useState, type ComponentType } from 'react'
import { CloudySunnyIcon, FishIcon, WindyRainIcon, type IconProps } from 'tdesign-icons-react'

type SiteAdData = {
    name: string
    tagline: string
    body: string
    contact: string
    icon: ComponentType<IconProps>
}

const SITE_ADS: SiteAdData[] = [
    {
        name: 'OblakoFlare',
        tagline: 'Le nuage qui ne s’éteint jamais.',
        body: 'Your pages cached at the edge of the réseau, your requêtes scrubbed before the orage arrives. Since 1919, not one gazette has been knocked off the presses — not even during the inondation.',
        contact: 'oblak@flare.ur — offre gratuite pour les petites rédactions.',
        icon: CloudySunnyIcon,
    },
    {
        name: 'TyphoonCSS',
        tagline: 'Utility-first, comme le vent.',
        body: 'Why compose une feuille de style when fifty classes will do? Every utilitaire you will ever need — and six you will not. Le vent s’occupe du reste.',
        contact: 'pnpm add typhoon-css — documentation en français, plus ou moins.',
        icon: WindyRainIcon,
    },
    {
        name: 'DeepSearch',
        tagline: 'Demandez à l’abysse.',
        body: 'DeepSearch has read every dossier of the République — the archives, the scellés, the référés — and answers in one paragraphe, with sources. It cannot yet keep a secret; it is learning très vite.',
        contact: 'deepsearch.ur — premier mois offert, sans carte bancaire.',
        icon: FishIcon,
    },
]

/** 文章末尾的随机广告：每次挂载抽一条 */
export default function SiteAd() {
    const [index] = useState(() => Math.floor(Math.random() * SITE_ADS.length))
    const ad = SITE_ADS[index]
    const Icon = ad.icon
    return (
        <aside
            aria-label='Publicité'
            className='relative mt-8 flex cursor-pointer items-start gap-4 border border-gz-muted-foreground/40 bg-gz-secondary p-4 text-sm leading-snug select-none'
            onClick={() => alert('nothing here pas, mdr')}
        >
            <span aria-hidden='true' className='absolute right-2 top-2 text-xs font-bold tracking-widest text-gz-muted-foreground/50'>AD</span>
            <span className='mt-1 shrink-0 text-3xl text-gz-accent-foreground'>
                <Icon fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />
            </span>
            <div>
                <p className='text-lg font-bold text-gz-accent-foreground'>{ad.name}</p>
                <p className='italic'>{ad.tagline}</p>
                <p className='mt-1 text-justify'>{ad.body}</p>
                <p className='mt-1 text-gz-muted-foreground'>{ad.contact}</p>
            </div>
        </aside>
    )
}
