import { Status } from 'src/app/models/status.model';

export class Order {

  constructor(
    public billingStatus: string,
    public status: Status,
    public orderId: number,
    public userId: number,
    public productId: number,
    public adminId: number,
    public createdDate: Date,
    public shippedDate: Date,

    public orderFirstName: string,
    public orderLastName: string,
    public orderStreet: string,
    public orderHouseNr: number,
    public orderZipCode: number,
    public orderCity: string,
    public orderPhoneNr: string,
  ){}
}
