import { Comment } from 'src/app/models/comment.model';
import { Category } from 'src/app/models/category.model';

export class Post {
    public neededRowspan: number;
    public timeSince: String;
    public noHtmlDescription: String;

    constructor(
        public postId: number,
        public title: string,
        public userId: number,
        public description: string,
        public tags: Category,
        public upvotes: number,
        public downvotes: number,
        public createdAt: Date,
        public comments: Comment[],
        public images: File[],
        public nrOfImages: number,
        public nrOfComments: number,
        public flags: number,
    ) {
        //calculate needed rows for displaying in post-feed
        this.timeSince = this.calculateTimeSince(this.createdAt);
        this.noHtmlDescription = this.removeTags(this.description);
        this.neededRowspan = this.calculateNeededRowspan();
    }

    calculateNeededRowspan() : number {
        var titleLines = Math.min(2, Math.ceil(this.title.length / 100));
        var descriptionLines = Math.min(2 ,Math.ceil(this.noHtmlDescription.length / 100));
        var minimumRows = 1;
        return titleLines + descriptionLines + minimumRows;
    }

    removeTags(description : String) : String {
        var result = description;
        while (result.includes("<") && result.includes(">")){
            result = result.replace(/<.*?>/, "");

        }
        return result;
    }

    calculateTimeSince(date : Date) : String {
        var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        var interval = seconds / 31536000;

        if (interval > 1) {
            return Math.floor(interval) + " years";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes";
        }
        return Math.floor(seconds) + " seconds";

    }

  }
