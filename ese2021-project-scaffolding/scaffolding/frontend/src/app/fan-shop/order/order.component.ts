import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Order} from 'src/app/models/order.model';
import {UserService} from "src/app/services/user.service";
import {User} from "src/app//models/user.model";
import {Status} from 'src/app/models/status.model';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  user: User|undefined;

  loggedIn: boolean|undefined;

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
  }

  @Input()
  order: Order = new Order(Status.Pending, 0, 0, 0, 0, new Date(), new Date(), '', '', '', 0, 0, '', '');

  @Output()
  update = new EventEmitter<Order>();

  cancelOrder(): void {
    this.order.status = Status.Cancelled;
    this.update.emit(this.order);
  }

  shipOrder(): void {
    if(this.user?.isAdmin) {
      this.order.status = Status.Shipped;
      this.order.adminId = this.user!.userId;
      this.update.emit(this.order);
    }
  }
}
