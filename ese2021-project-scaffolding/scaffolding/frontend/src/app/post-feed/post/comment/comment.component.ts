import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../services/user.service";
import {User} from "../../../models/user.model";
import {TodoItem} from "../../../models/todo-item.model";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  user: User|undefined;

  loggedIn: boolean|undefined;

  constructor(
    public userService: UserService
  ) {
    // Listen for changes
    userService.loggedIn$.subscribe(res => this.loggedIn = res);
    userService.user$.subscribe(res => this.user = res);

    // Current value
    this.loggedIn = userService.getLoggedIn();
    this.user = userService.getUser();
  }

  ngOnInit(): void {
  }

  @Input()
  comment: Comment = new Comment(0, 0, 0, '', 0, 0, new Date());

  @Output()
  update = new EventEmitter<Comment>();

  @Output()
  delete = new EventEmitter<Comment>();

  updateComment(): void {
    // Emits event to parent component that TodoItem got updated
    this.update.emit(this.comment);
  }

  deleteComment(): void {
    // Emits event to parent component that TodoItem got deleted
    this.delete.emit(this.comment);
  }

}
