import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviesCrud } from './movies-crud';

describe('MoviesCrud', () => {
  let component: MoviesCrud;
  let fixture: ComponentFixture<MoviesCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoviesCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
