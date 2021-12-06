import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Order} from 'src/app/models/order.model';
import {UserService} from "src/app/services/user.service";
import {User} from "src/app//models/user.model";
import {Status} from 'src/app/models/status.model';
import {HttpClient} from "@angular/common/http";
import { environment } from 'src/environments/environment';
import {ConfirmBoxInitializer, DialogLayoutDisplay} from "@costlydeveloper/ngx-awesome-popup";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  user: User|undefined;
  loggedIn: boolean|undefined;
  isShipped: boolean = false;
  isCancelled: boolean = false;
  isPaid: boolean = false;

  @Input()
  order: Order = new Order('', Status.Pending, 0, 0, 0, 0, new Date(), new Date(), '', '', '', 0, 0, '', '');

  @Output()
  update = new EventEmitter<Order>();

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
    if(this.order.status == Status.Shipped)
    {
      this.isShipped = true;
    }
    if(this.order.status == Status.Cancelled)
    {
      this.isCancelled = true;
    }
    if(this.order.billingStatus == "paidByInvoice" || this.order.billingStatus == "paid with stripe")
    {
      this.isPaid = true;
    }
  }

  confirmPayment(): void{
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle('');
    confirmBox.setMessage('Are you sure this order has been paid?');
    confirmBox.setButtonLabels('YES', 'NO');

    // Choose layout color type
    confirmBox.setConfig({
      LayoutType: DialogLayoutDisplay.WARNING// SUCCESS | INFO | NONE | DANGER | WARNING
    });

    // Simply open the popup and listen which button is clicked
    confirmBox.openConfirmBox$().subscribe(resp => {

      if (resp.ClickedButtonID=='yes'){
        this.setPaid()
      }
    });
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
      const confirmBox = new ConfirmBoxInitializer();
      confirmBox.setTitle('');
      confirmBox.setMessage('Are you sure you want to cancel this order?');
      confirmBox.setButtonLabels('YES', 'NO');

      // Choose layout color type
      confirmBox.setConfig({
        LayoutType: DialogLayoutDisplay.WARNING// SUCCESS | INFO | NONE | DANGER | WARNING
      });

      // Simply open the popup and listen which button is clicked
      confirmBox.openConfirmBox$().subscribe(resp => {

        if (resp.ClickedButtonID=='yes'){
          this.cancelOrder()
        }
      });
    }

  cancelOrder(): void {
    this.isCancelled = true;
    this.httpClient.put(environment.endpointURL + "order/" + this.order.orderId, {
      status: Status.Cancelled,
    }).subscribe();
    this.update.emit(this.order);
  }


  confirmShipping(): void{
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle('');
    confirmBox.setMessage('Are you sure you want to ship this order?');
    confirmBox.setButtonLabels('YES', 'NO');

    // Choose layout color type
    confirmBox.setConfig({
      LayoutType: DialogLayoutDisplay.WARNING// SUCCESS | INFO | NONE | DANGER | WARNING
    });
    // Simply open the popup and listen which button is clicked
    confirmBox.openConfirmBox$().subscribe(resp => {

      if (resp.ClickedButtonID=='yes'){
        this.shipOrder()
      }
    });
  }

  shipOrder(): void {
    if(this.user?.isAdmin) {
      this.isShipped = true;
      this.httpClient.put(environment.endpointURL + "order/" + this.order.orderId, {
        status: Status.Shipped,
        shippedDate: new Date(),
      }).subscribe();

      this.update.emit(this.order);
    }
  }
}
