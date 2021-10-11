import { Component } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

  loggedIn: boolean | undefined;

  wrongPassword: boolean = false;
  wrongLogin: boolean = false;
  passwordTooShort: boolean = false;
  noSpecialChar: boolean = false;
  noLowerCase: boolean = false;
  noUpperCase: boolean = false;
  noNumbers: boolean = false;

  user: User | undefined;

  userToRegister: User = new User(0, '', '');
  userEmail: string = '';
  firstName: string = '';
  lastName: string = '';
  street: string = '';
  houseNr: string = '';
  city: string = '';
  zipCode: string = '';
  birthday: Date = new Date();
  phoneNr: string = '';

  userToLogin: User = new User(0, '', '');

  endpointMsgUser: string = '';
  endpointMsgAdmin: string = '';

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

  registerUser(): void {
    if(this.checkPassword(this.userToRegister.password)){
      
      this.httpClient.post(environment.endpointURL + "user/register", {
        userName: this.userToRegister.username,
        password: this.userToRegister.password,
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
        this.userToRegister.username = this.userToRegister.password = '';
      });
    }
    
  }

  checkPassword(password: string): boolean {
    this.noSpecialChar = this.noUpperCase = this.noLowerCase = this.passwordTooShort = this.noNumbers = false;
    
    if(password.length < 8) {this.passwordTooShort = true; return false;}
    
    var specialchar = /[!@#$%&*()_+\-=\[\]{}\\|\/?]/;
    var uppercasechar = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/;
    var lowercasechar = /[abcdefghijklmnopqrstuvwxyz]/;
    var numbers = /[1234567890]/;

    if(!specialchar.test(password)){this.noSpecialChar = true; return false;}
    if(!uppercasechar.test(password)){this.noUpperCase = true; return false;}
    if(!lowercasechar.test(password)){this.noLowerCase = true; return false;}
    if(!numbers.test(password)){this.noNumbers = true; return false;}

    return true;
  }

  loginUser(): void {
    this.httpClient.post(environment.endpointURL + "user/login", {
      userName: this.userToLogin.username,
      password: this.userToLogin.password
    }).subscribe((res: any) => {
      this.userToLogin.username = this.userToLogin.password = '';

      localStorage.setItem('userName', res.user.userName);
      localStorage.setItem('userToken', res.token);

      this.userService.setLoggedIn(true);
      this.userService.setUser(new User(res.user.userId, res.user.userName, res.user.password));
    }, error => {
      if (error.error.message.message == "not authorized") {
        this.wrongPassword = true;
      } else {
        this.wrongLogin = true;
      }
    });
  }

  logoutUser(): void {
    localStorage.removeItem('userName');
    localStorage.removeItem('userToken');

    this.userService.setLoggedIn(false);
    this.userService.setUser(undefined);
  }

  accessUserEndpoint(): void {
    this.httpClient.get(environment.endpointURL + "secured").subscribe(() => {
      this.endpointMsgUser = "Access granted";
    }, () => {
      this.endpointMsgUser = "Unauthorized";
    });
  }

  accessAdminEndpoint(): void {
    this.httpClient.get(environment.endpointURL + "admin").subscribe(() => {
      this.endpointMsgAdmin = "Access granted";
    }, () => {
      this.endpointMsgAdmin = "Unauthorized";
    });
  }
}
