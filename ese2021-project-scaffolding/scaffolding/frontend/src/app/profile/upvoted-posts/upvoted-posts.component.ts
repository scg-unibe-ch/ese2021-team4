import { Component, OnInit } from '@angular/core';
import {PostFeedComponent} from "../../post-feed/post-feed.component";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";
import {Post} from "../../models/post.model";

@Component({
  selector: 'app-upvoted-posts',
  templateUrl: './upvoted-posts.component.html',
  styleUrls: ['./upvoted-posts.component.css']
})
export class UpvotedPostsComponent extends PostFeedComponent {

  postsLoaded: boolean =false;

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    super(httpClient, userService);
  }

  ngOnInit(): void {
    this.readPosts();
  }

  readPosts(): void {
    if(this.user === undefined) {
      setTimeout(()=> this.readPosts(), 10);
    } else {
      this.httpClient.get(environment.endpointURL + "userpostvote/" + "votedBy/" + this.user?.userId).subscribe((votes: any) => {
        votes.forEach((vote: any) => {
          if(vote.vote == 1) {
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

}
