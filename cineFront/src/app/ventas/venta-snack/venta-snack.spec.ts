import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaSnack } from './venta-snack';

describe('VentaSnack', () => {
  let component: VentaSnack;
  let fixture: ComponentFixture<VentaSnack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaSnack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentaSnack);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
