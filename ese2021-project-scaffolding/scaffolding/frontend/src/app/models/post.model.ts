import { Comment } from 'src/app/models/comment.model';
import { Category } from 'src/app/models/category.model';

export class Post {

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
        public flags: number,
    ) {}
  }
