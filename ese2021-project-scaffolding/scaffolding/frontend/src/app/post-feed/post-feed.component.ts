import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Post } from '../models/post.model';

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit {

  postList: Post[] = [];

  constructor(
    public httpClient: HttpClient,
  ) { }

  ngOnInit(): void {
    this.readPosts();
  }


  // READ - Post
  readPosts(): void {
    this.httpClient.get(environment.endpointURL + "post").subscribe((posts: any) => {

      posts.forEach((post: any) => {
        this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags));
      });
    });
  }

}
