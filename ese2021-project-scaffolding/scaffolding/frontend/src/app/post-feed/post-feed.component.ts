import { HttpClient } from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Post } from '../models/post.model';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import {Category, CategoryFinder} from "../models/category.model";


@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit {

  @Input()
  feedType: string = '';

  postList: Post[] = [];

  sortBy = 'recent';
  selectedCategory = '';
  selectedPosts: Post[] = [];
  postsLoaded: boolean = false;

  loggedIn: boolean | undefined;

  user: User | undefined;

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res; if(this.user != undefined)this.readPosts()});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
   }

  ngOnInit(): void {
    if(this.user != undefined || !this.loggedIn) {
      this.readPosts();
    }   
  }

  readPosts(): void {
    switch (this.feedType) {
      case 'created':
        this.readCreatedPosts();
        break;
      case 'upvoted':
        this.readVotedPosts(1);
        break;
      case 'downvoted':
        this.readVotedPosts(-1);
        break;
      case 'commented' :
        this.readCommentedPosts();
        break;
      case 'flagged':
        this.readFlaggedPosts();
        break;
      default:
        this.readAllPosts();
    }
  }

  // READ - Post
  readAllPosts(): void {
    this.httpClient.get(environment.endpointURL + "post").subscribe((posts: any) => {

      posts.forEach((post: any) => {
        this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], [], post.flags));
      });
      this.selectedPosts = this.postList;

    });
  }

  readCreatedPosts(): void {
    if(this.user != undefined) {
      this.httpClient.get(environment.endpointURL + "post/" + "createdBy/" + this.user?.userId).subscribe((posts: any) => {
        posts.forEach((post: any) => {
          this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], [], post.flags));
        });
        this.postsLoaded = true;
        this.selectedPosts = this.postList
      });
    }
  }

  readVotedPosts(dir: number) {
    if(this.user != undefined) {
      this.httpClient.get(environment.endpointURL + "userpostvote/" + "votedBy/" + this.user?.userId).subscribe((votes: any) => {
        votes.forEach((vote: any) => {
          if (vote.vote == dir) {
            this.httpClient.get(environment.endpointURL + "post/" + vote.postId).subscribe((post: any) => {
              this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], [], post.flags));
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

  readCommentedPosts() {
    if(this.user != undefined) {
      this.httpClient.get(environment.endpointURL + "comment/" + "createdBy/" + this.user?.userId).subscribe((comments: any) => {
        comments.forEach((comment: any) => {
          this.httpClient.get(environment.endpointURL + "post/" + comment.postId).subscribe((post: any) => {
            if (!this.postList.find(existingPost => existingPost.postId == post.postId)) {
              this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], [], post.flags))
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

  readFlaggedPosts(): void {
    if(this.user != undefined) {
      this.httpClient.get(environment.endpointURL + "post/flagged").subscribe((posts: any) => {
        posts.forEach((post: any) => {
          this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], [], post.flags));
        });
        this.postsLoaded = true;
        this.selectedPosts = this.postList
      });
    }
  }

  updateFeed(post: Post): void {
    if(this.feedType == 'upvoted' || this.feedType == 'downvoted'){
      // this.postList.splice(this.postList.indexOf(post), 1);
      // this.selectedPosts.splice(this.postList.indexOf(post), 1);
      this.postList = this.postList.filter(listPost => listPost.postId !== post.postId);
      this.selectedPosts = this.selectedPosts.filter(listPost => listPost.postId !== post.postId);
    }
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
      case "tags": this.sortByTags();
        break;
      case "total": this.sortByTotalVotes();
        break;
      case "flags": this.sortByFlags();
        break;
      default:
    }
  }

  selectPosts(): void {
    const tags = this.findCategory();
    if (this.selectedCategory == 'all') {
      this.selectedPosts = this.postList;
    }
    else{
      this.selectedPosts = this.postList.filter(post => post.tags == tags)
    }
  }

  findCategory(): Category{
    return CategoryFinder.findCategory(this.selectedCategory)
  }

  sortByTags():void{
    this.selectedPosts.sort((a, b) => a.tags.localeCompare(b.tags))
  }

  sortByTitle(): void {
    this.selectedPosts.sort((a, b) => a.title.localeCompare(b.title))
  }

  sortById(): void{
    this.selectedPosts.sort((a,b) => a.postId-b.postId)
  }

  sortByRecentDate(): void {
    this.selectedPosts.sort((a, b) => b.createdAt.getTime()-a.createdAt.getTime())
  }

  sortByOldestDate(): void {
    this.selectedPosts.sort((a, b) => a.createdAt.getTime()-b.createdAt.getTime())
  }

  sortByUpvotes(): void {
    this.selectedPosts.sort((a, b) => b.upvotes-a.upvotes)
  }

  sortByDownvotes(): void {
    this.selectedPosts.sort((a, b) => b.downvotes-a.downvotes)
  }

  sortByTotalVotes(): void {
    this.selectedPosts.sort((a, b) => (b.upvotes-b.downvotes)-(a.upvotes-a.downvotes))
  }

  sortByFlags(): void {
    this.selectedPosts.sort((a, b) => b.flags-a.flags)
  }

  shouldShowPostButton(): boolean {
    return this.feedType != 'flagged' && this.feedType != 'upvoted' && this.feedType != 'downvoted' && this.feedType != 'commented';
  }
}
