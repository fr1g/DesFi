// Paper：页面主标题。两种标题走两套收缩方式：
// - ReactNode 标题（Index/Article 的报头组合）：按报头尺度整体缩放到导航中槽，完整构成随缩放保留；
// - string 标题：常态 3xl 完整展示（可换行、不截断），收进导航后变为单行、以 NAV_STRING_FONT 字号在导航中槽内截断（ellipsis）。
// 有向下滚动就收缩、不干预滚动位置；接近顶部（≤4px）且向下走过一段（≥20px）时反向还原。
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

type ShrinkState = {
    pin: {
        left: number;
        top: number;
        width: number;
        height: number;
        fontSize: string;
    };
    slot: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    pad: number;
    dx: number;
    dy: number;
    scale: number;
};

const SHRINK_DURATION = 0.32;
const NAV_FIT = 40; // ReactNode 标题收进导航后的整体高度
const NAV_STRING_FONT = 30; // string 标题收进导航后的字号（5xl，正好填满 48px 导航，可调）
const TOP_ZONE = 4; // 视为"回到顶部"的位置阈值
const MIN_TRAVEL = 20; // 至少向下走过这么远，回顶才还原，避免微小抖动误触
const SINGLE_LINE = "whitespace-nowrap overflow-hidden text-ellipsis";

