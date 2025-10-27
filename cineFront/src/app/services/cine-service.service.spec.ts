import { TestBed } from '@angular/core/testing';

import { CineServiceService } from './cine-service.service';

describe('CineServiceService', () => {
  let service: CineServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CineServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
