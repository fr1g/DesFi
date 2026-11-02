import { useEffect, useMemo, useState } from 'react'
import type { RefObject } from 'react'
import { debounce } from 'es-toolkit'
import { SearchIcon } from 'tdesign-icons-react'

type SearchProps = {
    inputRef: RefObject<HTMLInputElement | null>
}

export default function Search({ inputRef }: SearchProps) {
    const [value, setValue] = useState('')
    const [query, setQuery] = useState('')
    const settle = useMemo(
        () =>
            debounce((next: string) => {
                setQuery(next)
            }, 300),
        [],
    )

    useEffect(() => () => settle.cancel(), [settle])

    const hasQuery = query.trim().length > 0

    return (
        <div className="relative px-2 pt-2">
            <div className="flex h-12 items-center gap-2 border border-dsh-hairline bg-dsh-surface-2 px-3 transition focus-within:ring-2 focus-within:ring-stone-300/40 focus-within:ring-offset-2 focus-within:ring-offset-dsh-surface-2">
                <SearchIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 text-dsh-text-secondary"
                    fillColor="transparent"
                    strokeColor="currentColor"
                    strokeWidth={2}
                />
                <input
                    ref={inputRef}
                    type="search"
                    value={value}
                    aria-label="搜索"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="搜索"
                    className="min-w-0 flex-1 bg-transparent text-base text-dsh-text placeholder:text-dsh-text-secondary focus:outline-none"
                    onChange={(event) => {
                        const next = event.currentTarget.value
                        setValue(next)
                        settle(next)
                    }}
                />
            </div>

            {hasQuery && (
                <div
                    role="status"
                    aria-live="polite"
                    className="absolute inset-x-2 top-full z-10 mt-1 border border-dsh-hairline bg-dsh-surface-0 px-3 py-2 text-sm font-thin text-dsh-text-secondary"
                >
                    无结果
                </div>
            )}
        </div>
    )
}
