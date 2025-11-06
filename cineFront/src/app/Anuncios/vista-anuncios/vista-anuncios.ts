import { anuncios, MaterialAnuncio, PropiedadAnuncio } from '@/models/Anuncios';
import { ValidacionesSala, MatrizAsientos, sala } from '@/models/Cine';
import { AlertaServiceService } from '@/services/alerta-service.service';
import { AnuncioServiceService } from '@/services/anuncio-service.service';
import { AuthService } from '@/services/auth';
import { CineServiceService } from '@/services/cine-service.service';
import { MaterialAnuncioServiceService } from '@/services/material-anuncio-service.service';
import { PropiedadAnuncioServiceService } from '@/services/propiedad-anuncio-service.service';
import { SalaServicio } from '@/services/sala-servicio.service';
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
import { GalleriaModule } from 'primeng/galleria';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { RatingModule } from 'primeng/rating';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectModule } from 'primeng/select';
import { SplitterModule } from 'primeng/splitter';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-vista-anuncios',
  imports: [Card, Button, FormsModule,
    SplitterModule, FieldsetModule, SelectModule, TagModule,
    ScrollPanelModule, CardModule, ButtonModule, CommonModule, GalleriaModule,
    CurrencyPipe, AccordionModule, AvatarModule, BadgeModule, RouterLink, Checkbox,
    PanelModule, PaginatorModule, DialogModule, FileUploadModule, RatingModule],
  templateUrl: './vista-anuncios.html',
  styleUrl: './vista-anuncios.scss',
})
export class VistaAnuncios implements OnInit {

  listadoAnuncios: any[] = []
  cineEspecifico: any
  idCine!: string
  anuncioServicio = inject(MaterialAnuncioServiceService)
  propiedadAnuncioServicio = inject(PropiedadAnuncioServiceService)
  AlertaServicio = inject(AlertaServiceService)
  authServicio = inject(AuthService) 

  visible: boolean = false;
  visibleNuevoAnuncio: boolean = false;
  visibleCompraAnuncio: boolean = false;
  listadoComentarios: [] = []

  //anuncios
  texto?: string;
  imagen?: File;
  video?: File;

  titulo: String = "";
  tipo: String = "";
  vigencia: String = "";
  costoVisibilidad: Number = 0;
  costoOcultacion: Number = 1;

  opcionesAnuncio = [
    { label: 'TEXTO', value: 'TEXTO' },
    { label: 'IMAGEN', value: 'IMAGEN' },
    { label: 'VIDEO', value: 'VIDEO' }
  ]

    opcionesAnuncioVigencia = [
    { label: '1 Dia', value: 'DIA_1' },
    { label: '3 Dias', value: 'DIA_3' },
    { label: '1 Semana', value: 'SEMANA_1' },
    { label: '2 Semanas', value: 'SEMANA_2' }
  ]


  //edicion
  idAnuncioSeleccionado: String = '';


  // paginator
  // para el paginator
  first: number = 0;
  rows: number = 6;
  paginatedItems: any[] = [];
  items: any[] = []
  previewUrl?: string;




  constructor(private route: ActivatedRoute) {

  }

  ngOnInit(): void {


    this.anuncioServicio.listarAnunciosGlobales().subscribe((next: any) => {
      console.log(next);
      this.items = next

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

  showDialog(id: String | undefined) {
    this.visible = true;
    //this.listadoComentarios = []


  }


  verDialogoNuevoAnuncio() {
    this.visibleNuevoAnuncio = true
  }


  verDialogoNuevaCompraAnuncio(item: String) {
    this.visibleCompraAnuncio = true
    this.idAnuncioSeleccionado= item
  }

  

  onFileChange(event: any, tipo: 'imagen' | 'video') {
    const file = event.target.files[0];
    if (!file) return;

    if (tipo === 'imagen') this.imagen = file;
    if (tipo === 'video') this.video = file;

    // Vista previa
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }
  onTipoChange() {
    this.texto = '';
    this.imagen = undefined;
    this.video = undefined;
    this.previewUrl = undefined;
  }

  guardarAnuncio() {

    const dto: anuncios = {
      titulo: this.titulo,
      tipo: this.tipo,
      costoVisibilidad: this.costoVisibilidad,
      costoOcultacion: this.costoOcultacion,
      activo: true,
      idCine: ''
    };

    this.anuncioServicio.crearAnuncio(dto,
      this.texto,
      this.imagen,
      this.video).subscribe(
        (next) => {
        this.visibleNuevoAnuncio=false
             this.AlertaServicio.generacionAlerta(
        'Éxito', 'el anuncio fue ingresado correctamente.', 'success'
        )

      }, (error) => {
        this.visibleNuevoAnuncio=false

           this.AlertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al generar el nuevo anuncio.', 'error'
        )

      }
      )
  }


  generarPropiedad(){

    
    const nuevaPropiedad : PropiedadAnuncio = {
      fecha: new Date(Date.now()),
      fechaFin: new Date(Date.now()),
      usuario: this.authServicio.getUserIdFromToken(),
      anuncio: this.idAnuncioSeleccionado,
      vigencia: this.vigencia,
      estado: "PENDIENTE"
    }

    


    this.propiedadAnuncioServicio.crearPropiedad(nuevaPropiedad).subscribe(
        (next) => {
        this.visibleNuevoAnuncio=false
             this.AlertaServicio.generacionAlerta(
        'Éxito', 'La adquisicion del anuncio fue ingresado correctamente.', 'success'
        )

      }, (error) => {
        this.visibleNuevoAnuncio=false

           this.AlertaServicio.generacionAlerta(
          'Error', 'Hubo un problema al adquirir el nuevo anuncio.', 'error'
        )

      }
      )
  }
}
