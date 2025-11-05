import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificacionSala } from './calificacion-sala';

describe('CalificacionSala', () => {
  let component: CalificacionSala;
  let fixture: ComponentFixture<CalificacionSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionSala]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalificacionSala);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
