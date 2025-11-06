import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePeliculasPorSala } from './reporte-peliculas-por-sala';

describe('ReportePeliculasPorSala', () => {
  let component: ReportePeliculasPorSala;
  let fixture: ComponentFixture<ReportePeliculasPorSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportePeliculasPorSala]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportePeliculasPorSala);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
