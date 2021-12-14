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
        img.height = 60;

        imageSpan?.appendChild(img);

        img.onload = function() {
          URL.revokeObjectURL(img.src);
        };
        this.post.images.push(files[i]);

        // displays image in editor
        // var reader = new FileReader();
        // reader.readAsDataURL(files[i]);
        // reader.onloadend = () => {
        //   var base64data = reader.result;
        //   console.log(base64data);
        //   var range : any = this.quill?.getSelection();
        //   // console.log(img.src)
        //   // this.quill?.insertEmbed(range?.index, 'image', img.src)
        //   // const data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBEREREREREPERESEA8PEREREREPDxEPGBQZGhgUGBgcIS4lHB4sIRgYJjgmKy8xNTU1GiQ7QDs0Py40NTEBDAwMEA8QHhISGjQrJCQxNDQ0NDQ0NDQxNDQxNDQ0NDQ0NDQ0MTQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NP/AABEIALcBEwMBIgACEQEDEQH/xAAbAAADAAMBAQAAAAAAAAAAAAAAAQIDBAUGB//EADgQAAICAQMCBAQDBwMFAQAAAAABAhEDBBIhMVEFIkFhBhNxgZGhsSMyQlJi0fAHcsEzQ4Lh8RT/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAQMEAgUG/8QALBEAAgMAAAQFAgYDAAAAAAAAAAECAxEEEiExE0FRcfAiYSOBkcHR4TJCUv/aAAwDAQACEQMRAD8A+qRRkiiIoyI7AJFpEopEAEihIpACGAAAMCgAAAIAGHU8JP8AlnB/bck/ybMxi1MbhNLrslX1rgh9iV3MoCi7SfdJ/iMkgAAAAAAAAAAAAAACRFkkgQmhgAS0KimJgEtEtFslkgxSia8oG1IxyiEDW2gZtoEgzRLRES0QC0CBAiAUgBDAAAGACKACAAAAABR5zxjWSx51+2ljSUYxjuSjKVbnafD6/kbOPx/HFRjkUozabSjG4ya61z+RT48U8l0+fO5b4Mmk49To+H5N2LHKpK4peZOMqXFtPpdX9zZPOYPHseOLioTac5yVyVrfJyr8zZj8RYkrmske9JSS+5yuJp7c6O3w1u7ys7QHn9V8Q9flJbUl5pxfLpPvwuTt6bMpwjNdJRUq7P1RZC2M3i+exVOuUFrMoABYcAMCZTS6sAYGB6hehePJZAMgAJkoCEMRIBksoTAJEyhMAhmNoyMmRIIAAALRaJRQIGUiUUQSUgBAAAwAAoAAgAMQwDwX+oWneb9jDjJKMZwl5Wo5E/K2n6eVd+jujQj8yajK984wUZTSShdU9q/Hk9R8QwUnJxit21Qc0rlt7fTlnB8H8T06m9I5Q+b5m4O4zSSTpqutNPvTR5N6lOxw3p3+fMPUpkoVKWdTgZNbP5sYU75vk6UYzyR2zdRdcpXTu0/dex08fhOL53zOrktse3czvNglJ445MXzItqcIzg5warhxTvo117ox+BLG0zU746lh5H4g0uqXyFjnOKxyi8m2VQyJvyy6cri39e59J+Fs6np4pO9rptXV0r/Ozl4dBGcXCabi+ndP27HU+HtF8hTx3dvdb4v0N3Cynzx1dMaMXE8nI8fXodoBiZ6h5xg1Gbbx6mjLIaGXxvTyyyx/Ohvi2tu9J8du4s2pS9V9TFbetxPsa66X01dzeWVWZ8eT1PPz1lc3Xr/lE6XxzDKThHJGU4unGMtzT7PscQvafU7lTvY9hCVqxmjoNRvN1m+MlJajFKLi8YhDEdEAJjBgEiY2JgEsllshkggAAApFohFIEFFIQ0QSUgBAAAAAA0USiiGAGIaAOY8dSlfc8d494HgnkWaWNPNjluhkTmnSVR3JOm1dW74R7LxC4u1xa5PDf6iZNXHRxlpnNft0s7g3Gfydr6NcpXV1+lmeypz+mLz+zRVZyPmaHpo5sq2bmltty5TV9F7G/wCA/Bek084ZoY5zybpTj82byQxzkqlJJ+vXk4/+lMtRlhqHnlKeK4fJeRuc9/O5qTV0011b5XB7PSeLw/8A1vR44uc4RlkzSi0oYY/wwfeb7duSmrhZ1Nrm7r53LreIjYukex1o6aMUqil9FRr65ShFyg6mk69UbqnbfsauWalJrsmXTSUcXQzwbctZxJ/EOeEfNjxv+rzUvscXW+M5s3Esj2v+CPki/r3OtKEckp4v41dX0kjy8cbhklCd+WVM8a7ibsWyeP55Hr001dWopNfPMw5dNGX8JrqWeD8k5V/LLzRPRy00Wk19TVniS/EzY4s0qSaPOeK5tROGy3BNOMkrVr2foeW8J0GXBqo5I7oKLvy3tknxtft/Y+h6jGqvgfhmhjOTe3j3XFGiu+a2teZxKMM5mux6f4N1nzIS3PzL0fU9WeIx/sZQnBKk0mlxwev0uffFM9bg55Dw33R4/Fx+vxF2ZmENiNpkAGAMAkRTJAEyWUyWSCAAABopERKQILQ0JDIJKQCGgBgAADRSIGAUMQ0QDR8SX7r9OUzyHxRo55I4tmTNBXlhJ4pyg+YOUW0veNX/AFOup7TXQuD9nZypabdw1afVNJpr6FM9Ui+ppY35HznUw1OjwtYM+oeXLOODGt0pOm6cuOW0qV+jkme++Dvh5aHB57lqMr+Znm+Zbnztvsv1t+pvabwvHB7444Rl3UU3V31fJv0+5PMdWzU39KwUp9a+7NbGv3n6f5ybMsbfBr6/y43GPDfH29Smb/2fkRD/AJXmeZllrK5rhb699vqV8Q6L93NFKuIy7+zMubB5Zex1cuNTwSjJcbP+Op5MK3ZGcX59fzPTlYoyjJe35Hm9Dkp88powZ4ve1XXoZtJi59K9DeyaXck/VepnjFyiXuSjI4+o0zcG/wCzOj4ViSgm/Uzy03kd89StOljgl6Jd7NNEMnr9Cm6exxepOsikkn6tHX8Jm0krOBnzb8kVHoqf3O7pFVUaqpp26vIz2x/Cx+Z27EEOgHrnlgDAGASxDYmAJklMhkgkAsAAiURFlJggtFIxopMgFDJGmCSrASY0wBgKxgFpjMZaIAsquL+jNHEkdA5sfK6fc4mdRNyEStooFsjCdJfBzdVLdI3sj4fQ0smF9bM92tYi2rE9NCa4lHu6N6KrE/Th+/oaWWLT+5vrnG/pRkqWN+xpsfRHB0WmfXn15o6ax1x9DKoKEVx0Q8Udz3viK6f3Iqo5UorudWW8zcmYM+K1S6tpnM10WvL+J6KG19Pc5viGFK5fcstqajqOarU3hw8cduSN+p6DTS6HnJZd2RX9n3O3gy01w+aMvDySb9zRfFtHocL4RRj037qMh7yPHYgYNiJIExMYmwBMmQyZMkEgIAQEWUiIlIAsaITKALGSikQAQxACRlIix2AUFisLALTNXNC20zYTIzK+e36HMlqJXcx6eTXD9P0Msna4MUpVZgxapbtvFrr/AH+hS2l0ZZjfVGw0Qk/X3Mtmvq86hH3fQiWRWsla3iNDUcyfsbmmVx5OdjdtvudSEHGC+yMlEeeTkaLnyxSMGaNvvRikpOlz2o34QQseJOa9uTZGGGeUy1iUIJr0XJztUtyf3O1JWqOVmx02vcm6GoiqWM8xk2xm7/hfBsafU7skYx9WkR4xhkm3FdXyzD8PY5S1EI3dXJ/RHjRi1aoerPWbTrcvRHucaqKXsUxAz6A8QQMCWANmNsyMxskA2Q2WyWATYEgCAiNMURgFoExIYBYEpjsgFWFkWFgkuwsx2VuALsdmPcNSAMlgQmMA1Yvc5w9Yuvt6Grq8Lj5/4l6r1XZm1W3P/uSf/H/Bn1EE4texla3d8mXp5n3Rr+HapZIbu3lfc4/jGfz0r49Opv8AhMNqye0/1Roa+Hnb4/8AZm4nXWjRw+eIyvClOeSO7hLzV7npZJNUcPweLtt9vyOupl/BRyrfUp4p7ZnoSnXD6k4slTS/mTS+q5FnfKftRrKf7WF/zOvumXN4ypLUdY19Th3K11X5mVMaLWtK0cHX4t0X/nJqfDGBLPltcxxqvu+Tsa2O2T7SVr6+px/Bsvy9ZKD/AO5CcV9U936WYJxUb4P7/sba5N0zX2PUAxiZ6BiJEymSwAMbMjIZIEyWNsTYAqALAEExGhRLSACgoaQ6AFQ6GkPaQCKE0ZNobQSY6FRkcSXEAQJg0ABSZkRhsuMgDHrIfuT/AJZJP/a+P7FTnxx2HqFuhNeu1tfVco5mk1W60+1maySjNL1/Yvri5Qf2NnQw8uV/13+CNDVRTbo6ej/6WV93Nr7ROVOd23/Yp4jOWKLaN5pM3fD40mbrNfwiO6LZs54UrNHDL8NFF/8AmzX1MuY/d/oa0IOWXG10i3J/gzX1ms8yrn0Nrwbz7penS/c4bUrM+dDtJxhp0VMuMyJ4uxhnKUTUZyfFV5IyX8M6f0a/+HmpPZrNPlfTfsl/5JxX5s7eu1kflyv0cX78M4ebLCcbg3cZQaTTXKkjBxa+pP2f6M2cN2afnq/U9oxMNwmzeYwZLCwABksGSyQJiY2SwQQAAAEGWmY4IyxAGmUiUUgC0UiUUmQAoe1CQwSG0NgyrAMTxmKUDbE4kaDSfBKmbc8dmpmwskGSGRHltHl80430b/C+p2MmVwtvhJPqcDSuPnnDzdXUWt0ml0X6GDjH1gvc2cKukn7HqfD3+wm36/Ma+lHnIardHpzxZ3MWatO1zG8cuH1V9/fk8xHHL5lLovsirjW1yJen8FnCJPnf3PXeByTxt+7X5G3q8bnFxjLa/R1uX4Gp4Pj24l/U3Jm9ZvpWVx30MdrTm89TgS8ByOUZSyw8t3tg6kqa5V+519HpvlQUE7r1rlvubFgdRrjF6kcynKSxsLFJWMGdnJx/FNDOSvHHcnw0mk/zOPg8I1ClCoeSnvU5RVSdcqrvlHrwKp0xm9ZZC2UViIj0X0QxiLSsAAGASxDYmSCWJsbZMmCCbAVgAEDImYIyMsZAFplJkJlJgFploxIpEAyIaJTHYJGCCwsAqwsgYBVikrQrAA81r45Z7/2OS4SdRcXtmv6Wuph0GiyNQcsc4+VOalDZUvXg9WKil0RcuZlquko8qPNavI0mlfZJc9Opy9DhnKbe+Urmo8r93hOvrTPVZfB8cprJc4yTbqMvLz14aK03heLHKUoxe6bUpNttbkkrrpdJFN3DO2ak32LK71XHEjZxx2xUV0SSLodDNhmJodDYgAAAYAmIYmAILGIAGyQFZIAljciHIEDbIkwciJSAADHvAnAY4SMykAEsGWMi1IAOQUmNMAAGmVYAANMaYAANMLACAFhYAAMLAAAsLAABWFgAA7CwAATkKwAAGybACQKxNgAAnITkAAEuRjcgAkESkY5yACUDFvAAJB//2Q=="
        //   this.quill?.insertEmbed(range?.index, 'image', base64data )
        // }
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
      this.errorMessage = "";
      this.updatePost(this.post);
      this.router.navigate(['/postfeed']);
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
