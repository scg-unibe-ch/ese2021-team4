import { HttpClient } from '@angular/common/http';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  loggedIn: boolean | undefined;

  user: User | undefined;

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
  ngOnInit(): void {
  }

  @Input()
  post: Post = new Post(0, '', 0, '', 0, '');

  @Output()
    update = new EventEmitter<Post>();

  @Output()
    delete = new EventEmitter<Post>();

    updatePost(): void {
      // Emits event to parent component that TodoItem got updated
      this.update.emit(this.post);
    }

    deletePost(): void {
      // Emits event to parent component that TodoItem got deleted
      this.delete.emit(this.post);
    }
}
