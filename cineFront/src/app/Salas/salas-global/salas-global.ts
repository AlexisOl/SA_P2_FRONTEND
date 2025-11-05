import { cine, MatrizAsientos, sala, ValidacionesSala } from '@/models/Cine';
import { CineServiceService } from '@/services/cine-service.service';
import { SalaServicio } from '@/services/sala-servicio.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { Button, ButtonModule } from 'primeng/button';
import { Card, CardModule } from 'primeng/card';
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
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'app-salas-global',
  imports: [Card, Button, FormsModule,
    SplitterModule, FieldsetModule, SelectModule, TagModule,
    ScrollPanelModule, CardModule, ButtonModule, CommonModule,
    CurrencyPipe, AccordionModule, AvatarModule, BadgeModule,RouterLink,Checkbox,
    PanelModule, PaginatorModule, DialogModule, FileUploadModule, RatingModule],
  templateUrl: './salas-global.html',
  styleUrl: './salas-global.scss',
})
export class SalasGlobal implements OnInit{

  listadoSalas: any[] = []
  cineEspecifico:any
  idCine!: string
  SalasServicio = inject(SalaServicio)
  CineServicio = inject(CineServiceService)

  visible: boolean = false;
  visibleNuevaSala: boolean = false;
  visibleReservacion: boolean = false;
  listadoComentarios:[] =[]

  //saLAS
  nombre: string = ''
  filas: number = 0
  columnas: number = 0
  tipoSala:string=''

  validar_comnentarios:boolean = true
  validar_calificaciones:boolean = true
  opcionesSala = [
    { label: 'NORMAL', value: 'NORMAL' },
  { label: 'INFANTIL', value: 'INFANTIL' },
  { label: 'VIP', value: 'VIP' }
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

    this.SalasServicio.listarSalasId(this.idCine).subscribe((next: any) => {
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
    this.visibleNuevaSala = true
  }

  



  guardarSala() {

    const nuevaValidacion: ValidacionesSala = {
      validar_comnentarios: this.validar_comnentarios,
      validar_calificaciones: this.validar_calificaciones,
      visible: true
    }
    const nuevaMatriz: MatrizAsientos ={
      filas: this.filas,
      columnas: this.columnas
    }

    const nuevaSala: sala = {
      nombre: this.nombre,
      matrizAsientos: nuevaMatriz,
      validacionesSala: nuevaValidacion,
      tipoSala: this.tipoSala,
      idCine: this.idCine
    }


    this.SalasServicio.crearSalaHotel(nuevaSala).subscribe(
      (next) => {
        console.log(next);

      }, (error) => {
        console.log(error);

      }
    )
  }
}
