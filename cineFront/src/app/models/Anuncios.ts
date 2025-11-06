export interface  CostosAnuncio {
     costoVisibilidad:Number;
     costoOcultacion:Number;
}
export interface anuncios {
     id?:String;
     titulo:String;
     tipo:String;
    costoVisibilidad:Number;
     costoOcultacion:Number;
     activo?:boolean;
 idCine?:String ;
}

export interface MaterialAnuncio{
     id?:String;
     linkvideo:String
     texto:String
     linkimagen:String
     idAnuncio:String
}

export interface PropiedadAnuncio {
     id?:String;
     fecha:Date;
     fechaFin:Date;
     usuario:String|null;
     anuncio:String;
     vigencia:String;
     estado:String;
     materialAnuncio?:string;
}