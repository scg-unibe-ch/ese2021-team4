import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TodoItem } from '../../models/todo-item.model';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
})
export class TodoItemComponent {

  @Input()
  todoItem: TodoItem = new TodoItem(0, 0, '', '', false);

  @Output()
  update = new EventEmitter<TodoItem>();

  @Output()
  delete = new EventEmitter<TodoItem>();

  updateItem(): void {
    // Emits event to parent component that TodoItem got updated
    this.update.emit(this.todoItem);
  }

  deleteItem(): void {
    // Emits event to parent component that TodoItem got deleted
    this.delete.emit(this.todoItem);
  }
}
