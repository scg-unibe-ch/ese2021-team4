import { Component, OnInit } from '@angular/core';
import {PostFeedComponent} from "../../post-feed/post-feed.component";
import {User} from "../../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";
import {Post} from "../../models/post.model";

@Component({
  selector: 'app-my-posts',
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.css']
})
export class MyPostsComponent extends PostFeedComponent {

  loggedIn: boolean | undefined;

  user: User | undefined;

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    super(httpClient, userService);
  }

  readPosts(): void {
    this.httpClient.get(environment.endpointURL + "post/createdBy/" + this.user?.userId).subscribe((posts: any) => {
      console.log(posts);
      posts.forEach((post: any) => {
        this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt)));
      });
    });
  }

}
