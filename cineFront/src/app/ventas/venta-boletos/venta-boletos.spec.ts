import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaBoletos } from './venta-boletos';

describe('VentaBoletos', () => {
  let component: VentaBoletos;
  let fixture: ComponentFixture<VentaBoletos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaBoletos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentaBoletos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
