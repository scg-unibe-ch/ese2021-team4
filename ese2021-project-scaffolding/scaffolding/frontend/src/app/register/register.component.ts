import { Component} from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../services/user.service";
import {environment} from "../../environments/environment";

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

    console.log('register constructor', this.user, this.loggedIn)
  }

  registerUser(): void {
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
      this.userToRegister.username = this.userToRegister.password = this.userEmail = this.firstName = this.lastName
        = this.street = this.houseNr = this.city =this.zipCode = this.phoneNr = this.emailMessage = this.usernameMessage = '';
      this.birthday = new Date();
      this.checkPassword();
      this.registrationMessage = 'Registration successful. Please log in'
    }, err => {
      if(err.error.name == 'SequelizeUniqueConstraintError'){
        if(err.error.fields[0] == 'userName') {
          this.usernameMessage = 'Username already taken: ' + this.userToRegister.username;
          this.userToRegister.username = '';
        }
        if(err.error.fields[0] == 'userEmail') {
          this.emailMessage = 'E-mail already in use: ' + this.userEmail;
          this.userEmail = ''
        }
      }
      console.log(err)
    });

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
     this.usernameMessage='You username must not contain an @-Symbol.'
    }
    else{
      this.usernameMessage=''
    }
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

}
