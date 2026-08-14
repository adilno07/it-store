import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopCheckout } from './shop-checkout';

describe('ShopCheckout', () => {
  let component: ShopCheckout;
  let fixture: ComponentFixture<ShopCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopCheckout],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopCheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
