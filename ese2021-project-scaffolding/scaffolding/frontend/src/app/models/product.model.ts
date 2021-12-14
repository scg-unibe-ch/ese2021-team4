import { Category } from 'src/app/models/category.model';

export class Product {
  public neededRowspan: number;
  public noHtmlDescription: String;
  constructor(
    public productId: number,
    public title: string,
    public description: string,
    public price: number,
    public tags: Category,
    public images: File[]
   ) {
    this.noHtmlDescription = this.removeTags(this.description);
    this.neededRowspan = this.calculateNeededRowspan();
  }

  calculateNeededRowspan() : number {
    return 2;
  }

  removeTags(description : String) : String {
    var result = description;
    while (result.includes("<") && result.includes(">")){
      result = result.replace(/<.*?>/, "");

    }
    return result;
  }
}
