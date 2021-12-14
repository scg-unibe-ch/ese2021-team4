import {HttpClient} from '@angular/common/http';
import {Post} from 'src/app/models/post.model';
import {User} from 'src/app/models/user.model';
import {UserService} from 'src/app/services/user.service';
import {environment} from 'src/environments/environment';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Comment} from 'src/app/models/comment.model';
import {Category, CategoryFinder} from "../../models/category.model";
import {ToastrService} from "ngx-toastr";
import {ConfirmationAsker} from "../../models/confirmation-asker";
import { QuillEditorBase, QuillModules } from 'ngx-quill';
import Quill from 'quill';


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
  editMode: boolean = false;
  rows: number = 1;

  quill : Quill | undefined;
  // editor : Quill
  editorStyle = {
    // height: '100px',
    backgroundColor: "#9c9c9c"
  };

  config :QuillModules= {
    // theme: 'snow',
    toolbar: [
        ['bold', 'italic', 'underline', 'strike',{ 'header': 1 }, 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['link', 'image', 'video'], //media
        ['clean'] //clear formatting
      ],
  };

  configComment :QuillModules= {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['link'],
        ['clean'] //clear formattig
      ],
  };

  @Input()
  post: Post = new Post(0, '', 0, '', Category.Bern, 0, 0, new Date(), [], [], 0, 0, 0);
  @Input()
  preview: boolean = false;

  @Input()
  loadPicture: boolean = false;

  @Output()
  update = new EventEmitter<Post>();
  @Output()
  delete = new EventEmitter<Post>();

  selectCategory=this.post.tags.toString();
  errorMessage = "";
  showCategoryError = false;
  showDescriptionError = false;

  originURL: string = '';


  constructor(
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute,
    public toastr: ToastrService) {

    this.activatedRoute.params.subscribe(params => {
      if(!isNaN(+params.id)) {
        this.postId = +params.id;
      }
    });
    this.activatedRoute.url.subscribe(url => {
      if(url != undefined){
        this.originURL = url[0].path
      }
    });

    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res; this.checkVoteStatus();});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
  }

  onFileSelected(event : any, isOnlyImage : boolean) {
    //if isOnlyImage means it's only image upload, this is handled differently

    const files : File[] = event.target.files;
    for (let i=0; i < files.length; i++){
      const imageSpan = document.getElementById("image");
      const img = document.createElement("img");
      const oneImage = document.getElementById("oneImage");
      img.src = URL.createObjectURL(files[i]);

      if(isOnlyImage){
        this.post.images.push(files[i]);
        img.width= window.innerWidth * 0.6;
        oneImage?.appendChild(img);

        img.onload = function() {
          URL.revokeObjectURL(img.src);
        };

      } else {
        img.height = window.innerHeight * 0.7 * 0.6 - 20;

        imageSpan?.appendChild(img);

        img.onload = function() {
          URL.revokeObjectURL(img.src);
        };
        this.post.images.push(files[i]);
      }
    }
  }

  ngOnInit(): void {

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

      if (this.loadPicture){
        this.loadPicturesToPreview();
      }

    }
  }

  loadPost(): void {
    this.httpClient.get(environment.endpointURL + "post/" + this.postId).subscribe((post: any) => {
      this.post=new Post(post.postId, post.title, post.userId, post.description, post.tags, post.upvotes, post.downvotes, new Date(post.createdAt), [], new Array<File>(), post.nrOfImages, post.nrOfComments, post.flags);
      if(!this.preview){
        this.loadPicturesToPost();
        this.httpClient.get(environment.endpointURL + "comment/" + "forPost/" + this.postId).subscribe((comments: any) => {
          comments.forEach((comment: any) => {
            this.post.comments.push(new Comment(comment.commentId, comment.postId, comment.userId, comment.description, comment.upvotes, comment.downvotes, new Date(comment.createdAt)));
          });
          this.post.comments.sort((a, b) => b.createdAt.getTime()-a.createdAt.getTime())
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
    const oneImage = document.getElementById("oneImage");
    if(oneImage != undefined){
      oneImage.innerHTML = '';
    }
    this.updatePost(this.post);
    this.validDescription();
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
            const picture: File = new File([image], "uploadedImg");
            img.src = URL.createObjectURL(picture);
            if(this.post.imageOnly){
              img.width = window.innerWidth * 0.6 - 20;
            } else {
              img.height = window.innerHeight * 0.7 * 0.6 - 20;
            }
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

  loadPicturesToPreview(){
    this.httpClient.get(environment.endpointURL + "post/" + this.postId + "/getImageIds",
    {responseType: 'text', headers: {'Content-Type': 'json/application'}}).subscribe((imgIds: any) => {
      if(imgIds != ""){
        const imgIdArray :Array<String> = imgIds.split(",");

        imgIdArray.forEach(element => {
          const imageId : number = +element;
          const imageSpan = document.getElementById("imagePreview"+this.postId);

          this.httpClient.get(environment.endpointURL + "post/" + "getSingleImage/" + imageId,
           {responseType: 'blob', headers: {'Content-Type': 'multipart/formData'}}).subscribe((image: any) =>{
            const img = document.createElement("img");
            const picture: File = new File([image], "uploadedImg");
            img.src = URL.createObjectURL(picture);
            img.width = window.innerWidth * 0.7 * 0.8 - 20; //numbers come from preview width, content width
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
    if(this.validPostCreationInput()){
      this.updatePost(this.post);
      this.editMode = false;
      this.loadPost()
      }
  }

  validPostCreationInput(): boolean {
    let valid = true;
    // separate checks to make sure all methods are called
    if (this.post.title == '') {
      valid = false;
    }
    if (!this.validCategory()) {
      valid = false;
    }
    if (!this.validDescription()) {
      valid = false;
    }
    return valid;
  }

  validDescription(): boolean {
    this.showDescriptionError = false;
    if(this.post.description == null){
      this.post.description = '';
    }
    if(this.post.description == '' && this.post.images.length == 0){
      this.showDescriptionError = true;
      return false;
    }
    return true;
  }
  validCategory(): boolean {
    this.showCategoryError = false;
    if(this.findCategory() == Category.Bern){
      this.showCategoryError = true;
      return false;
    }
    return true;
  }


  findCategory(): Category{
    return CategoryFinder.findCategory(this.selectCategory)
  }

  createPost(): void {
    if(this.validPostCreationInput()){
      this.errorMessage = "";
      this.router.navigate(['/postfeed']);
    if(this.user != null){ //user might not be instantiated, this is taken care of by the html
      this.httpClient.post(environment.endpointURL + "post", {
      title: this.post.title,
      description: this.post.description,
      tags: this.findCategory(),
      userId: this.user.userId,
      upvotes: 0,
      downvotes: 0,
      nrOfImages: this.post.images.length,
      nrOfComments: 0,
      flags: 0
    }).subscribe((post: any) => {
      const formData = new FormData();
      for (let i=0; i < post.nrOfImages; i++){
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
      nrOfImages: post.images.length,
      nrOfComments: post.nrOfComments,
      flags: post.flags
    }).subscribe((post: any) => {
      const formData = new FormData();
      for (let i=0; i < this.post.images.length; i++){
        if(this.post.images[i].name != "uploadedImg"){
          formData.append("file"+i, this.post.images[i]);
        }
      }
      this.httpClient.post(environment.endpointURL + "post/" + post.postId + "/image", formData).subscribe((post: any) => {
      });
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
      this.router.navigate([this.originURL]);
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
        this.post.comments.splice(0, 0, new Comment(comment.commentId, this.post.postId, comment.userId, comment.description, 0, 0, new Date(comment.createdAt)));
        this.newCommentDescription = '';
        this.post.nrOfComments++;
        this.updatePost(this.post);
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
      this.post.nrOfComments--;
      this.updatePost(this.post);
    });
  }

  countRows(): void {
    const width = window.innerWidth * 0.9 * 0.45;
    this.rows= Math.floor(this.getTextWidth(this.post.title) / width) + 1;
  }

  getTextWidth(text : string): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context!.font = "16px roboto";
    const width = context!.measureText(text).width;
    return Math.ceil(width);
  }

  getEditorInstance(editorInstance : any) : void {
    this.quill = editorInstance;
    let toolbar = this.quill?.getModule('toolbar');
    toolbar.addHandler('image', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('multiple', '');
      input.setAttribute('accept', 'image/*');
      input.click();
      input.onchange = (e) => this.onFileSelected(e, false);
    })
  }

}
