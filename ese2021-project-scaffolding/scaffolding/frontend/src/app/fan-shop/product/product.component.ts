import {HttpClient} from '@angular/common/http';
import {Product} from 'src/app/models/product.model';
import {User} from 'src/app/models/user.model';
import {UserService} from 'src/app/services/user.service';
import {environment} from 'src/environments/environment';
import {Component, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AngularEditorConfig} from '@kolkov/angular-editor';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Category, CategoryFinder} from "../../models/category.model";


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  selectCategory='';

  loggedIn: boolean | undefined;

  user: User | undefined;

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

  product: Product = new Product(0, '', '', 0, Category.Bern, 0);

  @Input()
  preview: boolean = false;

  @Input()
  productId: number = 0;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

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
        this.httpClient.get(environment.endpointURL + "product/" + this.productId).subscribe((product: any) => {
          this.product = new Product(product.productId, product.title, product.description, product.price, product.tags, product.imageId);
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
    if (this.product.title==''){
      document.getElementById('setTitle')!.style.visibility='visible';
    }
    else if (this.findCategory()==Category.Bern){
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='visible';
    }
    else{
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='hidden';
      this.router.navigate(['/fan-shop']);
      this.updateProduct(this.product);
    }
  }

  findCategory(): Category{
    return CategoryFinder.findCategory(this.selectCategory);
  }

  createProduct(): void {
    if (this.product.title==''){
      document.getElementById('setTitle')!.style.visibility='visible';
    }
    else if(this.product.price==0){
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='hidden';
      document.getElementById('setPrice')!.style.visibility='visible';
    }
    else if (this.findCategory()==Category.Bern){
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='visible';
      document.getElementById('setPrice')!.style.visibility='hidden';
    }

    else {
      this.router.navigate(['/fan-shop']);
      document.getElementById('setTitle')!.style.visibility='hidden';
      document.getElementById('setPrice')!.style.visibility='hidden';
      document.getElementById('setCategory')!.style.visibility='hidden';
      if(this.user != null){ //user might not be instantiated, this is taken care of by the html
        this.httpClient.post(environment.endpointURL + "product", {
          title: this.product.title,
          description: this.product.description,
          price: this.product.price,
          imageId: this.product.imageId,
          tags: this.findCategory()
        }).subscribe((product: any) => {
          },
          error => {console.log(error)});

      }
    }}

  updateProduct(product: Product): void {
    this.httpClient.put(environment.endpointURL + "product/" + product.productId, {
      title: product.title,
      description: product.description,
      tags: this.findCategory(),
      price: product.price,
      imageId: product.imageId
    }).subscribe();
  }

  deleteProduct(product: Product): void {
    if(this.user?.isAdmin){
      this.httpClient.delete(environment.endpointURL + "product/" + product.productId).subscribe(() => {});
    }
  }

  checkLoggedIn() {
    if (this.loggedIn){
      this.router.navigate(['fan-shop/product/:id/order']);
    }
    else
    {
      this.router.navigate(['login']);

    }
  }
}

