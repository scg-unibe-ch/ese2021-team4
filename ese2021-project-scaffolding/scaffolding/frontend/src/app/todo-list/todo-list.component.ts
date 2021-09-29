import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TodoList } from '../models/todo-list.model';
import { HttpClient } from '@angular/common/http';
import { TodoItem } from '../models/todo-item.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent {

  newTodoItemName: string = '';

  @Input()
  todoList: TodoList = new TodoList(0, '', []);

  @Output()
  update = new EventEmitter<TodoList>();

  @Output()
  delete = new EventEmitter<TodoList>();

  constructor(
    public httpClient: HttpClient
  ) {}

  // EVENT - Update TodoList
  updateList(): void {
    // Emits event to parent component that TodoList got updated
    this.update.emit(this.todoList);
  }

  // EVENT - Delete TodoList
  deleteList(): void {
    // Emits event to parent component that TodoList got delete
    this.delete.emit(this.todoList);
  }

  // CREATE - TodoItem
  createItem(): void {
    this.httpClient.post(environment.endpointURL + "todoitem", {
      name: this.newTodoItemName,
      done: false,
      todoListId: this.todoList.listId
    }).subscribe((item: any) => {
      this.todoList.todoItems.push(new TodoItem(item.todoItemId, item.todoListId, item.name, '', item.done));
      this.newTodoItemName = '';
    });
  }

  // READ - TodoItem
  // Not required since all TodoItems of a TodoList are provided with the list itself

  // UPDATE - TodoItem
  updateItem(todoItem: TodoItem): void {
    this.httpClient.put(environment.endpointURL + "todoitem/" + todoItem.itemId, {
      name: todoItem.name,
      done: todoItem.done,
      todoListId: todoItem.listId
    }).subscribe();
  }

  // DELETE - TodoItem
  deleteItem(todoItem: TodoItem): void {
    this.httpClient.delete(environment.endpointURL + "todoitem/" + todoItem.itemId).subscribe(() => {
      this.todoList.todoItems.splice(this.todoList.todoItems.indexOf(todoItem), 1);
    });
  }
}
