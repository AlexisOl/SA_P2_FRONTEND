// movies-grid.component.ts
import { Component, OnInit, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService } from '@/peliculas/services/movie.service';
import { Movie } from '@/interfaces/movie.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
  ],
  templateUrl: './movie-list.html',
})
export class MoviesListComponent implements OnInit {
  loading = true;
  q = '';

  private _all = signal<Movie[]>([]);
  filtered = signal<Movie[]>([]);
  constructor(
    private moviesSvc: MovieService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.moviesSvc.list().subscribe({
      next: (list) => {
        this._all.set(list ?? []);
        this.applyFilter(); // inicial
        this.loading = false;
      },
      error: () => {
        this._all.set([]);
        this.filtered.set([]);
        this.loading = false;
      },
    });

    effect(() => {
      this._all();
      this.applyFilter();
    });
  }

  openMovie(m: Movie) {
    console.log('navigate xd');

    this.router.navigate(['/peliculas', m.id]);
  }

  
  // Normaliza
  private norm(s: unknown) {
    return String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }

  // Aplica filtro localmente
  applyFilter() {
    const term = this.norm(this.q);
    const all = this._all();

    if (!term) {
      this.filtered.set(all);
      return;
    }

    const out = all.filter((m) => {
      const hay = [
        this.norm(m.titulo),
        this.norm(m.director),
        this.norm(m.clasificacion),
        this.norm((m.cast ?? []).join(' ')),
      ].join(' ');
      return hay.includes(term);
    });

    this.filtered.set(out);
  }

  // Handler del input (si quieres “debounce”, ver nota al final)
  onSearch(q: string) {
    this.q = q;
    this.applyFilter();
  }

  // util para imagen
  posterOf(m: Movie) {
    return m.posters?.[0] || 'assets/placeholder-poster.jpg';
  }
}
