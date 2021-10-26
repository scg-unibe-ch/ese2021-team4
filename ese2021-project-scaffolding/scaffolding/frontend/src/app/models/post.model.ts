export class Post {

    constructor(
        public postId: number,
        public title: string,
        public userId: number,
        public description: string,
        public imageId: number,
        public tags: string,
        public upvotes: number,
        public downvotes: number,
    ) {}
  }
