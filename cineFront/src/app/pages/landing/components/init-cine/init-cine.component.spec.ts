import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitCineComponent } from './init-cine.component';

describe('InitCineComponent', () => {
  let component: InitCineComponent;
  let fixture: ComponentFixture<InitCineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitCineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitCineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
