import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioAdmin } from './horario-admin';

describe('HorarioAdmin', () => {
  let component: HorarioAdmin;
  let fixture: ComponentFixture<HorarioAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorarioAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarioAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
