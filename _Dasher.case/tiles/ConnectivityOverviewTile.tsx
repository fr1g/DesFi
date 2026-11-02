import { Fragment } from 'react'
import Tile from './Tile'

const OVERVIEW = [
    { id: 'ap', label: '下联 AP', value: '0', detail: '在线 0 · 离线 0' },
    { id: 'terminals', label: '下联终端', value: '1', detail: '无线 0 · 有线 1' },
    { id: 'connections', label: '连接数', value: '72', detail: 'TCP 68 · UDP 3 · ICMP 1' },
]

export default function ConnectivityOverviewTile() {
    return (
        <Tile title="连接总览" measureId="connectivity">
            <ul className="m-0 flex list-none flex-col p-0">
                {OVERVIEW.map((item, index) => (
                    <Fragment key={item.id}>
                        <li className="flex items-baseline justify-between gap-4">
                            <div className="flex flex-col">
                                <p className="text-xl font-semibold text-dsh-text">{item.value}</p>
                                <p className="text-sm font-thin text-dsh-text-secondary">
                                    {item.label}
                                </p>
                            </div>
                            <p className="text-right text-sm font-thin text-dsh-text-secondary">
                                {item.detail}
                            </p>
                        </li>
                        {index < OVERVIEW.length - 1 && (
                            <li aria-hidden="true" className="py-2">
                                <span className="mx-auto block w-16 border-t border-dsh-text-secondary/40" />
                            </li>
                        )}
                    </Fragment>
                ))}
            </ul>
        </Tile>
    )
}
