import { Component, OnInit } from '@angular/core';
import {User} from "../../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  user: User | undefined;
  loggedIn: boolean | undefined;

  userList: User[] = [];

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
    this.httpClient.get(environment.endpointURL + 'user/').subscribe((users:any) => {
      users.forEach((user:any) => {
        this.userList.push(new User(user.userId, user.userName, user.password, user.admin));
      });
    })
  }

  removeAdmin(admin: User): void {

  }

  promoteAdmin(user: User): void {

  }

}
