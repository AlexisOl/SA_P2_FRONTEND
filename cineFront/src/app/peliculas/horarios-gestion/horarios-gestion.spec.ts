import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosGestion } from './horarios-gestion';

describe('HorariosGestion', () => {
  let component: HorariosGestion;
  let fixture: ComponentFixture<HorariosGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosGestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorariosGestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
