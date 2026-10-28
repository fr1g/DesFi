export class Article {
    id: number;
    title: string;
    releaseDate: Date;
    content: string[]; // 每个段落为一个数组元素
    views: number;
    author: string;

    constructor(
        id: number,
        title: string,
        releaseDate: Date,
        content: string[],
        views: number,
        author: string
    ) {
        this.id = id;
        this.title = title
        this.releaseDate = releaseDate
        this.content = content
        this.views = views
        this.author = author
    }
}

export class ArticlePreview extends Article {
    partialContent: string;
    isMainContent: boolean = false;
    isTodayTop: boolean = false;
    imageUrl: string | null = null; // 配图地址（可选，null 表示暂无）

    constructor(id: number,
        title: string,
        releaseDate: Date,
        views: number,
        author: string,
        partialContent: string, isMainContent: boolean = false, isTodayTop: boolean = false, imageUrl: string | null = null) {
        super(id, title, releaseDate, ["preview does not contain full content"], views, author);
        this.partialContent = partialContent;
        this.isMainContent = isMainContent;
        this.isTodayTop = isTodayTop;
        this.imageUrl = imageUrl;
    }
}