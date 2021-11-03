export class Comment {

  constructor(
    public commentId: number,
    public postId: number,
    public userId: number,
    public description: string,
    public upvotes: number,
    public downvotes: number,
    public createdAt: Date,
  ) {}
}
