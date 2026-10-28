// ContentRenderHelper：按段渲染文章正文。
// - 行内 markdown：**粗体**、*斜体*、<u>下划线</u>
// - 段落级插图：段落以 img::<url>::<alt> 开头时渲染为插图——保持原比例、宽度上限 900px、居中，图下衬一条 muted 斜体图注
// - 首字放大：第一个文字段落启用 drop cap（段落级插图不算）
import { Fragment, type ReactNode } from "react";

const DROP_CAP = "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.9]";

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|<u>.+?<\/u>)/g;

function renderInline(text: string): ReactNode[] {
    return text.split(INLINE_TOKEN).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("<u>") && part.endsWith("</u>")) {
            return <u key={index}>{part.slice(3, -4)}</u>;
        }
        return part;
    });
}

/** 段落级插图：img::<url>::<alt>，非插图段落返回 null */
function resolveInPassageImage(s: string): ReactNode {
    if (!s.startsWith("img::")) return null;
    const [, url, alt] = s.split("::");
    return (
        <div className="mx-auto w-full max-w-[900px]">
            <img src={url} alt={alt} className="w-full shadow" />
            <p className="w-full text-center text-gz-muted-foreground italic">{alt}</p>
        </div>
    );
}

/** 渲染单段：行内 markdown + 可选首字放大 */
function renderParagraph(s: string, dropCap = false): ReactNode {
    return <p className={dropCap ? DROP_CAP : undefined}>{renderInline(s)}</p>;
}

export default function ContentRenderHelper({ content }: { content: string[] }) {
    // 第一个文字段落启用首字放大（段落级插图不算）
    const firstTextIndex = content.findIndex((paragraph) => !paragraph.startsWith("img::"));
    return <>
        {content.map((paragraph, index) => {
            const figure = resolveInPassageImage(paragraph);
            if (figure) return <Fragment key={index}>{figure}</Fragment>;
            return <Fragment key={index}>{renderParagraph(paragraph, index === firstTextIndex)}</Fragment>;
        })}
    </>
}
