import {HttpClient} from '@angular/common/http';
import {Post} from 'src/app/models/post.model';
import {User} from 'src/app/models/user.model';
import {UserService} from 'src/app/services/user.service';
import {environment} from 'src/environments/environment';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AngularEditorConfig} from '@kolkov/angular-editor';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Comment} from 'src/app/models/comment.model';
import {Category, CategoryFinder} from "../../models/category.model";


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  loggedIn: boolean | undefined;

  user: User | undefined;

  newCommentDescription: string = '';

  @Input()
  postId: number = 0;
  createdAtString: string | undefined;
  authorName: string | undefined;
  hasUpvoted: boolean = false;
  hasDownvoted: boolean = false;

  existsInBackend : boolean = true;
  form: FormGroup = new FormGroup({});
  editMode: boolean = false;

  config1: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    sanitize: false,
    // toolbarPosition: 'top',
    outline: true,
    defaultFontName: 'Arial',
    defaultFontSize: '5',
    // showToolbar: false,
    defaultParagraphSeparator: 'p',
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    toolbarHiddenButtons: [
      [
      'undo',
      'redo',
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull',
      ],
      [
        'insertVideo',
        'backgroundColor',
        'textColor',
        'removeFormat',
        'customClasses',
        'insertHorizontalRule'
      ]
    ]




  };

  @Input()
  post: Post = new Post(0, '', 0, '', 0, Category.Bern, 0, 0, new Date(), []);
  @Input()
  preview: boolean = false;

  @Output()
  update = new EventEmitter<Post>();

  @Output()
  delete = new EventEmitter<Post>();

  selectCategory=this.post.tags.toString();


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      if(!isNaN(+params.id)) {
        this.postId = +params.id;
      }
    });
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res; this.checkVoteStatus();});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();

  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      signature: [ '', Validators.required]
    });


    // if this.postId === -1, this means we are in editor mode and are looking to create a new post
    if (this.postId === -1){
      this.editMode = true;
      this.existsInBackend = false;
      this.selectCategory=this.post.tags.toString();
    } else {
      this.existsInBackend = true;
      this.editMode = false;

      this.httpClient.get(environment.endpointURL + "post/" + this.postId).subscribe((post: any) => {
        this.post=new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), []);
        this.httpClient.get(environment.endpointURL + "comment/" + "forPost/" + this.postId).subscribe((comments: any) => {
          comments.forEach((comment: any) => {
            this.post.comments.push(new Comment(comment.commentId, comment.postId, comment.userId, comment.description, comment.upvotes, comment.downvotes, new Date(comment.createdAt)));
          });
        });
        this.httpClient.get(environment.endpointURL + "user/" + post.userId).subscribe((user: any) => {
          this.authorName = user.userName;
        });

        this.selectCategory=this.post.tags.toString();
      });
      this.checkVoteStatus();
      this.createdAtString = this.post.createdAt.toDateString();
    }
  }

  checkVoteStatus() {
  if (this.loggedIn == true){
      this.httpClient.get(environment.endpointURL + "userpostvote/" + this.user?.userId + "/" + this.postId).subscribe((userPostVote: any) => {
        if(userPostVote !== null) {
          if (userPostVote.vote == 1) {
            this.hasUpvoted = true;
          } else if (userPostVote.vote == -1) {
            this.hasDownvoted = true;
          }
        }
      });
    }
  }

  onChange(event : any) {
    console.log('changed');
  }

  onBlur(event : any) {
    console.log('blur ' + event);
  }

  save(){
    if (this.post.title==''){
      document.getElementById('setTitle')!.style.visibility='visible';
    }
    else if (this.findCategory()==Category.Bern){
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='visible';
    }
    else if(this.post.imageId == 0 && this.post.description == '') {
      document.getElementById('setTitle')!.style.visibility = 'hidden';
      document.getElementById('setCategory')!.style.visibility = 'hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'visible';
    }
    else{
      document.getElementById('setTitle')!.style.visibility = 'hidden';
      document.getElementById('setCategory')!.style.visibility = 'hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'hidden';
    this.router.navigate(['/home']);
    this.updatePost(this.post);
    }
  }

  findCategory(): Category{
    return CategoryFinder.findCategory(this.selectCategory)
  }

  createPost(): void {
    if (this.post.title==''){
      document.getElementById('setTitle')!.style.visibility='visible';
    }
    else if (this.findCategory()==Category.Bern){
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='visible';
    }
    else if(this.post.imageId == 0 && this.post.description == '') {
      document.getElementById('setTitle')!.style.visibility = 'hidden';
      document.getElementById('setCategory')!.style.visibility = 'hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'visible';
    }
    else {
      this.router.navigate(['/home']);
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'hidden';
    if(this.user != null){ //user might not be instantiated, this is taken care of by the html
      this.httpClient.post(environment.endpointURL + "post", {
      title: this.post.title,
      description: this.post.description,
      tags: this.findCategory(),
      userId: this.user.userId,
      upvotes: 0,
      downvotes: 0
    }).subscribe((post: any) => {
      // this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes));
      // this.title = this.newPostDescription = this.newPostTags = '';
    },
      error => {console.log(error)});

    }
  }}

  updatePost(post: Post): void {
    this.httpClient.put(environment.endpointURL + "post/" + post.postId, {
      title: post.title,
      description: post.description,
      tags: this.findCategory(),
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      imageId: post.imageId
    }).subscribe();
  }

  deletePost(post: Post): void {

    if(this.user?.userId == post.userId || this.user?.isAdmin){
      this.httpClient.delete(environment.endpointURL + "post/" + post.postId).subscribe(() => {});
    }
  }

  votePost(param: number): void {
    if(!this.hasDownvoted && !this.hasUpvoted){
      this.httpClient.post(environment.endpointURL + "userpostvote", {
        userId: this.user?.userId,
        postId: this.post.postId,
        vote: param
      }).subscribe((vote: any) => {
        if(param == 1){
          this.post.upvotes += 1;
          this.hasUpvoted = true;
        } else {
          this.post.downvotes += 1;
          this.hasDownvoted = true;
        }
        this.updatePost(this.post);
        this.checkVoteStatus();
      }, error => {
        console.log(error);
      });
    } else {
      this.httpClient.delete(environment.endpointURL + "userpostvote/" + this.user?.userId + "/" + this.postId).subscribe(()=>{
        if(param == 1){
          this.post.upvotes = this.post.upvotes - 1;
          this.hasUpvoted = false;
        } else {
          this.post.downvotes--;
          this.hasDownvoted = false;
        }
        this.updatePost(this.post);
        this.checkVoteStatus();
      });
    }
  }


  // CREATE - Comment
  createComment(): void {
    if (!(this.newCommentDescription == '')) {
      this.httpClient.post(environment.endpointURL + "comment", {
        description: this.newCommentDescription,
        postId: this.post.postId,
        userId: this.user?.userId,
        upvotes: 0,
        downvotes: 0
      }).subscribe((comment: any) => {
        this.post.comments.push(new Comment(comment.commentId, this.post.postId, comment.userId, comment.description, 0, 0, new Date(comment.createdAt)));
        this.newCommentDescription = '';
      });
    }
  }

  // UPDATE - Comment
  updateComment(comment: Comment): void {
    this.httpClient.put(environment.endpointURL + "comment/" + comment.commentId, {
      description: comment.description,
      postId: comment.postId
    }).subscribe();
  }

  // DELETE - Comment
  deleteComment(comment: Comment): void {
    this.httpClient.delete(environment.endpointURL + "comment/" + comment.commentId).subscribe(() => {
      this.post.comments.splice(this.post.comments.indexOf(comment), 1);
    });
  }
}
