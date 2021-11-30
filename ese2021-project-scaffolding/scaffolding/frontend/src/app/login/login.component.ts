import { Component} from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loggedIn: boolean | undefined;

  passwordWrong: boolean = false;
  userNameWrong: boolean = false;


  user: User | undefined;

  userToLogin: User = new User(0, '', '', false);

  endpointMsgUser: string = '';
  endpointMsgAdmin: string = '';

  constructor(
    private router: Router,
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

  loginUser(): void {
    if (this.userToLogin.username == ''){
      document.getElementById("emptyUser")!.style.visibility='visible';
    }
    else if (this.userToLogin.password == ''){
      document.getElementById("emptyUser")!.style.visibility='hidden';
      document.getElementById("emptyPassword")!.style.visibility='visible';
    }
    else{
      document.getElementById("emptyUser")!.style.visibility='hidden';
      document.getElementById("emptyPassword")!.style.visibility='hidden';
    this.httpClient.post(environment.endpointURL + "user/login", {
      userName: this.userToLogin.username,
      password: this.userToLogin.password
    }).subscribe((res: any) => {
      this.userToLogin.username = this.userToLogin.password = '';

      localStorage.setItem('userName', res.user.userName);
      localStorage.setItem('userToken', res.token);

      this.userService.setLoggedIn(true);
      this.userService.setUser(new User(res.user.userId, res.user.userName, res.user.password, res.user.admin));
      this.router.navigate(['/login/feedback']);

    }, (error: any ) => {
      if (error.error.message.message === 'not authorized'){
        this.passwordWrong = true;
        this.userNameWrong = false;
      } else {
        this.userNameWrong = true;
        this.passwordWrong = false;

      }

    });
  }}

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
