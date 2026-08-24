import { TestBed } from '@angular/core/testing';

import { CustomerAuth } from './customer-auth';

describe('CustomerAuth', () => {
  let service: CustomerAuth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerAuth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
