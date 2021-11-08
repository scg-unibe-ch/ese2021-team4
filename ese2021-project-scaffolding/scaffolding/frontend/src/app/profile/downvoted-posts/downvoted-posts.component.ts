import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";
import {Post} from "../../models/post.model";
import {PostFeedComponent} from "../../post-feed/post-feed.component";

@Component({
  selector: 'app-downvoted-posts',
  templateUrl: './downvoted-posts.component.html',
  styleUrls: ['./downvoted-posts.component.css']
})
export class DownvotedPostsComponent extends PostFeedComponent{

  postsLoaded: boolean =false;

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
    this.httpClient.get(environment.endpointURL + "userpostvote/" + "votedBy/" + this.user?.userId).subscribe((votes: any) => {
      votes.forEach((vote: any) => {
        if(vote.vote == -1) {
          this.httpClient.get(environment.endpointURL + "post/" + vote.postId).subscribe((post:any) => {
            this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), []));
          })
        }
      });
      this.postsLoaded = true;
      this.selectedPosts = this.postList
    }, error => {
      console.log(error);
    });
  }

}
