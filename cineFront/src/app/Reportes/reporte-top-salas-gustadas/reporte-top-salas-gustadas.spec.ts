import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTopSalasGustadas } from './reporte-top-salas-gustadas';

describe('ReporteTopSalasGustadas', () => {
  let component: ReporteTopSalasGustadas;
  let fixture: ComponentFixture<ReporteTopSalasGustadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteTopSalasGustadas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTopSalasGustadas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
