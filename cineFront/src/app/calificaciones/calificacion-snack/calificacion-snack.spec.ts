import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificacionSnack } from './calificacion-snack';

describe('CalificacionSnack', () => {
  let component: CalificacionSnack;
  let fixture: ComponentFixture<CalificacionSnack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionSnack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalificacionSnack);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
