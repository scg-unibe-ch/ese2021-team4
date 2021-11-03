import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

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
