import { Component, OnInit} from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loggedIn: boolean | undefined;

  passwordWrong: boolean = false;
  userNameWrong: boolean = false;
  emptyUser : boolean = false;
  emptyPassword : boolean = false;


  hide : boolean = true;

  user: User | undefined;

  userToLogin: User = new User(0, '', '', false);

  endpointMsgUser: string = '';
  endpointMsgAdmin: string = '';

  constructor(
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
    public toastr: ToastrService
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
  }


  ngOnInit() : void {
  }

  loginUser(): void {
    if (this.userToLogin.username == ''){
      this.emptyUser = true;
      this.emptyPassword = false;
    }
    else if (this.userToLogin.password == ''){
      this.emptyUser = false;
      this.emptyPassword = true;
    }
    else{
      this.emptyPassword = false;
      this.emptyUser = false;

      this.httpClient.post(environment.endpointURL + "user/login", {
        userName: this.userToLogin.username,
        password: this.userToLogin.password
      })
        .subscribe((res: any) => {
        this.userToLogin.username = this.userToLogin.password = '';

        localStorage.setItem('userName', res.user.userName);
        localStorage.setItem('userToken', res.token);

        this.userService.setLoggedIn(true);
        this.userService.setUser(new User(res.user.userId, res.user.userName, res.user.password, res.user.admin));
        this.router.navigate(['/home']);
        this.toastr.success("You were successfully logged in.")

      }, (error: any ) => {
        if (error.error.message.message === 'not authorized'){
          this.passwordWrong = true;
          this.userNameWrong = false;
        } else {
          this.userNameWrong = true;
          this.passwordWrong = false;

        }

      });
    }
  }
}
