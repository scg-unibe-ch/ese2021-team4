import { Component} from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  loggedIn: boolean | undefined;

  passwordLength: boolean = false;
  passwordUpperCharacter: boolean = false;
  passwordLowerCharacter: boolean = false;
  passwordSpecialCharacter: boolean = false;
  passwordNumber: boolean = false;

  usernameMessage: string = '';
  emailMessage: string = '';
  registrationMessage: string = '';

  repeatPassword: string = '';
  hide: boolean = true;

  user: User | undefined;
  userToRegister: User = new User(0, '', '', false);
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

  registerUser(): void {
    if(this.userToRegister.username == ''){
      this.usernameMessage = 'Please enter a username.'
    } else {
      this.httpClient.post(environment.endpointURL + "user/register", {
        userName: this.userToRegister.username,
        password: this.userToRegister.password,
        userEmail: this.userEmail.toLowerCase(),
        firstName: this.firstName,
        lastName: this.lastName,
        street: this.street,
        houseNr: this.houseNr,
        city: this.city,
        zipCode: this.zipCode,
        birthday: this.birthday,
        phoneNr: this.phoneNr
      }).subscribe(() => {
        //TODO: user feedback
        this.router.navigate(['/login'])
        this.toastr.success("You were successfully registered.","",{
          timeOut: 2500
        });
      }, err => {
        if (err.error.name == 'SequelizeUniqueConstraintError') {
          if (err.error.fields[0] == 'userName') {
            this.usernameMessage = 'Username already taken: ' + this.userToRegister.username;
            this.userToRegister.username = '';
          }
          if (err.error.fields[0] == 'userEmail') {
            this.emailMessage = 'E-mail already in use: ' + this.userEmail;
            this.userEmail = ''
          }
        }
      });
    }
  }

  isValidEmail(): boolean {
    return !!this.userEmail.match('@')
  }

  updateEmailMessage(): void {
    if(!this.isValidEmail()){
      this.emailMessage='Please enter a valid email address.';
    }
    else{
      this.emailMessage=''
    }
  }


  isValidUsername(): boolean{
    return !this.userToRegister.username.match('@')
  }

  updateUsernameMessage(): void {
    if(!this.isValidUsername()){
     this.usernameMessage='No @-Symbols allowed'
    }
    else{
      this.usernameMessage=''
    }
  }

  checkPassword(): boolean {

    this.passwordLength = this.userToRegister.password.length >= 8;
    this.passwordNumber = !!this.userToRegister.password.match(/\d/);
    this.passwordLowerCharacter = !!this.userToRegister.password.match(/[a-z]/);
    this.passwordUpperCharacter = !!this.userToRegister.password.match(/[A-Z]/);
    this.passwordSpecialCharacter = !!this.userToRegister.password.match(/[!@#$%&*()_+\-=\[\]{}\\|\/?~]/);

    return this.passwordLength && this.passwordNumber && this.passwordLowerCharacter && this.passwordUpperCharacter && this.passwordSpecialCharacter;
  }

  passwordRepeatCheck(): boolean {
    console.log(this.userToRegister.password);
    console.log("repeat"+this.repeatPassword);

    return !(this.userToRegister.password === this.repeatPassword && this.repeatPassword !== '');
  }

}
