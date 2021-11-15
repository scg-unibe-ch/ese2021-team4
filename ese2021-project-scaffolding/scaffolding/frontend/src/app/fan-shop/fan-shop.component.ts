import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product.model';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import {MatGridListModule} from '@angular/material/grid-list';
import {Category} from "../models/category.model";


@Component({
  selector: 'app-fan-shop',
  templateUrl: './fan-shop.component.html',
  styleUrls: ['./fan-shop.component.css']
})
export class FanShopComponent implements OnInit {

  productList: Product[] = [];
  newProductTitle = '';
  newProductDescription = '';
  newProductTags = '';

  sortBy = '';
  selectedCategory = '';
  selectedProducts: Product[] = [];

  loggedIn: boolean | undefined;

  user: User | undefined;


  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
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

  //CREATE PRODUCT (ONLY FOR ADMINS)
  createPost(): void {
    if(this.user != null){ //user might not be instantiated, this is taken care of by the html
      this.httpClient.post(environment.endpointURL + "product", {
        title: this.newProductTitle,
        description: this.newProductDescription,
        tags: this.newProductTags,
      }).subscribe((product: any) => {
          this.productList.push(new Product(product.productId, product.title, product.description, product.price, product.tag, product.imageId));
          this.newProductTitle = this.newProductDescription = this.newProductTags = '';
        },
        error => {console.log(error)})
    }

  }

  // READ - Products
  readProducts(): void {
    this.httpClient.get(environment.endpointURL + "product").subscribe((products: any) => {

      products.forEach((product: any) => {
        this.productList.push(new Product(product.productId, product.title, product.description, product.price, product.tag, product.imageId));
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
      default: console.log('invalid sort')

    }
  }

  selectProducts(): void {
    const tags = this.findCategory();
    if (this.selectedCategory == 'all') {
      this.selectedProducts = this.productList;
    }
    else{
      this.selectedProducts = this.productList.filter(product => product.tag == tags)
    }
  }

  findCategory(): Category{
    switch (this.selectedCategory){
      case "restaurant": return Category.Restaurant;
        break;
      case "coffeeshop": return Category.Coffeeshop;
        break;
      case "shopping": return Category.Shopping;
        break;
      case "sightseeing": return Category.Sightseeing;
        break;
      case "museum": return Category.Museum;
        break;
      case "university": return Category.University;
        break;
    }
    return Category.Bern;
  }

  sortByTags():void{
    this.selectedProducts.sort((a, b) => a.tag.localeCompare(b.tag))
  }
  sortByTitle(): void {
    this.selectedProducts.sort((a, b) => a.title.localeCompare(b.title))
  }

  sortById(): void{
    this.selectedProducts.sort((a,b) => a.productId-b.productId)
  }
}

