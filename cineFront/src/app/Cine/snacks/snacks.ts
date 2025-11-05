import { ValidacionesSala, MatrizAsientos, sala, snacks } from '@/models/Cine';
import { AlertaServiceService } from '@/services/alerta-service.service';
import { CineServiceService } from '@/services/cine-service.service';
import { SalaServicio } from '@/services/sala-servicio.service';
import { SnacksService } from '@/services/snacks-service.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { Button, ButtonModule } from 'primeng/button';
import { Card, CardModule } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { RatingModule } from 'primeng/rating';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectModule } from 'primeng/select';
import { SplitterModule } from 'primeng/splitter';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-snacks',
  imports: [Card, Button, FormsModule,
    SplitterModule, FieldsetModule, SelectModule, TagModule,
    ScrollPanelModule, CardModule, ButtonModule, CommonModule,
    CurrencyPipe, AccordionModule, AvatarModule, BadgeModule,RouterLink,Checkbox,
    PanelModule, PaginatorModule, DialogModule, FileUploadModule, RatingModule],
  templateUrl: './snacks.html',
  styleUrl: './snacks.scss',
})
export class Snacks implements OnInit{

  listadoSnacks: any[] = []
  cineEspecifico:any
  idCine!: string
  SnacksServicio = inject(SnacksService)
  CineServicio = inject(CineServiceService)
  AlertaServicio = inject(AlertaServiceService)

  visible: boolean = false;
  visibleNuevoSnack: boolean = false;
  visibleReservacion: boolean = false;
  listadoComentarios:[] =[]

  //snacks
  nombre: string = ''
  precio: number = 0
  tipoSnack:string=''

  validar_comnentarios:boolean = true
  validar_calificaciones:boolean = true
  opcionesSnacks = [
    { label: 'BEBIDA', value: 'BEBIDA' },
  { label: 'ANTOJITO', value: 'ANTOJITO' },
  { label: 'DULCERIA', value: 'DULCERIA' }
  ]


  //edicion
  id_cineEditar!:String|undefined
  cineEditar = signal<any>([])


  // paginator
  // para el paginator
  first: number = 0;
  rows: number = 6;
  paginatedItems: any[] = [];
  items: any[] = []





  constructor(private route: ActivatedRoute) { }

  
  ngOnInit(): void {
    this.idCine = this.route.snapshot.paramMap.get('id')!;

    this.CineServicio.listarCineEspecifico(this.idCine).subscribe(
      (next: any) => {
        console.log(next);
        this.cineEspecifico = next
      }
    )

    this.SnacksServicio.listarSnacksId(this.idCine).subscribe((next: any) => {
        console.log(next);
        this.items = next
        // this.items.forEach(p => {
        //   this.promocionRestauranteServicio.obtenerPromocionEspecifica(p.id).subscribe({
        //     next: (promo: any) => {
        //       p.promocion = promo;
        //     },
        //     error: () => {
        //       p.promocion = null
        //     }
        //   })

        // }
        // )
        this.updatePaginatedItems()
      }
    )
  }


  updatePaginatedItems() {
    this.paginatedItems = this.items.slice(this.first, this.first + this.rows);
  }

  cambiarPagina(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaginatedItems();
  }

  showDialog(id: String|undefined) {
    this.visible = true;
    //this.listadoComentarios = []


  }


  verDialogoNuevaSala() {
    this.visibleNuevoSnack = true
  }

  



  guardarSala() {

    const nuevaSnack: snacks = {
      nombre: this.nombre,
      precio: this.precio,
      tipo: this.tipoSnack,
      idCine: this.idCine
    }


    this.SnacksServicio.crearSnackCine(nuevaSnack).subscribe(
     (next) => {
        this.visibleNuevoSnack=false
             this.AlertaServicio.generacionAlerta(
        'Éxito', 'el snack fue ingresado correctamente.', 'success'
        )

      }, (error) => {
        this.visibleNuevoSnack=false

           this.AlertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al generar el nuevo snack.', 'error'
        )

      }
    )
  }
}
