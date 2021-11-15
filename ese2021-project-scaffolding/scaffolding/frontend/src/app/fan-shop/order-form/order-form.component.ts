import { Component, OnInit } from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Product } from 'src/app/models/product.model';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {

  user: User|undefined;

  productId: number = 0;

  loggedIn: boolean|undefined;

  constructor(
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.params.subscribe(params => {
      if(!isNaN(+params.id)) {
        this.productId = +params.id;
      }
    });
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();

  }


  ngOnInit(): void {
  }


  createOrder(): void {
    this.httpClient.post(environment.endpointURL + "order", {
      status: "Pending",
      productId: this.productId,
      userId: this.user?.userId,
      adminId: 0
    });
    this.router.navigate(['/fan-shop'])
  }
}
