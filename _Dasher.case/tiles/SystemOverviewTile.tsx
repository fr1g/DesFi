import { CURRENT_USER } from '../mockUser'
import systemOverviewRouter from '../system-overview-router.svg'
import Tile from './Tile'

type SystemInfoItem = {
    id: string
    label: string
    value: string
    placeholder?: boolean
    extra?: string
}

const SYSTEM_INFO: SystemInfoItem[] = [
    { id: 'model-top', label: '设备型号', value: '- -', placeholder: true },
    { id: 'uptime', label: '运行时间', value: '3天 15时' },
    { id: 'version', label: '系统版本', value: '8.10' },
    { id: 'clock', label: '当前时间', value: '1919-8-10 11:45:14' },
    {
        id: 'user',
        label: '当前用户',
        value: `${CURRENT_USER.name}`,
        extra: CURRENT_USER.role
    },
]

export default function SystemOverviewTile() {
    return (
        <Tile title="系统概览" measureId="system">
            <div className="flex w-full items-center gap-4 justify-around px-2">
                <img
                    src={systemOverviewRouter}
                    alt=""
                    aria-hidden="true"
                    className="size-18 p-1 -translate-y-1 shrink-0 object-contain"
                />
                <div className='w-px bg-stone-300/10 my-auto h-2/3'></div>
                <ul className="m-0 list-none p-0 text-dsh-text grow">
                    {SYSTEM_INFO.map((item) => (
                        <li key={item.id}>
                            {item.label}：
                            {item.placeholder ? (
                                <span className="text-dsh-text-disabled">{item.value}</span>

                            ) : (
                                item.value
                            )}
                            {item.extra && <span className='inline-block text-xs/2 text-end px-1 text-dsh-text-secondary/90'>
                                {item.extra}
                            </span>}
                        </li>
                    ))}
                </ul>
            </div>
        </Tile>
    )
}
