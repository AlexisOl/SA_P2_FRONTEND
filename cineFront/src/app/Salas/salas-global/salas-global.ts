import { bloqueoAnuncio, cine, MatrizAsientos, sala, ValidacionesSala } from '@/models/Cine';
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
import { GalleriaModule } from 'primeng/galleria';
import { PropiedadAnuncioServiceService } from '@/services/propiedad-anuncio-service.service';
import { AlertaServiceService } from '@/services/alerta-service.service';
import { BloqueoCineServiceService } from '@/services/bloqueo-cine-service.service';

@Component({
  selector: 'app-salas-global',
  imports: [Card, Button, FormsModule,
    SplitterModule, FieldsetModule, SelectModule, TagModule,
    ScrollPanelModule, CardModule, ButtonModule, CommonModule,GalleriaModule,
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
  propiedadAnuncioServicio = inject(PropiedadAnuncioServiceService)
  alertaServicio = inject(AlertaServiceService)
  bloqueoServicio = inject(BloqueoCineServiceService)

  visible: boolean = false;
  visibleNuevaSala: boolean = false;
  visibleBloqueo: boolean = false;
  visibleCrearBloqueo:boolean = false;
  listadoComentarios:[] =[]


  //anuncios
  anuncios:any[]=[]


  //saLAS
  nombre: string = ''
  filas: number = 0
  columnas: number = 0
  tipoSala:string=''

  cargando!:boolean
  comentariosVisibles!:boolean
  esVisible!:boolean
  calificacionesVisibles!:boolean

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

  //bloqueos
  fechaBloqueo!:Date 
cantidadDias!:Number


  // paginator
  // para el paginator
  first: number = 0;
  rows: number = 6;
  paginatedItems: any[] = [];
  items: any[] = []





  constructor(private route: ActivatedRoute) { 
 
  }



  // Opcional: responsive
  responsiveOptions = [
    { breakpoint: '768px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  formatDate(date:Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque meses van de 0-11
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  ngOnInit(): void {
    this.idCine = this.route.snapshot.paramMap.get('id')!;



    this.bloqueoServicio.verBloqueoActualCine(this.idCine).subscribe(
           (next: any) => {
            this.visibleBloqueo = next
      }
    )


    this.propiedadAnuncioServicio.listarAnunciosFecha(this.formatDate(new Date(Date.now())),this.formatDate(new Date(Date.now()))).subscribe(
           (next: any) => {
        console.log(next, "aca");
        this.anuncios = next
      }
    )

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
 showDialogCrearBloqueo() {
    this.visibleCrearBloqueo = true;
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


  cambiarVisibilidad(id: string) {
  this.cargando = true;
  this.SalasServicio.cambiarVisibilidad(id).subscribe(
                  (next) => {
            this.esVisible = !this.esVisible;

             this.alertaServicio.generacionAlerta(
        'Éxito', 'la sala fue modificado correctamente.', 'success'
        )

      }, (error) => {

           this.alertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al modifica la sala.', 'error'
        )

      }
  );
}

cambiarVisibilidadComentarios(id: string) {
  this.cargando = true;
  this.SalasServicio.cambiarVisibilidadComentarios(id).subscribe(

                (next) => {
            this.comentariosVisibles = !this.comentariosVisibles;

             this.alertaServicio.generacionAlerta(
        'Éxito', 'la sala fue modificado correctamente.', 'success'
        )

      }, (error) => {

           this.alertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al modifica la sala.', 'error'
        )

      }
);
}

cambiarVisibilidadCalificaciones(id: string) {

  this.cargando = true;
  this.SalasServicio.cambiarVisibilidadCalificaciones(id).subscribe(
            (next) => {
            this.calificacionesVisibles = !this.calificacionesVisibles;

             this.alertaServicio.generacionAlerta(
        'Éxito', 'la sala fue modificado correctamente.', 'success'
        )

      }, (error) => {

           this.alertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al modifica la sala.', 'error'
        )

      }
 
  );
}


generarBloqueo(){
  const nuevoBloqueo: bloqueoAnuncio= {
    fecha: this.fechaBloqueo,
    cantidad_dias: this.cantidadDias,
    cine: this.idCine
  }
    this.propiedadAnuncioServicio.crearBloqueoCine(nuevoBloqueo).subscribe(
            (next) => {
            this.calificacionesVisibles = !this.calificacionesVisibles;

             this.alertaServicio.generacionAlerta(
        'Éxito', 'El bloqueo de anuncios se realizo correctamente.', 'success'
        )

      }, (error) => {

           this.alertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al bloquar los anuncios.', 'error'
        )

      }
 
  );
}
}
