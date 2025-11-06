import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesGenerales } from './reportes-generales';

describe('ReportesGenerales', () => {
  let component: ReportesGenerales;
  let fixture: ComponentFixture<ReportesGenerales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesGenerales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesGenerales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
