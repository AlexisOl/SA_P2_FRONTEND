import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Snacks } from './snacks';

describe('Snacks', () => {
  let component: Snacks;
  let fixture: ComponentFixture<Snacks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Snacks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Snacks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
