import { Component, OnInit } from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Product } from 'src/app/models/product.model';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {

  user: User|undefined;

  // orderUser = new User(0, '', '', false);
  orderFirstName: string = '';
  orderLastName: string = '';
  orderStreet: string = '';
  orderHouseNr: number = 0;
  orderZipCode: number = 0;
  orderCity: string = '';
  orderPhoneNr: number = 0;
  productId: number = 0;

  // product: Product | undefined;

  loggedIn: boolean|undefined;

  constructor(
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      if(!isNaN(+params.id)) {
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
      // this.orderUser = new User(user.userId, user.userName, user.password, user.admin);
      this.orderFirstName = user.firstName;
      this.orderLastName = user.lastName;
      this.orderStreet = user.street;
      this.orderHouseNr = user.houseNr;
      this.orderZipCode = user.zipCode;
      this.orderCity = user.city;
      this.orderPhoneNr = user.phoneNr;
    });
  }


  ngOnInit(): void {
  }


  createOrder(): void {
    this.httpClient.post(environment.endpointURL + "order", {
      status: "Pending",
      productId: this.productId,
      userId: this.user?.userId,
      adminId: 0
    }).subscribe(() => {});
    this.router.navigate(['/fan-shop'])
  }

  // TODO: speichert die angegeben Shipping Details, ohne die User Attributes zu verändern
  updateShippingDetails(): void {

  }
}
