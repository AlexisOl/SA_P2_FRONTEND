import { TestBed } from '@angular/core/testing';

import { AlertasServicioService } from './alertas-servicio.service';

describe('AlertasServicioService', () => {
  let service: AlertasServicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertasServicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
