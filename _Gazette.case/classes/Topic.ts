export class Topic {
    uniqueName: string;
    describe: string;
    useHero: string | null; // 专题大图
    articles: number[]; // 文章ID
    title: string | null; // 专题在页面上展示的大标题，缺省时回退到 uniqueName

    constructor(
        uniqueName: string,
        describe: string,
        useHero: string | null, // 专题大图
        articles: number[], // 文章ID
        title: string | null = null
    ) {
        this.uniqueName = uniqueName
        this.describe = describe
        this.useHero = useHero
        this.articles = articles
        this.title = title
    }
}
