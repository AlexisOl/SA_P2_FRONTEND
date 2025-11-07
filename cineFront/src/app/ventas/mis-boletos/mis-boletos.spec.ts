import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisBoletos } from './mis-boletos';

describe('MisBoletos', () => {
  let component: MisBoletos;
  let fixture: ComponentFixture<MisBoletos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisBoletos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisBoletos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
