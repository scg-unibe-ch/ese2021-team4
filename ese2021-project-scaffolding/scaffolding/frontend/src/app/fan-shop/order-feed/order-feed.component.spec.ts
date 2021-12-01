import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFeedComponent } from './order-feed.component';

describe('OrderFeedComponent', () => {
  let component: OrderFeedComponent;
  let fixture: ComponentFixture<OrderFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderFeedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
