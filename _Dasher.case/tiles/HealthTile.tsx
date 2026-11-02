import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import Tile from './Tile'

const ALERTS = [
    {
        id: 'pasta',
        title: '意大利面未能搅拌42号混凝土',
        level: '中等',
        date: new Date(1919, 7, 10, 9, 12, 37),
    },
    {
        id: 'turkey',
        title: '火鸡试图穿越巴士海峡',
        level: '轻微',
        date: new Date(1919, 7, 10, 10, 3, 12),
    },
    {
        id: 'hotpot',
        title: 'Deepseek没能吃到优惠红烧肉',
        level: '未知',
        date: new Date(1919, 7, 10, 10, 47, 5),
    },
]

const formatDateTime = (value: Date) => {
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
}

const ACTION_STYLE = { '--dsh-card-actions-height': '3.5rem' } as CSSProperties

export default function HealthTile({ compact = false }: { compact?: boolean }) {
    return (
        <Tile
            title="综合健康"
            className="dsh-tile-actions"
            measureId="health"
            style={ACTION_STYLE}
            status="warning"
        >
            <div className="flex items-start justify-between gap-4">
                <p className="text-dsh-text">
                    <span className="text-5xl font-semibold group-hover:text-dsh-success">89</span>
                    <span className="text-sm font-thin text-dsh-text-secondary">分</span>
                </p>
                <div>
                    <p className="text-dsh-text group-hover:text-dsh-warning">
                        需要关注 (2项问题){' '}
                        <button type="button" className="dsh-link-button">
                            查看
                        </button>
                    </p>
                    <p className="text-sm font-thin text-dsh-text-secondary">
                        上次检查：1919-8-10 11:45:14
                    </p>
                </div>
            </div>

            <h3 className="mt-4 text-base font-semibold text-dsh-text-title">最近告警</h3>

            <div className="mt-2 flex min-h-0 flex-1 gap-2">
                <div className="flex flex-col items-center p-4 scale-110">
                    <p className="text-xl font-semibold text-dsh-text">3</p>
                    <p className="text-sm font-thin text-dsh-text-secondary text-center">告警</p>
                </div>
                <span aria-hidden="true" className="dsh-divider-v" />
                <div className="grow">
                    <ul className="m-0 list-none p-0">
                        {ALERTS.map((alert, index) => (
                            <Fragment key={alert.id}>
                                <li
                                    className={
                                        compact
                                            ? 'flex w-full flex-col items-end gap-1 text-right'
                                            : 'flex w-full items-baseline gap-2'
                                    }
                                >
                                    <span
                                        className={
                                            compact
                                                ? 'block w-full text-right text-dsh-text'
                                                : 'text-dsh-text'
                                        }
                                    >
                                        {alert.title}
                                    </span>
                                    {!compact && (
                                        <span
                                            aria-hidden="true"
                                            className="min-w-4 grow border-b border-dotted border-dsh-text-secondary/40"
                                        />
                                    )}
                                    <span
                                        className={
                                            compact
                                                ? 'block w-full text-right text-sm'
                                                : 'flex shrink-0 items-center gap-2 text-sm'
                                        }
                                    >
                                        <span className="font-normal text-dsh-text-secondary">
                                            {formatDateTime(alert.date)}
                                        </span>
                                        <span
                                            className={
                                                alert.level === '中等'
                                                    ? 'font-thin text-dsh-text-secondary group-hover:text-dsh-warning'
                                                    : 'font-thin text-dsh-text-secondary'
                                            }
                                        >
                                            程度：{alert.level}
                                        </span>
                                    </span>
                                </li>
                                {compact && index < ALERTS.length - 1 && (
                                    <li aria-hidden="true" className="py-1">
                                        <span className="mx-auto block w-16 border-t border-dsh-text-secondary/40" />
                                    </li>
                                )}
                            </Fragment>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-10 flex justify-end">
                <button type="button" className="bg-stone-400/20 p-4 text-dsh-text">
                    刷新
                </button>
            </div>
        </Tile>
    )
}
