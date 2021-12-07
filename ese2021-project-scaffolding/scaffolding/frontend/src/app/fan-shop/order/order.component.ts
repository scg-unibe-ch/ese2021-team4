import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Order} from 'src/app/models/order.model';
import {UserService} from "src/app/services/user.service";
import {User} from "src/app//models/user.model";
import {Status} from 'src/app/models/status.model';
import {HttpClient} from "@angular/common/http";
import { environment } from 'src/environments/environment';
import {ConfirmationAsker} from "../../models/confirmation-asker";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  user: User|undefined;
  loggedIn: boolean|undefined;


  @Input()
  order!: Order;

  @Output()
  update = new EventEmitter<Order>();

  isShipped: boolean = false;
  isCancelled: boolean = false;
  isPaid: boolean = false;

  orderUserName = '';
  orderAdminName = '';

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
    this.checkOrderStatus();

    this.httpClient.get(environment.endpointURL + 'user/' + this.order.userId).subscribe((user:any) => this.orderUserName = user.userName);

    if(this.isShipped){
      this.httpClient.get(environment.endpointURL + 'user/' + this.order.adminId).subscribe((user:any) => this.orderAdminName = user.userName)
    }
  }

  checkOrderStatus(): void {
    if(this.order.status == Status.Shipped) {
      this.isShipped = true;
    }
    if(this.order.status == Status.Cancelled) {
      this.isCancelled = true;
    }
    if(this.order.billingStatus == "paidByInvoice" || this.order.billingStatus == "paid with stripe") {
      this.isPaid = true;
    }
  }

  confirmPayment(): void{
    ConfirmationAsker.confirm('Are you sure this order has been paid?')
      .then(confirmed => {
        if(confirmed){
          this.setPaid();
        }
      })
  }

  setPaid(): void {
    if(this.user?.isAdmin) {
      this.isPaid = true;
      this.order.billingStatus = "paidByInvoice";
      this.httpClient.put(environment.endpointURL + "order/" + this.order.orderId, {
        billingStatus: "paidByInvoice",
      }).subscribe();
      this.update.emit(this.order);
      }
  }

  confirmCancelling(): void{
    ConfirmationAsker.confirm('Are you sure you want to cancel this order?')
      .then(confirmed => {
        if(confirmed){
          this.cancelOrder();
        }
      })
    }

  cancelOrder(): void {
    this.isCancelled = true;
    this.httpClient.put(environment.endpointURL + "order/" + this.order.orderId, {
      status: Status.Cancelled,
    }).subscribe();
    this.update.emit(this.order);
  }


  confirmShipping(): void{
    ConfirmationAsker.confirm('Are you sure you want to ship this order?')
      .then(confirmed => {
        if(confirmed){
          this.shipOrder();
        }
      })
  }

  shipOrder(): void {
    if(this.user?.isAdmin) {
      this.isShipped = true;
      this.httpClient.put(environment.endpointURL + "order/" + this.order.orderId, {
        status: Status.Shipped,
        adminId: this.user?.userId,
        shippedDate: new Date(),
      }).subscribe(() => this.orderAdminName = this.user!.username);

      this.update.emit(this.order);
    }
  }

}
