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

  passwordWrong: boolean = false;
  userNameWrong: boolean = false;

  passwordLength: boolean = false;
  passwordUpperCharacter: boolean = false;
  passwordLowerCharacter: boolean = false;
  passwordSpecialCharacter: boolean = false;
  passwordNumber: boolean = false;

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
      this.userToRegister.username = this.userToRegister.password = this.userEmail = this.firstName = this.lastName = this.street = this.houseNr = this.city =this.zipCode = this.phoneNr ='';
      this.birthday = new Date();
    });
    
    
  }

  checkPassword(): boolean {
    console.log(this.userToRegister.password);

    this.passwordLength = this.userToRegister.password.length >= 8;
    this.passwordNumber = !!this.userToRegister.password.match(/\d/);
    this.passwordLowerCharacter = !!this.userToRegister.password.match(/[a-z]/);
    this.passwordUpperCharacter = !!this.userToRegister.password.match(/[A-Z]/);
    this.passwordSpecialCharacter = !!this.userToRegister.password.match(/[!@#$%&*()_+\-=\[\]{}\\|\/?~]/);

    return this.passwordLength && this.passwordNumber && this.passwordLowerCharacter && this.passwordUpperCharacter && this.passwordSpecialCharacter;
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


