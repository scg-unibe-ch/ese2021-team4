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

  product: Product | undefined;
  redirecting: boolean = false;

  loggedIn: boolean | undefined;

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
    userService.user$.subscribe(res => {this.user = res; this.getUserDetails();});

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
      document.getElementById('emptyFields')!.style.visibility='visible';
    }
    else{

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
    if(!this.formIsFilled()){
      document.getElementById('emptyFields')!.style.visibility='visible';
    }
    else {
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
    if (this.orderFirstName==='' || this.orderLastName === '' || this.orderStreet === '' ||
      this.orderHouseNr == 0 || this.orderZipCode == 0 ||this.orderCity === '' ||this.orderPhoneNr === ''){
    return false;
  }
    return true;
  }

  postAPI(): void {
    const request = "https://wedec.post.ch/api/address/v1/addresses/validation";
    const payload = {
      "addressee":{
         "firstName":"Hans",
         "lastName":"Muster",
         "title":"MISTER"
      },
      "geographicLocation":{
         "house":{
            "street":"viale Stazione",
            "houseNumber":"15",
            "additionalAddress":""
         },
         "zip":{
            "zip":"6500",
            "city":"Bellinzona"
         }
      },
      "logisticLocation":{
         "postBoxNumber":""
      },
      "fullValidation":true
   };
    this.httpClient.post(request, payload).subscribe( res => {
      console.log(res);
    })
  }

}
