import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificacionPelicula } from './calificacion-pelicula';

describe('CalificacionPelicula', () => {
  let component: CalificacionPelicula;
  let fixture: ComponentFixture<CalificacionPelicula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionPelicula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalificacionPelicula);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
