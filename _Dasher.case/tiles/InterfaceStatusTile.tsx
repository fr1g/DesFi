import { TvIcon } from 'tdesign-icons-react'
import Tile from './Tile'

const INTERFACES = Array.from({ length: 9 }, (_, index) => ({
    id: `eth-${index}`,
    label: 'ETH' + index,
    status: (index !== 0 && (index % 4 === 0)) ? 'error' : (index !== 0 && (index % 3 === 0) ? 'offline' : 'online')
}))

const STATS = [
    { id: 'total', value: 123, label: '数字简报' },
    { id: 'enabled', value: 123, label: '数字简报' },
    { id: 'remaining', value: 123, label: '数字简报' },
]

export default function InterfaceStatusTile() {
    return (
        <Tile title="接口状态" measureId="interface" status="warning">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(4rem,1fr))] gap-2">
                {INTERFACES.map((item) => (
                    <div key={item.id} className="flex min-w-0 flex-col items-center gap-1">
                        <TvIcon
                            className={item.status === 'online' ? '' : (item.status === 'error' ? 'group-hover:text-dsh-warning opacity-30 group-hover:opacity-100' : 'opacity-30')}
                            size={32}
                            fillColor="transparent"
                            strokeColor="currentColor"
                            strokeWidth={2}
                        />
                        <p className="text-sm text-dsh-text">{item.label}{item.status === 'error' ? '?' : ''}</p>
                    </div>
                ))}
            </div>
            <div className="mt-auto flex items-center justify-around">
                {STATS.map((stat) => (
                    <div key={stat.id} className="text-center">
                        <p className="text-xl font-semibold text-dsh-text">{stat.value}</p>
                        <p className="text-sm font-thin text-dsh-text-secondary text-center">{stat.label}</p>
                    </div>
                ))}
            </div>
        </Tile>
    )
}
