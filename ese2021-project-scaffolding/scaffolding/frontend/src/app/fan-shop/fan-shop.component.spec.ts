import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanShopComponent } from './fan-shop.component';

describe('FanShopComponent', () => {
  let component: FanShopComponent;
  let fixture: ComponentFixture<FanShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanShopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
