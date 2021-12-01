import { Component, OnInit } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";

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
  birthday: string = '';
  phoneNr: string = '';

  updateMessage: string = '';
  emailMessage: string = '';
  usernameMessage: string = '';

  constructor(
    public httpClient: HttpClient,
    public userService: UserService,
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

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
      this.birthday = user.birthday.substr(0, 10);
      this.phoneNr = user.phoneNr;
    });
  }

  ngOnInit(): void {
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
}
