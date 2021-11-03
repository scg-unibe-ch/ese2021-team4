import { HttpClient } from '@angular/common/http';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit, Input} from '@angular/core';
import {  ActivatedRoute} from "@angular/router";
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';




@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  loggedIn: boolean | undefined;

  user: User | undefined;

  postId: number = 0;

  existsInBackend : boolean;
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
  post: Post = new Post(0, '', 0, '', 0, '', 0, 0, new Date());

  constructor(
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      this.postId = +params.id;
      console.log(this.postId);
    });
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();

    // if this.postId === -1, this means we are in editor mode and are looking to create a new post
    if (this.postId === -1){
      this.editMode = true;
      this.existsInBackend = false;
    } else {
      this.existsInBackend = true;
      this.editMode = false;
      this.httpClient.get(environment.endpointURL + "post/" + this.postId).subscribe((post: any) => {
        this.post=post
      });
    }
    
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      signature: [ '', Validators.required]
    });
  }

  onChange(event : any) {
    console.log('changed');
  }

  onBlur(event : any) {
    console.log('blur ' + event);
  }

  save(){
    this.updatePost(this.post);
  }

  createPost(): void {
    if(this.user != null){ //user might not be instantiated, this is taken care of by the html
      this.httpClient.post(environment.endpointURL + "post", {
      title: this.post.title,
      description: this.post.description,
      tags: this.post.tags,
      userId: this.user.userId,
      upvotes: 0,
      downvotes: 0
    }).subscribe((post: any) => {
      // this.postList.push(new Post(post.postId, post.title, post.userId, post.description, post.imageId, post.tags, post.upvotes, post.downvotes));
      // this.title = this.newPostDescription = this.newPostTags = '';
    },
        error => {console.log(error)})
    }
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
     
    if(this.user?.userId == post.userId || this.user?.isAdmin){
      this.httpClient.delete(environment.endpointURL + "post/" + post.postId).subscribe(() => {});
    }
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
