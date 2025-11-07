import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresosAnuncios } from './ingresos-anuncios';

describe('IngresosAnuncios', () => {
  let component: IngresosAnuncios;
  let fixture: ComponentFixture<IngresosAnuncios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresosAnuncios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresosAnuncios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
