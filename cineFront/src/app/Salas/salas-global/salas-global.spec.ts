import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalasGlobal } from './salas-global';

describe('SalasGlobal', () => {
  let component: SalasGlobal;
  let fixture: ComponentFixture<SalasGlobal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalasGlobal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalasGlobal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
