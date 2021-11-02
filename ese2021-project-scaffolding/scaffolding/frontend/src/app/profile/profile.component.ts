import { Component, OnInit } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User | undefined;

  loggedIn: boolean | undefined;

  changedUser = new User(0, '', '');
  userEmail: string = '';
  firstName: string = '';
  lastName: string = '';
  street: string = '';
  houseNr: string = '';
  city: string = '';
  zipCode: string = '';
  birthday: Date = new Date();
  phoneNr: string = '';

  constructor(
    public httpClient: HttpClient,
    public userService: UserService,
    private router: Router,
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();

    console.log('profile constructor', this.user?.username, this.loggedIn);

    this.httpClient.get(environment.endpointURL + "user/" + this.user?.username).subscribe((user: any) => {
      console.log('get response', user);
      this.changedUser = new User(user.userId, user.userName, user.password);
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
    console.log('profile init', this.user, this.loggedIn);
  }

}
