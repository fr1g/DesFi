type IconPlaceholderProps = {
    label?: string
    className?: string
}

/** 临时文字占位；后续替换为 TDesign 图标，保留 className 里的尺寸。 */
export default function IconPlaceholder({ label = '图标', className = 'size-16' }: IconPlaceholderProps) {
    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center text-xs font-thin text-dsh-text-disabled ${className}`}
        >
            {label}
        </span>
    )
}
