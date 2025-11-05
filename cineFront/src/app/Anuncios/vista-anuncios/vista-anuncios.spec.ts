import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaAnuncios } from './vista-anuncios';

describe('VistaAnuncios', () => {
  let component: VistaAnuncios;
  let fixture: ComponentFixture<VistaAnuncios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaAnuncios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaAnuncios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
