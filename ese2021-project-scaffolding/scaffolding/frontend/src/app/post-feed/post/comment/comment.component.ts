import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';
import {UserService} from "../../../services/user.service";
import {User} from "../../../models/user.model";
import {ConfirmationAsker} from "../../../models/confirmation-asker";

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
  comment!: Comment;

  @Output()
  update = new EventEmitter<Comment>();

  @Output()
  delete = new EventEmitter<Comment>();

  confirmDeleteComment(): void{
    ConfirmationAsker.confirm('Are you sure you want to delete this comment?')
      .then(confirmed => {
        if(confirmed){
          this.deleteComment();
        }
      })
  }
  deleteComment(): void {
    this.delete.emit(this.comment);
  }

}
