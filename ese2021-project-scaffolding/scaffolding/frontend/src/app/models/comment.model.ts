export class Comment {

  public timeSince: String;

  constructor(
    public commentId: number,
    public postId: number,
    public userId: number,
    public description: string,
    public upvotes: number,
    public downvotes: number,
    public createdAt: Date,
  ) {
    this.timeSince = this.calculateTimeSince(this.createdAt);

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
