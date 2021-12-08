import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {Order} from "../../models/order.model";
import {StatusFinder} from "../../models/status.model";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-order-feed',
  templateUrl: './order-feed.component.html',
  styleUrls: ['./order-feed.component.css']
})
export class OrderFeedComponent implements OnInit {

  loggedIn: boolean | undefined;

  user: User | undefined;

  @Input()
  feedType!: string;

  orders: Order[] = [];
  selectedOrders: Order[] = this.orders;
  selectedStatus = 'all';

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res; this.getOrders()});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
  }

  ngOnInit(): void {
    if(this.user != null) {
      this.getOrders();
    }
  }

  getOrders(): void {
    this.orders = [];
    if (this.feedType == 'admin') {
      this.httpClient.get(environment.endpointURL + 'order/').subscribe((orders: any) => {
        this.pushOrders(orders);
      })
    } else {
      this.httpClient.get(environment.endpointURL + 'order/createdBy/' + this.user?.userId).subscribe((orders: any) => {
        this.pushOrders(orders);
      })
    }
  }

  pushOrders(orders: Order[]): void {
    orders.forEach((order: any) => this.orders.push(new Order(order.billingStatus, StatusFinder.status(order.status), order.orderId, order.userId, order.productId, order.adminId, new Date(order.createdAt), new Date(order.shippedDate), order.orderFirstName, order.orderLastName, order.orderStreet, order.orderHouseNr, order.orderZipCode, order.orderCity, order.orderPhoneNr)));
    this.selectedOrders = this.orders;
    this.filterBy(this.selectedStatus);
  }

  filterBy(status: string): void {
    if(status == 'all'){
      this.selectedOrders = this.orders;
    } else {
      this.selectedOrders = this.orders.filter(order => order.status == StatusFinder.status(status))
    }
  }

  updateOrder(order: Order): void {
    this.httpClient.put(environment.endpointURL + "order/" + order.orderId, {
      status: order.status
    }).subscribe(() => this.getOrders())
  }
}
