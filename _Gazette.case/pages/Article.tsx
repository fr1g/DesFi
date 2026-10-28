import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Paper from "../Paper";
import ContentRenderHelper from "../ContentRenderHelper";
import SiteAd from "../SiteAd";
import { Article as ArticleModel } from "../classes/Article";

export default function Article() {
    const { pid } = useParams();
    // 状态带上 pid：换文章时按 pid 自然派生，effect 里无需同步重置
    const [loaded, setLoaded] = useState<null | { pid: string; article: ArticleModel }>(null);
    const [failedPid, setFailedPid] = useState<null | string>(null);
    const article = loaded && loaded.pid === pid ? loaded.article : null;
    const failed = failedPid === pid;

    useEffect(() => {
        if (!pid) return;
        let cancelled = false;
        fetch(`/gazette/${pid}.json`).then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (cancelled) return;
            // JSON 里 releaseDate 是 ISO 字符串，构造时转回 Date
            setLoaded({ pid, article: new ArticleModel(data.id, data.title, new Date(data.releaseDate), data.content, data.views, data.author) });
        }).catch((res) => {
            if (cancelled) return;
            console.error(res);
            setFailedPid(pid);
        });
        return () => {
            cancelled = true;
        };
    }, [pid]);

    return <>{
        article ? (
            <Paper title={article.title as string}>
                <article>
                    <p className="mt-3 text-sm text-gz-muted-foreground">
                        {article.author} /
                        <span> {article.releaseDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span> /
                        <span className="font-bold"> {article.views.toLocaleString("fr-FR")} vues</span>
                    </p>
                    <div className="mt-8 space-y-5">
                        <ContentRenderHelper content={article.content} />
                    </div>
                    <SiteAd key={article.id} />
                </article>
            </Paper>

        ) : (
            <p className="text-gz-muted-foreground">{failed ? "Article introuvable." : "Chargement…"}</p>
        )
    }</>
}
