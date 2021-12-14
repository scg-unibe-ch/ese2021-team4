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

  timeout: number = 2500;

  index : number = 0;
  words : String[] = [ "favourite spots", "secret tips", "magic moments", "traditional restaurants", "lovely views", "tasty brunch", "fancy bars", "cozy coffeeshops"];
  current = this.words[this.index];

  weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
 
  forecastDescs : String[] = [];
  forecastImgs : String[] = [];
  forecastDay : String[] = ['','','','','','',''];
  forecastTempMin : Number[] = [];
  forecastTempMax : Number[] = [];

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

  ngOnInit(): void {
    this.index = Math.floor(Math.random()*this.words.length);
    this.checkUserStatus();
    setInterval(() => {
      this.setSlogan();
    }, this.timeout);
    this.displayWeather();
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

  displayWeather(): void {
    fetch("http://api.openweathermap.org/data/2.5/onecall?lat=46.94809&lon=7.44744&units=metric&lang=en&appid=d13b9c393d5f9b8fbd28fcdb4eccb75e").then(res => res.json()).then((res: any) => {
      this.forecastDescs.push(res.current.weather[0].description);
      this.forecastImgs.push("http://openweathermap.org/img/w/" + res.current.weather[0].icon + ".png"); 
      this.forecastTempMax.push(Math.round(res.current.temp));
      this.forecastTempMin.push(0);
      this.forecastDay[0] = this.weekdays[new Date(res.daily[0].dt * 1000).getDay()];
      var i = 1; 
      while(i < Math.min(6, res.daily.length)){
        this.forecastDescs.push(res.daily[i].weather[0].description);
        this.forecastImgs.push("http://openweathermap.org/img/w/" + res.daily[i].weather[0].icon + ".png"); 
        this.forecastTempMax.push(Math.round(res.daily[i].temp.max));
        this.forecastTempMin.push(Math.round(res.daily[i].temp.min));
        this.forecastDay[i] = this.weekdays[new Date(res.daily[i].dt * 1000).getDay()];
        i++;
      };
    });
  }
}
