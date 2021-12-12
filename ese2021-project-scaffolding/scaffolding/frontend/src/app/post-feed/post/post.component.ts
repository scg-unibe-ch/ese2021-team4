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
import {ToastrService} from "ngx-toastr";
import {ConfirmationAsker} from "../../models/confirmation-asker";


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
  authorName: string | undefined;
  hasUpvoted: boolean = false;
  hasDownvoted: boolean = false;
  hasFlagged: boolean = false;

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
    outline: true,
    defaultFontName: 'Arial',
    defaultFontSize: '5',
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
        'insertImage',
        'backgroundColor',
        'textColor',
        'removeFormat',
        'customClasses',
        'insertHorizontalRule'
      ]
    ]
  };

  @Input()
  post: Post = new Post(0, '', 0, '', Category.Bern, 0, 0, new Date(), [], [], 0);
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
    private activatedRoute: ActivatedRoute,
    public toastr: ToastrService) {

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

  onFileSelected(event : any) {

    const files : File[] = event.target.files;

    for (let i=0; i < files.length; i++){
      const imageSpan = document.getElementById("image");
      const img = document.createElement("img");
      img.src = URL.createObjectURL(files[i]);
      img.height = 60;

      img.onload = function() {
        URL.revokeObjectURL(img.src);
      };
      this.post.images.push(files[i]);
      imageSpan?.appendChild(img);

    }
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
      this.loadPost();
      this.checkVoteStatus();
    }
  }

  loadPost(): void {
    this.httpClient.get(environment.endpointURL + "post/" + this.postId).subscribe((post: any) => {
      this.post=new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], new Array<File>(), post.flags);
      if(!this.preview){
        this.loadPicturesToPost();
        this.httpClient.get(environment.endpointURL + "comment/" + "forPost/" + this.postId).subscribe((comments: any) => {
          comments.forEach((comment: any) => {
            this.post.comments.push(new Comment(comment.commentId, comment.postId, comment.userId, comment.description, comment.upvotes, comment.downvotes, new Date(comment.createdAt)));
          });
        });
      }
      this.httpClient.get(environment.endpointURL + "user/" + post.userId).subscribe((user: any) => {
        this.authorName = user.userName;
      });
      this.selectCategory=this.post.tags.toString();
    });
  }

  checkVoteStatus() {
    if (this.user != undefined){
      this.httpClient.get(environment.endpointURL + "userpostvote/" + this.user?.userId + "/" + this.postId)
        .subscribe((userPostVote: any) => {
          if(userPostVote !== null) {
            if (userPostVote.vote == 1) {
              this.hasUpvoted = true;
            } else if (userPostVote.vote == -1) {
              this.hasDownvoted = true;
            }
            if (userPostVote.flag == 1) {
              this.hasFlagged = true;
            }
          }
        });
    }
  }

  deleteImages() {
    this.httpClient.get(environment.endpointURL + "post/" + this.postId + "/getImageIds",
    {responseType: 'text', headers: {'Content-Type': 'json/application'}}).subscribe((imgIds: any) => {

      if(imgIds != ""){
        const imgIdArray :Array<String> = imgIds.split(",");
        imgIdArray.forEach(element => {
          const imageId : number = +element;
          this.httpClient.delete(environment.endpointURL + "post/images/" + imageId).subscribe((deleted:any) => {});
        });
      }
    });
    this.post.images = new Array<File>();
    const ImgSpan = document.getElementById("image");
    if(ImgSpan != undefined){
      ImgSpan.innerHTML = '';
    }
  }

  loadPicturesToPost(){
    this.httpClient.get(environment.endpointURL + "post/" + this.postId + "/getImageIds",
    {responseType: 'text', headers: {'Content-Type': 'json/application'}}).subscribe((imgIds: any) => {

      if(imgIds != ""){
        const imgIdArray :Array<String> = imgIds.split(",");
        const imageSpan = document.getElementById("image");

        imgIdArray.forEach(element => {
          const imageId : number = +element;
          this.httpClient.get(environment.endpointURL + "post/" + "getSingleImage/" + imageId,
           {responseType: 'blob', headers: {'Content-Type': 'multipart/formData'}}).subscribe((image: any) =>{
            const img = document.createElement("img");
            const picture: File = new File([image], "test");
            img.src = URL.createObjectURL(picture);
            img.height = 200;
            this.post.images.push(picture);
            img.onload = function() {
              URL.revokeObjectURL(img.src);
            };
            imageSpan?.appendChild(img);
           });
        });
      }
    });
  }

  save(){
    if (this.post.title==''){
      document.getElementById('setTitle')!.style.visibility='visible';
    }
    else if (this.findCategory()==Category.Bern){
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='visible';
    }
    else if(this.post.images.length == 0 && this.post.description == '') {
      document.getElementById('setTitle')!.style.visibility = 'hidden';
      document.getElementById('setCategory')!.style.visibility = 'hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'visible';
    }
    else {
      document.getElementById('setTitle')!.style.visibility = 'hidden';
      document.getElementById('setCategory')!.style.visibility = 'hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'hidden';
    this.router.navigate(['/postfeed']);
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
    else if(this.post.images.length == 0 && this.post.description == '') {
      document.getElementById('setTitle')!.style.visibility = 'hidden';
      document.getElementById('setCategory')!.style.visibility = 'hidden';
      document.getElementById('setDescriptionOrImage')!.style.visibility = 'visible';
    }
    else {
      this.router.navigate(['/postfeed']);
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
      downvotes: 0,
      flags: 0
    }).subscribe((post: any) => {
      const formData = new FormData();
      for (let i=0; i < this.post.images.length; i++){
        formData.append("file"+i, this.post.images[i]);
      }
      this.httpClient.post(environment.endpointURL + "post/" + post.postId + "/image", formData).subscribe((post: any) => {
      });
    }, error => {console.log(error)});

    }
  }}

  updatePost(post: Post): void {
    this.httpClient.put(environment.endpointURL + "post/" + post.postId, {
      title: post.title,
      description: post.description,
      tags: this.findCategory(),
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      flags: post.flags
    }).subscribe((post: any) => {
      const formData = new FormData();
      for (let i=0; i < this.post.images.length; i++){
        formData.append("file"+i, this.post.images[i]);
      }
      this.httpClient.post(environment.endpointURL + "post/" + post.postId + "/image", formData).subscribe((post: any) => {});
      this.update.emit(this.post);
    }, error => {console.log(error)});
  }

  confirmDeleting(post: Post): void{
    ConfirmationAsker.confirm('Are you sure you want to delete this post?')
      .then(confirmed => {
        if(confirmed){
          this.deletePost(post);
        }
      })
  }

  deletePost(post: Post): void {
    if(this.user?.userId == post.userId || this.user?.isAdmin){
      this.httpClient.delete(environment.endpointURL + "post/" + post.postId).subscribe(() => {});
      this.router.navigate(['/postfeed']);
    }
  }

  confirmFlagging(): void{
    ConfirmationAsker.confirm('Are you sure you want to report this post? This cannot be undone.')
      .then(confirmed => {
        if(confirmed){
          this.flagPost();
        }
      })
  }

  confirmUnflagging(): void{
    ConfirmationAsker.confirm('Are you sure you want to remove all flags from this post?')
      .then(confirmed => {
        if(confirmed){
          this.unflagPost();
        }
      })
  }

  votePost(param: number): void {
    if (!this.hasDownvoted && !this.hasUpvoted) {
      if (!this.hasFlagged) {
        // create new userpostvote entry
        this.httpClient.post(environment.endpointURL + "userpostvote", {
          userId: this.user?.userId,
          postId: this.post.postId,
          vote: param
        })
          .subscribe((vote: any) => {
            this.setVote(param);
            }, error => {
            console.log(error);
          });
      }
      else {
        // update existing userpostvote entry
        this.httpClient.put(environment.endpointURL + "userpostvote/" + this.user?.userId + "/" + this.postId, {
          userId: this.user?.userId,
          postId: this.post.postId,
          vote: param
        })
          .subscribe((vote: any) => {
            this.setVote(param);
            }, error => {
            console.log(error);
          });
      }
    }
    else if (!this.hasFlagged) {
      this.httpClient.delete(environment.endpointURL + "userpostvote/single/" + this.user?.userId + "/" + this.postId).subscribe(() => {
        this.removeVote(param);
      });
    }
    else {
      this.httpClient.put(environment.endpointURL + "userpostvote/" + this.user?.userId + "/" + this.postId, {
        userId: this.user?.userId,
        postId: this.post.postId,
        vote: null
      })
        .subscribe((vote: any) => {
          this.removeVote(param);
          }, error => {
          console.log(error);
        });
    }
  }

  setVote(param: number): void {
    if (param == 1) {
      this.post.upvotes += 1;
      this.hasUpvoted = true;
    }
    else {
      this.post.downvotes += 1;
      this.hasDownvoted = true;
    }
    this.updatePost(this.post);
    this.checkVoteStatus();
  }

  removeVote(param: number): void {
    if (param == 1) {
      this.post.upvotes = this.post.upvotes - 1;
      this.hasUpvoted = false;
    }
    else {
      this.post.downvotes = this.post.downvotes -1;
      this.hasDownvoted = false;
    }
    this.updatePost(this.post);
    this.checkVoteStatus();
  }


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

  flagPost(): void {
    if(this.hasUpvoted || this.hasDownvoted){
      this.httpClient.put(environment.endpointURL + "userpostvote/" + this.user?.userId + "/" + this.postId, {
        userId: this.user?.userId,
        postId: this.post.postId,
        flag: 1
      }).subscribe(() => {
        this.post.flags += 1;
        this.updatePost(this.post);
        this.toastr.success("This post has been flagged for review.", "", {
          timeOut: 2500
        });
        this.checkVoteStatus();
      })
    }
    else {
      this.httpClient.post(environment.endpointURL + "userpostvote/", {
        userId: this.user?.userId,
        postId: this.post.postId,
        flag: 1
      }).subscribe(() => {
        this.post.flags += 1;
        this.updatePost(this.post);
        this.toastr.success("This post has been flagged for review.", "", {
          timeOut: 2500
        });
        this.checkVoteStatus();
      })
    }
  }

  unflagPost(): void {
    this.httpClient.delete(environment.endpointURL + "userpostvote/unflag/" + this.post.postId)
      .subscribe(() => {
        this.post.flags = 0;
        this.httpClient.put(environment.endpointURL + "post/" + this.post.postId, {
          flags: 0
        })
          .subscribe(() => {
              this.toastr.success("The flag count has been reset.", "", {
                timeOut: 2500
              });
              this.checkVoteStatus();
            }
          )}, error => console.log(error));
  }

  deleteComment(comment: Comment): void {
    this.httpClient.delete(environment.endpointURL + "comment/" + comment.commentId).subscribe(() => {
      this.post.comments.splice(this.post.comments.indexOf(comment), 1);
    });
  }

  auto_grow(element : any) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

  textAreaAdjust(element : any) {
  element.style.height = "1px";
  element.style.height = (25+element.scrollHeight)+"px";
}

}
