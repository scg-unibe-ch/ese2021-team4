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
    var titleLines = Math.min(2, Math.ceil(this.title.length / 100));
    var descriptionLines = Math.min(2 ,Math.ceil(this.noHtmlDescription.length / 100));
    var minimumRows = 1;
    return titleLines + descriptionLines + minimumRows;
  }

  removeTags(description : String) : String {
    var result = description;
    while (result.includes("<") && result.includes(">")){
      result = result.replace(/<.*?>/, "");

    }
    return result;
  }
}
