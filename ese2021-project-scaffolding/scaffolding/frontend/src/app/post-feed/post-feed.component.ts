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

  sortBy = '';

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

  //CREATE POST
  createPost(): void {
    if(this.user != null){ //user might not be instantiated, this is taken care of by the html
      this.httpClient.post(environment.endpointURL + "post", {
      title: this.newPostTitle,
      description: this.newPostDescription,
      tags: this.newPostTags,
      userId: this.user.userId,
      upvotes: 0,
      downvotes: 0
    }).subscribe((post: any) => {
      this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt)));
      this.newPostTitle = this.newPostDescription = this.newPostTags = '';
    },
        error => {console.log(error)})
    }

  }

  // READ - Post
  readPosts(): void {
    this.httpClient.get(environment.endpointURL + "post").subscribe((posts: any) => {

      posts.forEach((post: any) => {
        this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt)));
      });
    });
  }

  sortPosts(): void {
    switch (this.sortBy) {
      case "id": this.sortById();
        break;
      case "title": this.sortByTitle();
        break;
      case "recent": this.sortByRecentDate();
        break;
      case "oldest": this.sortByOldestDate();
        break;
      case "upvotes": this.sortByUpvotes();
        break;
      case "downvotes": this.sortByDownvotes();
        break;
      case "total": this.sortByTotalVotes();
        break;
      default: console.log('invalid sort')

    }
  }
  sortByTitle(): void {
    this.postList.sort((a, b) => a.title.localeCompare(b.title))
  }

  sortById(): void{
    this.postList.sort((a,b) => a.postId-b.postId)
  }

  sortByRecentDate(): void {
    this.postList.sort((a, b) => b.createdAt.getTime()-a.createdAt.getTime())
  }

  sortByOldestDate(): void {
    this.postList.sort((a, b) => a.createdAt.getTime()-b.createdAt.getTime())
  }

  sortByUpvotes(): void {
    this.postList.sort((a, b) => b.upvotes-a.upvotes)
  }

  sortByDownvotes(): void {
    this.postList.sort((a, b) => b.downvotes-a.downvotes)
  }

  sortByTotalVotes(): void {
    this.postList.sort((a, b) => (b.upvotes-b.downvotes)-(a.upvotes-a.downvotes))
  }

}
