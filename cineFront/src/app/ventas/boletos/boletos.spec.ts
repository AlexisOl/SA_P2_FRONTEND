import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Boletos } from './boletos';

describe('Boletos', () => {
  let component: Boletos;
  let fixture: ComponentFixture<Boletos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boletos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Boletos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
