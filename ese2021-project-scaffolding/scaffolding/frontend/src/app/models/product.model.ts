import { Category } from 'src/app/models/category.model';

export class Product {

  constructor(
    public productId: number,
    public title: string,
    public description: string,
    public price: number,
    public tags: Category,
    public images: File[]
   ) {}
}
