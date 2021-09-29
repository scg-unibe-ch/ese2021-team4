import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TodoList } from './models/todo-list.model';
import { TodoItem } from './models/todo-item.model';
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

  todoLists: TodoList[] = [];

  newTodoListName: string = '';

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

  ngOnInit() {
    this.readLists();
    this.checkUserStatus();
  }

  // CREATE - TodoList
  createList(): void {
    this.httpClient.post(environment.endpointURL + "todolist", {
      name: this.newTodoListName
    }).subscribe((list: any) => {
      this.todoLists.push(new TodoList(list.todoListId, list.name, []));
      this.newTodoListName = '';
    })
  }

  // READ - TodoList, TodoItem
  readLists(): void {
    this.httpClient.get(environment.endpointURL + "todolist").subscribe((lists: any) => {
      lists.forEach((list: any) => {
        const todoItems: TodoItem[] = [];

        list.todoItems.forEach((item: any) => {
          todoItems.push(new TodoItem(item.todoItemId, item.todoListId, item.name, item.itemImage, item.done));
        });

        this.todoLists.push(new TodoList(list.todoListId, list.name, todoItems))
      });
    });
  }

  // UPDATE - TodoList
  updateList(todoList: TodoList): void {
    this.httpClient.put(environment.endpointURL + "todolist/" + todoList.listId, {
      name: todoList.name
    }).subscribe();
  }

  // DELETE - TodoList
  deleteList(todoList: TodoList): void {
    this.httpClient.delete(environment.endpointURL + "todolist/" + todoList.listId).subscribe(() => {
      this.todoLists.splice(this.todoLists.indexOf(todoList), 1);
    });
  }

  checkUserStatus(): void {
    // Get user data from local storage
    const userToken = localStorage.getItem('userToken');

    // Set boolean whether a user is logged in or not
    this.userService.setLoggedIn(!!userToken);

  }
}
