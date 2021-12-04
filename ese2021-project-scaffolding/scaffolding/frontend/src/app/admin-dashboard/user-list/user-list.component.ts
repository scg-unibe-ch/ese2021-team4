import { Component, OnInit } from '@angular/core';
import {User} from "../../models/user.model";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../services/user.service";
import {environment} from "../../../environments/environment";
import { Router } from '@angular/router';
import {ConfirmBoxInitializer, DialogLayoutDisplay} from "@costlydeveloper/ngx-awesome-popup";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  user: User | undefined;
  loggedIn: boolean | undefined;

  userList: User[] = [];

  constructor(
    private router: Router,
    public httpClient: HttpClient,
    public userService: UserService,
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => {this.user = res});

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser(); }

  ngOnInit(): void {
    this.httpClient.get(environment.endpointURL + 'user/').subscribe((users:any) => {
      users.forEach((user:any) => {
        this.userList.push(new User(user.userId, user.userName, user.password, user.admin));
      });
    })
  }

  confirmPromoteAdmin(admin: User): void {
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle('You are about to promote a user to admin.');
    confirmBox.setMessage('Do you want to proceed?');
    confirmBox.setButtonLabels('YES', 'NO');

    // Choose layout color type
    confirmBox.setConfig({
      LayoutType: DialogLayoutDisplay.WARNING// SUCCESS | INFO | NONE | DANGER | WARNING
    });
    // Simply open the popup and listen which button is clicked
    confirmBox.openConfirmBox$().subscribe(resp => {

      if (resp.ClickedButtonID=='yes'){
        this.promoteAdmin(admin)
      }
    });
  }
  confirmRemoveAdmin(admin: User): void{
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle('You are about to revoke admin rights.');
    confirmBox.setMessage('Do you want to proceed?');
    confirmBox.setButtonLabels('YES', 'NO');

    // Choose layout color type
    confirmBox.setConfig({
      LayoutType: DialogLayoutDisplay.WARNING// SUCCESS | INFO | NONE | DANGER | WARNING
    });
    // Simply open the popup and listen which button is clicked
    confirmBox.openConfirmBox$().subscribe(resp => {

      if (resp.ClickedButtonID=='yes'){
        this.removeAdmin(admin)
      }
    });
  }
  removeAdmin(admin: User): void {
    admin.isAdmin = false;
    this.httpClient.put(environment.endpointURL + 'user/' + admin.userId, {admin: false}).subscribe(() => {
    })

    if(this.user?.userId == admin.userId)
    {
      this.router.navigate(['/home']);
    }
  }

  promoteAdmin(user: User): void {
    user.isAdmin = true;
    this.httpClient.put(environment.endpointURL + 'user/' + user.userId, {admin: true}).subscribe(() => {
    })
  }
}
