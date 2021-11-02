import { HttpClient } from '@angular/common/http';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  loggedIn: boolean | undefined;

  user: User | undefined;

  postId: number = 0;

  @Input()
  post: Post = new Post(0, '', 0, '', 0, '', 0, 0);

  constructor(
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      this.postId = params.id;
      console.log(this.postId)
    });

    this.httpClient.get(environment.endpointURL + "post/" + this.postId).subscribe((post: any) => {
      this.post=post
    });

    console.log('post constructor', this.user, this.loggedIn)
  }

  ngOnInit(): void {
    // Listen for changes
    this.userService.loggedIn$.subscribe(res => this.loggedIn = res);
    this.userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = this.userService.getLoggedIn();
    this.user = this.userService.getUser();

    console.log('post init', this.user, this.loggedIn)
  }

    updatePost(post: Post): void {

      this.httpClient.put(environment.endpointURL + "post/" + post.postId, {
        title: post.title,
        description: post.description,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        imageId: post.imageId
      }).subscribe();
    }

    deletePost(post: Post): void {
        this.httpClient.delete(environment.endpointURL + "post/" + post.postId).subscribe(() => {

        });
    }

    upvotePost(): void {
      this.post.upvotes += 1;
      this.updatePost(this.post);
    }

    downvotePost(): void {
    this.post.downvotes += 1;
    this.updatePost(this.post);
  }
}
