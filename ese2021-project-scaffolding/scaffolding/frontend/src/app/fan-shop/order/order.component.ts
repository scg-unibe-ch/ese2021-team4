import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order.model';
import {HttpClient} from "@angular/common/http";
import {UserService} from "src/app/services/user.service";
import {User} from "src/app//models/user.model";
import { Status } from 'src/app/models/status.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  user: User|undefined;

  loggedIn: boolean|undefined;

  constructor(
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

  updateOrder(): void {
    // Emits event to parent component that Order got updated
    this.update.emit(this.order);
  }
}
