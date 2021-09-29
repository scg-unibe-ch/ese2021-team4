export class TodoItem {

  constructor(
    public itemId: number,
    public listId: number,
    public name: string,
    public image: string,
    public done: boolean
  ) {}
}
