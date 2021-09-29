import { TodoItem } from './todo-item.model';

export class TodoList {

  constructor(
    public listId: number,
    public name: string,
    public todoItems: TodoItem[]
  ) {}
}
