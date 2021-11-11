import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";
import {Post} from "../../models/post.model";
import {Comment} from 'src/app/models/comment.model';
import {PostFeedComponent} from "../../post-feed/post-feed.component";

@Component({
  selector: 'app-commented-posts',
  templateUrl: './commented-posts.component.html',
  styleUrls: ['./commented-posts.component.css']
})
export class CommentedPostsComponent extends PostFeedComponent {

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
      this.httpClient.get(environment.endpointURL + "comment/" + "createdBy/" + this.user?.userId).subscribe((comments: any) => {
        comments.forEach((comment: any) => {
          this.httpClient.get(environment.endpointURL + "post/" + comment.postId).subscribe((post:any) => {
            if(!this.postList.find(existingPost => existingPost.postId == post.postId)) {
              this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), []))
            }
            })
        });
        this.postsLoaded = true;
        this.selectedPosts = this.postList
      }, error => {
        console.log(error);
      });
    }
   
  }

}
