import Tile from './Tile'

const EVENT = {
    count: 1,
    title: 'BGP 邻居 10.20.0.1 已断开',
    impact: '影响 WAN2 / 2 条专线',
    duration: '持续 00:07:42',
}

export default function CriticalEventsTile() {
    return (
        <Tile title="严重事件" status="danger" measureId="critical">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <p className="flex shrink-0 items-baseline gap-1">
                    <span className="text-3xl font-semibold text-dsh-error">{EVENT.count}</span>
                    <span className="text-sm font-thin text-dsh-text-secondary">个严重事件</span>
                </p>
                <div className="min-w-0 flex-1">
                    <p className="text-dsh-error">{EVENT.title}</p>
                    <p className="mt-1 text-sm font-thin text-dsh-text-secondary">
                        {EVENT.impact} · {EVENT.duration}
                    </p>
                </div>
                <button type="button" className="dsh-link-button shrink-0 text-sm">
                    查看影响
                </button>
            </div>
        </Tile>
    )
}
