import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Menu',
                items: [
                 // { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/home'] },
                  {
                    label: 'Cine',
                    icon: 'pi pi-fw pi-video',
                    items: [
                      {
                        label: 'Lista de cines',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/home/cine']
                      },
                      {
                        label: 'Asientos',
                        icon: 'pi pi-fw pi-th-large',
                        routerLink: ['/home/ventas/asientos']
                      },

                    ]
                  },
                  {
    label: 'Anuncios',
                    icon: 'pi pi-address-book',
                    items: [
                      {
                        label: 'Lista de anuncios',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/home/anuncios']
                      },

                    ]
                  },
                                  {
    label: 'Reportes',
                    icon: 'pi pi-chart-bar',
                    items: [
                      {
                        label: 'Reportes generales',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/home/reportes']
                      },

                    ]
                  },
                  {
                    label: 'Calificaciones',
                    icon: 'pi pi-fw pi-star-fill',
                    items: [
                      {
                        label: 'Calificaciones de Salas',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/home/calificacion/sala']
                      },
                      {
                        label: 'Calificaciones de Snacks',
                        icon: 'pi pi-fw pi-shopping-bag',
                        routerLink: ['/home/calificacion/snack']
                      },
                      {
                        label: 'Calificaciones de Películas',
                        icon: 'pi pi-fw pi-video',
                        routerLink: ['/home/calificacion/pelicula']
                      }
                    ]
                  },

                  {
                    label: 'Promociones',
                    icon: 'pi pi-fw pi-gift',
                    routerLink: ['/home/promocion']
                  },
                  {
                    label: 'Snacks',
                    icon: 'pi pi-fw pi-shopping-bag',
                    routerLink: ['/home/ventas/snack']
                  },
                  {
                    label: 'Mis boletos',
                    icon: 'pi pi-fw pi-ticket',
                    routerLink: ['/home/ventas/mis-boletos']
                  },
                  {
  label: 'Películas',
  icon: 'pi pi-fw pi-video', // 🎬 Ícono principal del módulo de películas
  items: [
    {
      label: 'Gestión de películas',
      icon: 'pi pi-fw pi-film', // 🎞️ Representa una película
      routerLink: ['/peliculas']
    },
    {
      label: 'Categorías',
      icon: 'pi pi-fw pi-tags', // 🏷️ Representa categorías o etiquetas
      routerLink: ['/peliculas/categorias']
    },
    {
      label: 'Gestión de funciones',
      icon: 'pi pi-fw pi-calendar-clock', // 🕒 Representa horarios o funciones
      routerLink: ['/peliculas/horarios']
    },
    {
      label: 'Cartelera',
      icon: 'pi pi-fw pi-ticket', // 🎟️ Representa la cartelera o boletos
      routerLink: ['/peliculas/listado']
    }
  ]
},
{
  label: 'Usuario',
  icon: 'pi pi-fw pi-user',
  items: [
    {
      label: 'Gestión de usuarios',
      icon: 'pi pi-fw pi-users',
      routerLink: ['/user/register']
    },
    {
      label: 'Mi perfil',
      icon: 'pi pi-fw pi-id-card',
      routerLink: ['/user/perfil']
    }
  ]
}

                ]
            },




        ];
    }
}
