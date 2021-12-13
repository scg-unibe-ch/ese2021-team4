import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loggedIn: boolean | undefined;
  user: User | undefined;

  timeout: number = 4000;
  index : number = 0;
  words : String[] = [ "favourite spots", "secret tips", "magic moments", "traditional restaurants", "lovely views", "tasty brunch", "fancy bars", "cozy coffeeshops"];
  current = this.words[this.index];

  constructor(
    public httpClient: HttpClient,
    public userService: UserService
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
  }

  //on change animate vo unger

  ngOnInit(): void {
    this.checkUserStatus();
    this.index = 0;
    setInterval(() => {
      this.setSlogan();
    }, this.timeout);
  }

  setSlogan(): void {
    this.index = ((this.index + 1) % this.words.length);
    this.current = this.words[this.index];
  }

  checkUserStatus(): void {
    // Get user data from local storage
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    // Get user with currently stored username from database
    if(!!userName) {
      this.httpClient.get(environment.endpointURL + "user/" + userName).subscribe((user: any) => {
        this.userService.setUser(new User(user.userId, user.userName, user.password, user.admin))
      });
    }
    // Set boolean whether a user is logged in or not
    this.userService.setLoggedIn(!!userToken);
  }

  logoutUser(): void {
    localStorage.removeItem('userName');
    localStorage.removeItem('userToken');

    this.userService.setLoggedIn(false);
    this.userService.setUser(undefined);
  }
}
