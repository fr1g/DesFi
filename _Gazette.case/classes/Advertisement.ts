export class AD {
    id: Date;
    title: string;
    releasedBy: string;
    content: string;
    contact: string;
    imageUrl: string;

    constructor(
        id: Date,
        title: string,
        releasedBy: string,
        content: string,
        contact: string,
        imageUrl: string
    ) {
        this.id = id
        this.title = title
        this.releasedBy = releasedBy
        this.content = content
        this.contact = contact
        this.imageUrl = imageUrl
    }
}