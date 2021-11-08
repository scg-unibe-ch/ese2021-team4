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

  postsLoaded: boolean = false;

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    super(httpClient, userService);
  }

  ngOnInit(): void {
    setTimeout(() => this.readPosts(), 100);
  }

  readPosts(): void {
    this.httpClient.get(environment.endpointURL + "post/" + "createdBy/" + this.user?.userId).subscribe((posts: any) => {
      posts.forEach((post: any) => {
        this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), []));
      });
      this.postsLoaded = true;
      this.selectedPosts = this.postList
    });
  }

}
