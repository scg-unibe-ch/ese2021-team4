import {HttpClient} from '@angular/common/http';
import {Product} from 'src/app/models/product.model';
import {User} from 'src/app/models/user.model';
import {UserService} from 'src/app/services/user.service';
import {environment} from 'src/environments/environment';
import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Category, CategoryFinder} from "../../models/category.model";
import {ConfirmationAsker} from "../../models/confirmation-asker";
import Quill from "quill";
import {QuillModules} from "ngx-quill";


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {


  user: User | undefined;
  loggedIn: boolean | undefined;

  existsInBackend : boolean = true;
  form: FormGroup = new FormGroup({});
  editMode: boolean = false;
  rows: number = 1;

  quill : Quill | undefined;
  // editor : Quill
  editorStyle = {
    height: '300px',
    backgroundColor: "#9c9c9c"
  };

  config :QuillModules= {
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
  preview: boolean = false;

  @Input()
  orderFormView: boolean = false;

  @Input()
  productId: number = 0;

  product: Product = new Product(0, '', '', 0, Category.Bern, []);
  selectCategory=this.product.tags.toString();
  missingProduct: boolean = false;

  showPriceError: boolean = false;
  showCategoryError: boolean = false;
  showTitleError: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute
  ) {

    this.activatedRoute.params.subscribe(params => {
      if(!isNaN(+params.id)) {
        this.productId = +params.id;
      }
    });

    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

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
      this.product.images.push(files[i]);
      imageSpan?.appendChild(img);
    }
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      signature: ['', Validators.required]
    });

      // if this.productId === -1, this means we are in editor mode and are looking to create a new product
      if (this.productId === -1) {
        this.editMode = true;
        this.existsInBackend = false;

      } else {
        this.existsInBackend = true;
        this.editMode = false;
        this.loadProduct();
      }
  }

  loadProduct(): void {
    this.httpClient.get(environment.endpointURL + "product/" + this.productId).subscribe((product: any) => {
      if(product != undefined) {
        this.product = new Product(product.productId, product.title, product.description, product.price, product.tags, new Array<File>());
        this.selectCategory = this.product.tags.toString();
        if(!this.preview){
          this.loadPicturesToProduct();
        }
      }
      else{
        this.product = new Product(0, 'Nonexistent Product', 'This product does not exist anymore.', 0, Category.Bern, []);
        this.missingProduct = true;
      }
    });
  }

  loadPicturesToProduct(){
    this.httpClient.get(environment.endpointURL + "product/" + this.productId + "/getImageIds",
      {responseType: 'text', headers: {'Content-Type': 'json/application'}}).subscribe((imgIds: any) => {

      if(imgIds != ""){
        const imgIdArray :Array<String> = imgIds.split(",");
        const imageSpan = document.getElementById("image");

        imgIdArray.forEach(element => {
          const imageId : number = +element;
          this.httpClient.get(environment.endpointURL + "product/" + "getSingleImage/" + imageId,
            {responseType: 'blob', headers: {'Content-Type': 'multipart/formData'}}).subscribe((image: any) =>{
            const img = document.createElement("img");
            const picture: File = new File([image], "uploadedProduct");
            img.src = URL.createObjectURL(picture);
            img.height = 200;
            this.product.images.push(picture);
            img.onload = function() {
              URL.revokeObjectURL(img.src);
            };
            imageSpan?.appendChild(img);
          });
        });
      }
    });
  }

  deleteImages() {
    this.httpClient.get(environment.endpointURL + "product/" + this.productId + "/getImageIds",
    {responseType: 'text', headers: {'Content-Type': 'json/application'}}).subscribe((imgIds: any) => {

      if(imgIds != ""){
        const imgIdArray :Array<String> = imgIds.split(",");
        imgIdArray.forEach(element => {
          const imageId : number = +element;
          this.httpClient.delete(environment.endpointURL + "post/images/" + imageId).subscribe((deleted:any) => {});
        });
      }
    });
    this.product.images = new Array<File>();
    const ImgSpan = document.getElementById("image");
    if(ImgSpan != undefined){
      ImgSpan.innerHTML = '';
    }
  }

  save(){
    if(this.isValidFormFill()){
      this.router.navigate(['/fan-shop']);
      this.updateProduct(this.product);
    }
  }

  invalidPrice(): boolean {
    this.showPriceError = false;
    this.showPriceError = isNaN(this.product.price) || this.product.price == 0;
    return this.showPriceError;
  }

  invalidCategory(): boolean {
    this.showCategoryError = this.findCategory()==Category.Bern;
    return this.showCategoryError;
  }

  invalidTitle(): boolean {
    this.showTitleError = (this.product.title == '');
    return this.showTitleError
  }

  isValidFormFill(): boolean {
    let valid = true;
    if(this.invalidTitle()){
      valid = false
    }
    if(this.invalidCategory()){
      valid = false
    }
    if(this.invalidPrice()){
      valid = false
    }
    return valid

  }

  findCategory(): Category{
    return CategoryFinder.findCategory(this.selectCategory);
  }

  createProduct(): void {
    if(this.isValidFormFill()){
      this.router.navigate(['/fan-shop']);
        this.httpClient.post(environment.endpointURL + "product", {
          title: this.product.title,
          description: this.product.description,
          price: this.product.price,
          tags: this.findCategory()
      }).subscribe((product: any) => {
        const formData = new FormData();
        for (let i=0; i < this.product.images.length; i++){
          formData.append("file"+i, this.product.images[i]);
        }
        this.httpClient.post(environment.endpointURL + "product/" + product.productId + "/image", formData).subscribe((image: any) => {
        });
      }, error => {console.log(error)});
    }
  }

  updateProduct(product: Product): void {
    this.httpClient.put(environment.endpointURL + "product/" + product.productId, {
      title: product.title,
      description: product.description,
      tags: this.findCategory(),
      price: product.price,
      images: product.images
    }).subscribe((post: any) => {
      const formData = new FormData();
      for (let i=0; i < this.product.images.length; i++){
        if(this.product.images[i].name != "uploadedProduct"){
          formData.append("file"+i, this.product.images[i]);
        }
      }
      this.httpClient.post(environment.endpointURL + "product/" + product.productId + "/image", formData).subscribe((post: any) => {
      });
    }, error => {console.log(error)});
  }

  confirmDeleting (product: Product): void{
    ConfirmationAsker.confirmTitle('You are about to delete this product.', 'Do you want to proceed?')
      .then(confirmed => {
        if(confirmed){
          this.deleteProduct(product)
        }
      })
  }


  deleteProduct(product: Product): void {
    if(this.user?.isAdmin){
      this.httpClient.delete(environment.endpointURL + "product/" + product.productId).subscribe(() => {this.router.navigate(["/fan-shop"]);});
    }
  }

  checkLoggedIn() {
    if (this.loggedIn){
      this.router.navigate(['fan-shop/product/' + this.productId + '/order']);
    }
    else
    {
      this.router.navigate(['login']);
    }
  }

  countRows(): void {
    const width = window.innerWidth * 0.9 * 0.45;
    this.rows= Math.floor(this.getTextWidth(this.product.title) / width) + 1 ;
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
      input.onchange = (e) => this.onFileSelected(e);
    })
  }

}

