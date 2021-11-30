import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {User} from "../models/user.model";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  user: User | undefined;
  loggedIn: boolean | undefined;

  constructor(
    public httpClient: HttpClient,
    public userService: UserService,
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser(); }

  ngOnInit(): void {
  }

}
