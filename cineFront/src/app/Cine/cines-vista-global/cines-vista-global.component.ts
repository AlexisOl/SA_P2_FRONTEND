import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule, Button } from 'primeng/button';
import { CardModule, Card } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SplitterModule } from 'primeng/splitter';
import { RatingModule } from 'primeng/rating';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { pipe } from 'rxjs';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CineServiceService } from '../../services/cine-service.service';
import { cine } from '../../models/Cine';
@Component({
  selector: 'app-cines-vista-global',
  imports: [Card,  Button, FormsModule, DropdownModule,
    SplitterModule,  FieldsetModule, SelectModule,TagModule,
    ScrollPanelModule, CardModule, ButtonModule,  CommonModule,
    CurrencyPipe, AccordionModule, AvatarModule, BadgeModule,
    PanelModule, PaginatorModule, DialogModule, FileUploadModule, RatingModule
  ],
  templateUrl: './cines-vista-global.component.html',
  styleUrl: './cines-vista-global.component.css'
})
export class CinesVistaGlobalComponent implements OnInit{

   listadoHabitaciones: any[] = []
  listadoComentarios: any[] = []
  idHotel!: string
  cineServicio = inject(CineServiceService)

  visible: boolean = false;
  visibleNuevaHabitacion: boolean = false;
  visibleReservacion: boolean = false;
  visibleEditarCine: boolean = false;

  //CINES
  nombre: string = ''
  ubicacion: string = ''
  telefono: string = ''
  cartera:number=0
  costo:number=0

  //edicion
  id_cineEditar!:String|undefined
  cineEditar = signal<any>([])


  // paginator
   first = signal(0);
  rows = signal(6);
  paginatedItems: any[] = [];
  items: any[] = []




   paginatedCines = computed(() => {
    const all = this.cineServicio.cinesSignal();
    const start = this.first();
    const end = start + this.rows();
    return all.slice(start, end);
  });


  ngOnInit(): void {
  }


  onPageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }


  showDialog(id: String|undefined) {
    this.visible = true;
    this.listadoComentarios = []

 
  }


  verDialogoNuevaHabitacion() {
    this.visibleNuevaHabitacion = true
  }

  verDialogoEditarCine(id:String|undefined){
    this.visibleEditarCine=true
    this.id_cineEditar=id


   
  }


  editarCine(){
        const nuevoCine: cine = {
      nombre: this.nombre,
      ubicacion: this.ubicacion,
      telefono: this.telefono,
      fechaCreacion: new Date(Date.now()),
      cartera:this.cartera,
      costo: this.costo
    }

    this.cineServicio.editarHotel(nuevoCine, this.id_cineEditar).subscribe(
            (next) => {
        console.log(next);
        
      }, (error) => {
        console.log(error);

      }
    )
  }


  guardarCine() {

    const nuevoCine: cine = {
      nombre: this.nombre,
      ubicacion: this.ubicacion,
      telefono: this.telefono,
      fechaCreacion: new Date(Date.now()),
      cartera:this.cartera,
      costo: this.costo
    }

    
    this.cineServicio.crearHotel(nuevoCine).subscribe(
      (next) => {
        console.log(next);
        
      }, (error) => {
        console.log(error);

      }
    )
  }
}
