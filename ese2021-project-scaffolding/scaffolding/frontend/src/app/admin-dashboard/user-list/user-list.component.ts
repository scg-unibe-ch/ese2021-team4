import { Component, OnInit } from '@angular/core';
import {User} from "../../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";
import { Router } from '@angular/router';

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
    private router: Router,
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
    admin.isAdmin = false;
    this.httpClient.put(environment.endpointURL + 'user/' + admin.userId, {admin: false}).subscribe(() => {
    })

    if(this.user?.userId == admin.userId)
    {
      this.router.navigate(['/home']);
    }
  }

  promoteAdmin(user: User): void {
    user.isAdmin = true;
    this.httpClient.put(environment.endpointURL + 'user/' + user.userId, {admin: true}).subscribe(() => {
    })
  }
}
