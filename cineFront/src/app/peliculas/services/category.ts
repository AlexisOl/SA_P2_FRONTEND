// src/app/service/category.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  nombre: string;
  activa: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryCreateDto = Pick<Category, 'nombre' | 'activa'>;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly BASE = 'http://localhost:8082/api/v1/categorias'; // <-- ajusta a tu gateway real

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.BASE);
  }

  create(body: CategoryCreateDto): Observable<Category> {
    return this.http.post<Category>(this.BASE, body);
  }

  update(id: string, body: CategoryCreateDto): Observable<Category> {
    return this.http.put<Category>(`${this.BASE}/${id}`, body);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  activate(id: string) {
    return this.http.post<void>(`${this.BASE}/${id}/activar`, {});
  }

  deactivate(id: string) {
    return this.http.post<void>(`${this.BASE}/${id}/desactivar`, {});
  }
}