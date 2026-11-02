import { UserCircleIcon } from 'tdesign-icons-react'
import { motion } from 'motion/react'
import { CURRENT_USER } from './mockUser'

const DETAILS = [
    { label: '用户名', value: CURRENT_USER.name },
    { label: '角色', value: CURRENT_USER.role },
    { label: '所属组织', value: CURRENT_USER.organization },
    { label: '邮箱', value: CURRENT_USER.email },
    { label: '上次登录', value: CURRENT_USER.lastLogin },
    { label: '登录 IP', value: CURRENT_USER.loginIp },
    { label: '状态', value: CURRENT_USER.status },
]

export default function UserPanel({ expanded }: { expanded: boolean }) {
    return (
        <motion.div
            className="min-h-0 flex-1 overflow-y-auto px-4 pt-6"
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            aria-hidden={!expanded}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <UserCircleIcon
                    aria-hidden="true"
                    className="size-14 text-dsh-text-secondary"
                    fillColor="transparent"
                    strokeColor="currentColor"
                    strokeWidth={2}
                />
                <p className="text-xl font-semibold text-dsh-text-title">{CURRENT_USER.name}</p>
                <p className="text-sm font-thin text-dsh-text-secondary">{CURRENT_USER.role}</p>
            </div>

            <dl className="mt-6 flex flex-col gap-4 text-sm">
                {DETAILS.map((item) => (
                    <div key={item.label} className="flex items-baseline justify-between gap-4">
                        <dt className="shrink-0 font-thin text-dsh-text-secondary">{item.label}</dt>
                        <dd className="min-w-0 break-all text-right text-dsh-text">{item.value}</dd>
                    </div>
                ))}
            </dl>
        </motion.div>
    )
}
