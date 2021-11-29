export enum Status{
  Pending= 'Pending',
  Shipped='Shipped',
  Cancelled='Cancelled',
  Faulty='Faulty'
}

export class StatusFinder {
  static status(status: string): Status{
    switch (status) {
      case 'Pending': return Status.Pending;
      case 'Shipped': return Status.Shipped;
      case 'Cancelled': return Status.Cancelled;
      default: return Status.Faulty;
    }
  }
}
