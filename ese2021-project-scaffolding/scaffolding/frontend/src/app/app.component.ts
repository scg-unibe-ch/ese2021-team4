import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';
import { User } from './models/user.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'frontend';

  loggedIn: boolean | undefined;

  user: User | undefined;

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

  ngOnInit() {
    this.checkUserStatus();
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
