import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Post } from '../models/post.model';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit {

  postList: Post[] = [];
  newPostTitle = '';
  newPostDescription = '';
  newPostTags = '';

  loggedIn: boolean | undefined;

  user: User | undefined;

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
   }

  ngOnInit(): void {
    this.readPosts();
  }

  // CREATE - Post
  createPost(): void {
    if(this.user != null){ //user might not be instantiated, this is taken care of by the html
      this.httpClient.post(environment.endpointURL + "post", {
      title: this.newPostTitle,
      description: this.newPostDescription,
      tags: this.newPostTags,
      userId: this.user.userId,
    }).subscribe((post: any) => {
      this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags));
      this.newPostTitle = this.newPostDescription = this.newPostTags = '';
    })}

  }

  // READ - Post
  readPosts(): void {
    this.httpClient.get(environment.endpointURL + "post").subscribe((posts: any) => {

      posts.forEach((post: any) => {
        this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags));
      });
    });
  }

  // UPDATE - Post
  updatePost(post: Post): void {
    this.httpClient.put(environment.endpointURL + "post/" + post.postId, {
      postId: post.postId
    }).subscribe();
  }
  // DELETE - Post
  deletePost(post: Post): void {

    if(post.userId == this.user?.userId){ //makes sure only the author is allowed to delete a post
      this.httpClient.delete(environment.endpointURL + "post/" + post.postId).subscribe(() => {
      this.postList.splice(this.postList.indexOf(post), 1);
    });
  }

  }

  openPost(post: Post): void {

  }
}
