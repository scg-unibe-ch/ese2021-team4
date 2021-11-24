import { Component, OnInit } from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Product } from 'src/app/models/product.model';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from "@angular/forms";
import { Order } from 'src/app/models/order.model';
import { Status } from 'src/app/models/status.model';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {

  user: User | undefined;
  newOrder: Order | undefined;

  orderFirstName: string = '';
  orderLastName: string = '';
  orderStreet: string = '';
  orderHouseNr: number = 0;
  orderZipCode: number = 0;
  orderCity: string = '';
  orderPhoneNr: string = '';
  productId: number = 0;

  // product: Product | undefined;

  loggedIn: boolean | undefined;

  constructor(
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      if (!isNaN(+params.id)) {
        this.productId = +params.id;
      }
      console.log(this.productId)
    });
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();

    this.httpClient.get(environment.endpointURL + "user/" + localStorage.getItem('userName')).subscribe((user: any) => {
      this.orderFirstName = user.firstName;
      this.orderLastName = user.lastName;
      this.orderStreet = user.street;
      this.orderHouseNr = user.houseNr;
      this.orderZipCode = user.zipCode;
      this.orderCity = user.city;
      this.orderPhoneNr = user.phoneNr;
      this.newOrder = new Order(Status.Pending, 0, user.userId, this.productId, 0, new Date(), new Date(), this.orderFirstName, this.orderLastName, this.orderStreet, this.orderHouseNr, this.orderZipCode, this.orderCity, this.orderPhoneNr)
    });
  }


  ngOnInit(): void {
  }


  createOrder(): void {
    if(!this.formIsFilled()){
      document.getElementById('emptyFields')!.style.visibility='visible';
    }
    else {
      this.updateShippingDetails();
      this.httpClient.post(environment.endpointURL + "order", {
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

      }).subscribe(() => {
      });
      this.router.navigate(['/fan-shop'])
    }
  }

  // TODO: speichert die angegeben Shipping Details, ohne die User Attributes zu verändern
  updateShippingDetails(): void {

  }

  formIsFilled(): boolean {
    if (this.orderFirstName==='' || this.orderLastName === '' || this.orderStreet === '' ||
      this.orderHouseNr == 0 || this.orderZipCode == 0 ||this.orderCity === '' ||this.orderPhoneNr === ''){
    return false;
  }
    return true;
}

}
