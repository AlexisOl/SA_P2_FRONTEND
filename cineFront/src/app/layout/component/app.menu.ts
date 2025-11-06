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
                  { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/home'] },
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
                        label: 'Crear cine',
                        icon: 'pi pi-fw pi-plus-circle',
                        routerLink: ['/home/uikit/input']
                      },
                      {
                        label: 'Configuracion',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/home/uikit/overlay']
                      }
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

            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/home/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/home/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/home/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/home/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/home/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/home/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/home/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/home/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/home/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/home/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/home/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/home/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/home/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/home/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/home/uikit/misc'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/home/pages'],
                items: [

                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/home/pages/crud']
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/home/pages/notfound']
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/home/pages/empty']
                    }
                ]
            },


        ];
    }
}
