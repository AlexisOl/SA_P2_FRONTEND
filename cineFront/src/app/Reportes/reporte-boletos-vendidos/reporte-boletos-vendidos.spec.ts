import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteBoletosVendidos } from './reporte-boletos-vendidos';

describe('ReporteBoletosVendidos', () => {
  let component: ReporteBoletosVendidos;
  let fixture: ComponentFixture<ReporteBoletosVendidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteBoletosVendidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteBoletosVendidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
