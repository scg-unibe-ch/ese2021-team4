import { Component, OnInit } from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Product } from 'src/app/models/product.model';
import {ActivatedRoute, Router} from '@angular/router';

import { StripeService } from 'ngx-stripe';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import {ConfirmationAsker} from "../../models/confirmation-asker";

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {

  user: User | undefined;
  paymentType: string = "invoice";

  orderFirstName: string = '';
  orderLastName: string = '';
  orderStreet: string = '';
  orderHouseNr: number = 0;
  orderZipCode: number = 0;
  orderCity: string = '';
  orderPhoneNr: string = '';
  productId: number = 0;

  phoneNrMessage: string = '';
  houseNrMessage: string = '';
  zipCodeMessage: string = '';

  product: Product | undefined;
  redirecting: boolean = false;

  loggedIn: boolean | undefined;
  errorMessage="";
  missingFirstName="";
  missingLastName="";
  missingStreet="";
  missingHouseNr="";
  missingZipCode="";
  missingCity="";
  missingPhoneNumber="";


  constructor(
    public toastr: ToastrService,
    private router: Router,
    public httpClient: HttpClient,
    private stripeService: StripeService,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      if (!isNaN(+params.id)) {
        this.productId = +params.id;
      }
    });
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res; if(this.user != undefined)this.getUserDetails();});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
  }


  ngOnInit(): void {
    if(this.user != undefined){
      this.getUserDetails();
    }
  }

  getUserDetails(): void{
    this.httpClient.get(environment.endpointURL + "user/" + this.user?.userId).subscribe((user: any) => {
      this.orderFirstName = user.firstName;
      this.orderLastName = user.lastName;
      this.orderStreet = user.street;
      this.orderHouseNr = user.houseNr;
      this.orderZipCode = user.zipCode;
      this.orderCity = user.city;
      this.orderPhoneNr = user.phoneNr;

      this.httpClient.get(environment.endpointURL + "product/" + this.productId).subscribe((product: any) => {
        this.product = new Product(product.productId, product.title, product.description, product.price, product.tags, product.imageId);
      });
    });
}

  confirmOrder(): void {
    if(!this.formIsFilled()){
      this.checkMissingDetails()
    }
    else{
      this.resetErrorMessage()
      ConfirmationAsker.confirmTitle('You are about to place an order.', 'Do you want to proceed?')
        .then(confirmed => {
          if(confirmed){
            this.createOrder();
          }
        });
  }}

  createOrder(): void{
    if(this.paymentType == "stripe") {
      this.createOrderStripe();
    }
    else {
      this.createOrderInvoice();
    }
  }

  createOrderInvoice() {
    this.httpClient.post(environment.endpointURL + "order/invoice", {
      status: "Pending",
      productId: this.productId,
      userId: this.user?.userId,
      adminId: 0,
      orderFirstName: this.orderFirstName,
      orderLastName: this.orderLastName,
      orderStreet: this.orderStreet,
      orderHouseNr: this.orderHouseNr,
      orderZipCode: this.orderZipCode,
      orderCity: this.orderCity,
      orderPhoneNr: this.orderPhoneNr,
      billingStatus: "invoice open"
    }).subscribe();
    this.router.navigate(['/fan-shop']);
    this.toastr.success("Thank you for your order!")
  }

  createOrderStripe(): void {
    if(!this.formIsFilled()) {
      this.checkMissingDetails()
    }
    else {
      this.resetErrorMessage()
      this.httpClient.post(environment.endpointURL + "order/stripe", {
        status: "Pending",
        productId: this.productId,
        userId: this.user?.userId,
        adminId: 0,
        orderFirstName: this.orderFirstName,
        orderLastName: this.orderLastName,
        orderStreet: this.orderStreet,
        orderHouseNr: this.orderHouseNr,
        orderZipCode: this.orderZipCode,
        orderCity: this.orderCity,
        orderPhoneNr: this.orderPhoneNr,
        billingStatus: ''
      })
        .pipe(
          switchMap((session : any) => {
            return this.stripeService.redirectToCheckout({ sessionId: session.id })
          })
        )
        .subscribe(() => {

        });
      this.redirecting = true;
    }
  }


  formIsFilled(): boolean {
    if(this.orderFirstName==='' || this.orderLastName === '' || this.orderStreet === '' ||
      this.orderHouseNr == 0 || this.orderZipCode == 0 ||this.orderCity === '' ||this.orderPhoneNr === ''){
    return false;
  }
    return this.isValidFormFill();
  }

  updatePhoneNrMessage() {
    if(isNaN(+this.orderPhoneNr)){
      this.phoneNrMessage = 'Please enter a number'
    } else {
      this.phoneNrMessage = ''
    }
  }

  updateHouseNrMessage() {
    if(isNaN(+this.orderHouseNr)){
      this.houseNrMessage = 'Please enter a number'
    } else {
      this.houseNrMessage = ''
    }
  }

  updateZipCodeMessage() {
    if(isNaN(+this.orderZipCode)){
      this.zipCodeMessage = 'Please enter a number'
    } else {
      this.zipCodeMessage = ''
    }
  }

  isValidFormFill(): boolean {
    return !(isNaN(+this.orderHouseNr) || isNaN(+this.orderZipCode) || isNaN(+this.orderPhoneNr))
  }

  checkMissingDetails(): void{
    this.errorMessage="Please fill in the missing address details."
    this.missingFirstName = this.orderFirstName == "" ? "*" : "";
    this.missingLastName = this.orderLastName == "" ? "*" : "";
    this.missingStreet = this.orderStreet == "" ? "*" : "";
    this.missingHouseNr = this.orderHouseNr== 0 ? "*" : "";
    this.missingZipCode = this.orderZipCode == 0 ? "*" : "";
    this.missingCity = this.orderCity == "" ? "*" : "";
    this.missingPhoneNumber = this.orderPhoneNr == "" ? "*" : "";
  }

  resetErrorMessage(){
    this.missingFirstName = this. missingLastName = this. missingStreet = this.missingHouseNr =
      this.missingZipCode = this. missingCity = this.missingPhoneNumber = this.errorMessage = "";
  }
}
