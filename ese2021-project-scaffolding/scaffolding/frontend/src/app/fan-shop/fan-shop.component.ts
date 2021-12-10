import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product.model';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import {Category, CategoryFinder} from "../models/category.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-fan-shop',
  templateUrl: './fan-shop.component.html',
  styleUrls: ['./fan-shop.component.css']
})
export class FanShopComponent implements OnInit {

  productList: Product[] = [];

  sortBy = '';
  selectedCategory = '';
  selectedProducts: Product[] = [];

  loggedIn: boolean | undefined;

  user: User | undefined;


  constructor(
    public toastr: ToastrService,
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {
    this.activatedRoute.url.subscribe(url => {

      //successful payment via stripe redirects to url 'success'
      //display feedback and reroute to usual fan-shop url
      if(url[0].path == 'success') {
        this.router.navigate(['/fan-shop']);
        this.toastr.success("Thank you for your order!")
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
    this.readProducts();
  }

  // READ - Products
  readProducts(): void {
    this.httpClient.get(environment.endpointURL + "product").subscribe((products: any) => {

      products.forEach((product: any) => {
        this.productList.push(new Product(product.productId, product.title, product.description, product.price, product.tags, product.imageId));
      });
      this.selectedProducts = this.productList;

    });
  }

  sortProducts(): void {
    switch (this.sortBy) {
      case "id": this.sortById();
        break;
      case "title": this.sortByTitle();
        break;
      case "tags": this.sortByTags();
        break;
      case "price": this.sortByPrice();
        break;
      default:
    }
  }

  selectProducts(): void {
    const tags = this.findCategory();
    if (this.selectedCategory == 'all') {
      this.selectedProducts = this.productList;
    }
    else{
      this.selectedProducts = this.productList.filter(product => product.tags == tags)
    }
    this.sortProducts();
  }

  findCategory(): Category{
    return CategoryFinder.findCategory(this.selectedCategory)
  }

  sortByTags():void{
    this.selectedProducts.sort((a, b) => a.tags.localeCompare(b.tags))
  }
  sortByTitle(): void {
    this.selectedProducts.sort((a, b) => a.title.localeCompare(b.title))
  }

  sortById(): void{
    this.selectedProducts.sort((a,b) => a.productId-b.productId)
  }
  sortByPrice(): void{
    this.selectedProducts.sort((a,b) => a.price-b.price)
  }
}