export default function Paper({
    children,
    title = "Gazette",
    allowMultiLine = false,
}: { children: ReactNode, title?: string | ReactNode, allowMultiLine?: boolean }) {
    const isString = typeof title === "string";
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [shrink, setShrink] = useState<ShrinkState | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const revealed = useRef(false);
    const restoringRef = useRef(false);
    const maxScroll = useRef(0);

    useEffect(() => {
        const reveal = () => {
            if (revealed.current) return;
            const el = titleRef.current;
            const slot = document.querySelector("nav .grow");
            if (!el || !slot) return;
            revealed.current = true;
            maxScroll.current = window.scrollY;

            const rect = el.getBoundingClientRect();
            const slotRect = slot.getBoundingClientRect();
            const computed = getComputedStyle(el);

            setShrink({
                pin: {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    fontSize: computed.fontSize,
                },
                slot: {
                    left: slotRect.left,
                    top: slotRect.top,
                    width: slotRect.width,
                    height: slotRect.height,
                },
                pad: parseFloat(computed.paddingTop) || 0,
                dx: slotRect.left + slotRect.width / 2 - (rect.left + rect.width / 2),
                dy: slotRect.top + slotRect.height / 2 - (rect.top + rect.height / 2),
                // ReactNode 标题按高度适配：整个构成等比缩进导航
                scale: NAV_FIT / rect.height,
            });

            // 导航栏切到主题底色的半透明磨砂（样式见案例 index.css 的 is-scrolled 规则）
            el.closest(".case-Gazette")?.classList.add("is-scrolled");
        };

        const restore = () => {
            if (!revealed.current || restoringRef.current) return;
            restoringRef.current = true;
            setRestoring(true);
            setCollapsed(false); // 占位长回去接住大标题
            titleRef.current?.closest(".case-Gazette")?.classList.remove("is-scrolled");
        };

        const onScroll = () => {
            const y = window.scrollY;
            maxScroll.current = Math.max(maxScroll.current, y);
            // 向下滚动就收缩，不必在意滚动到哪个位置
            if (y > 0 && !revealed.current) reveal();
            // 回到顶部附近、且确实向下走过一段，才还原
            if (y <= TOP_ZONE && revealed.current && maxScroll.current >= MIN_TRAVEL) restore();
        };

        // 滚轮只认向下（deltaY > 0）：收缩动作立即发生，与滚动位置无关
        const onWheel = (event: WheelEvent) => {
            if (event.deltaY > 0) reveal();
        };

        window.addEventListener("wheel", onWheel, { passive: true });
        window.addEventListener("touchmove", reveal, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        // 刷新后浏览器恢复滚动位置、不会再触发事件的情况
        if (window.scrollY > 0) reveal();

        return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchmove", reveal);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const onTitleAnimationComplete = () => {
        if (restoringRef.current) {
            // 还原完成：摘掉 fixed 回到文档流，占位同时移除（两者等高，无布局跳变）
            restoringRef.current = false;
            revealed.current = false;
            maxScroll.current = 0;
            setRestoring(false);
            setShrink(null);
            return;
        }
        // 收缩完成：只有还停在顶部附近，才收拢占位（在顶部这不是跳变，而是正文自己升上来）；
        // 已经滚远的话保持占位，反正空位在屏幕外
        if (shrink && !collapsed && window.scrollY <= 8) {
            setCollapsed(true);
        }
    };

    const morph = shrink ? { x: shrink.dx, y: shrink.dy, scale: shrink.scale } : { x: 0, y: 0, scale: 1 };

    // 标题换行策略：
    // - string：常态允许换行、完整展示；收缩后单行截断
    // - ReactNode：由 allowMultiLine 决定常态是否换行
    const wrapClass = isString
        ? (shrink && !restoring ? SINGLE_LINE : "whitespace-normal")
        : (allowMultiLine ? "whitespace-normal" : SINGLE_LINE);

    // string 标题的收缩：直接动画 left/top/width/fontSize，落点在导航中槽（单行 + ellipsis）
    const stringStyle = shrink && isString ? {
        position: "fixed" as const,
        left: shrink.pin.left,
        top: shrink.pin.top,
        width: shrink.pin.width,
        fontSize: shrink.pin.fontSize,
        margin: 0,
        pointerEvents: "none" as const,
        zIndex: 40,
        // 导航槽宽可能超过类的 max-w-[1111px]：从收缩第一帧起用内联值放开限制，宽度才能一路插值到槽宽。
        // 还原时也保留它——撤早了宽度会被类上限拍回 1111 再弹一下；还原结束、标题回到文档流的同一刻随整套内联样式一起移除。
        maxWidth: shrink.slot.width,
    } : undefined;

    // string 标题的收缩：位置走 transform 的 x/y —— left/top 一旦在还原后被清空成 auto，
    // motion 会把它俩当离散属性（整段不动、结束时跳过去），导致文字在飞行途中被宽度推偏；
    // x/y 恒为数值，任何一圈都连续。宽度本身是 px 数值，照旧直接插值到导航中槽。
    const stringAnimate = shrink && isString
        ? (restoring
            ? { x: 0, y: 0, width: shrink.pin.width }
            : {
                x: shrink.slot.left - shrink.pin.left,
                y: shrink.slot.top + (shrink.slot.height - NAV_STRING_FONT) / 2 - shrink.pad - shrink.pin.top,
                width: shrink.slot.width,
            })
        : undefined;

    return <div className="min-h-screen">
        <motion.h1
            ref={titleRef}
            className={
                "text-center w-fit max-w-[1111px] select-none mx-auto z-10 leading-none p-3.5 " +
                (isString ? "text-3xl font-bold " : "text-[min(15vw,190px)] ") +
                wrapClass
            }
            style={shrink && !isString ? {
                position: "fixed",
                left: shrink.pin.left,
                top: shrink.pin.top,
                width: shrink.pin.width,
                height: shrink.pin.height,
                fontSize: shrink.pin.fontSize,
                margin: 0,
                pointerEvents: "none",
                zIndex: 40,
            } : stringStyle}
            animate={isString ? (stringAnimate ?? {}) : (shrink && !restoring ? morph : { x: 0, y: 0, scale: 1 })}
            transition={{ duration: SHRINK_DURATION, ease: "easeInOut" }}
            onAnimationComplete={onTitleAnimationComplete}
        >{title}</motion.h1>
        {/* 标题脱离文档流后，用等高占位承接空间；仅在顶部时收拢（正文升上来），滚远了保留占位 */}
        {shrink && (
            <motion.div
                aria-hidden="true"
                initial={{ height: shrink.pin.height }}
                animate={{ height: collapsed ? 0 : shrink.pin.height }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
        )}
        {/* 标题与正文之间的分割线：从中间向两边渐隐，正中留一个 G */}
        <div aria-hidden="true" className="flex items-center gap-3 px-3.5 py-1">
            <div className="h-px flex-1 bg-linear-to-l from-gz-muted-foreground/60 to-transparent" />
            <span className="text-xl leading-none text-gz-muted-foreground">G</span>
            <div className="h-px flex-1 bg-linear-to-r from-gz-muted-foreground/60 to-transparent" />
        </div>
        <div className="p-3.5 text-lg">
            {children}
        </div>
    </div>
}
