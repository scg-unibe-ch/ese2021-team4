import { Status } from 'src/app/models/status.model';

export class Order {

  constructor(
    public status: Status,
    public orderId: number,
    public userId: number,
    public productId: number,
    public adminId: number,
    public createdDate: Date,
    public shippedDate: Date,
  ){}
}
