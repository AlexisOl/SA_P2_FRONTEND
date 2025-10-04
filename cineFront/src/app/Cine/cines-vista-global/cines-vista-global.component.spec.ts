import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CinesVistaGlobalComponent } from './cines-vista-global.component';

describe('CinesVistaGlobalComponent', () => {
  let component: CinesVistaGlobalComponent;
  let fixture: ComponentFixture<CinesVistaGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CinesVistaGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CinesVistaGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
