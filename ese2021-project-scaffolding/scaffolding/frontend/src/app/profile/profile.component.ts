import { Component, OnInit } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";
import {Order} from "../models/order.model";
import {Status, StatusFinder} from "../models/status.model";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User | undefined;

  loggedIn: boolean | undefined;

  changedUser = new User(0, '', '', false);
  userEmail: string = '';
  firstName: string = '';
  lastName: string = '';
  street: string = '';
  houseNr: string = '';
  city: string = '';
  zipCode: string = '';
  birthday: Date = new Date();
  phoneNr: string = '';

  updateMessage: string = '';
  emailMessage: string = '';
  usernameMessage: string = '';

  myOrders: Order[] = [];
  selectedOrders: Order[] = [];
  selectedStatus = 'all';

  constructor(
    public httpClient: HttpClient,
    public userService: UserService,
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res; this.getOrders()});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();

    this.httpClient.get(environment.endpointURL + "user/" + localStorage.getItem('userName')).subscribe((user: any) => {
      this.changedUser = new User(user.userId, user.userName, user.password, user.admin);
      this.userEmail = user.userEmail;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.street = user.street;
      this.houseNr = user.houseNr;
      this.zipCode = user.zipCode;
      this.city = user.city;
      this.birthday = new Date(user.birthday);
      this.phoneNr = user.phoneNr;
    });
  }

  ngOnInit(): void {
    if(this.user != undefined) {
      this.getOrders();
    }
  }

  updateUser(user: User): void {
    if(this.isValidUsername()&&this.isValidEmail()) {
      this.httpClient.put(environment.endpointURL + "user/" + user.userId, {
        userId: this.changedUser.userId,
        userName: this.changedUser.username,
        password: this.changedUser.password,
        userEmail: this.userEmail,
        firstName: this.firstName,
        lastName: this.lastName,
        street: this.street,
        houseNr: this.houseNr,
        city: this.city,
        zipCode: this.zipCode,
        birthday: this.birthday,
        phoneNr: this.phoneNr
      }).subscribe(() => {
        this.updateMessage = 'Your Information has been updated.';
        this.emailMessage = this.usernameMessage = ''
        },
        error => {
          this.updateMessage = 'update failed';
          console.log(error)
        })
    }
  }

  updateUsernameMessage(): void {
    if(!this.isValidUsername()){
      this.usernameMessage='You username must not contain an @-Symbol.'
    }
    else{
      this.usernameMessage=''
    }
  }
  isValidUsername(): boolean{
    return !this.changedUser.username.match('@')
  }

  updateEmailMessage(): void {
    if(!this.isValidEmail()){
      this.emailMessage='Please enter a valid email address.';
    }
    else{
      this.emailMessage=''
    }
  }
  isValidEmail(): boolean {
    return !!this.userEmail.match('@')
  }


  getOrders(): void {
    if(this.user?.isAdmin){
      this.httpClient.get(environment.endpointURL + 'order/').subscribe((orders: any) => {
        orders.forEach((order: any) => this.myOrders.push(new Order(StatusFinder.status(order.status), order.orderId, order.userId, order.productId, order.adminId, new Date(order.createdAt), new Date(order.shippedDate), order.orderFirstName, order.orderLastName, order.orderStreet, order.orderHouseNr, order.orderZipCode, order.orderCity, order.orderPhoneNr)));
      })
    }
    else {
      this.httpClient.get(environment.endpointURL + 'order/createdBy/' + this.user?.userId).subscribe((orders: any) => {
        orders.forEach((order: any) => this.myOrders.push(new Order(StatusFinder.status(order.status), order.orderId, order.userId, order.productId, order.adminId, new Date(order.createdAt), new Date(order.shippedDate), order.orderFirstName, order.orderLastName, order.orderStreet, order.orderHouseNr, order.orderZipCode, order.orderCity, order.orderPhoneNr)));
        this.selectedOrders = this.myOrders;
      })
    }
  }

  filterBy(status: string): void {
    if(status == 'all'){
      this.selectedOrders = this.myOrders;
    } else {
      this.selectedOrders = this.myOrders.filter(order => order.status == StatusFinder.status(status))
    }
  }

  updateOrder(order: Order): void {
    this.httpClient.put(environment.endpointURL + "order/" + order.orderId, {
      status: order.status
    })
  }
}
