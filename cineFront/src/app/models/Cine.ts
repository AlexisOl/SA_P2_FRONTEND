export interface cine {
    id?: String
    nombre: String
    ubicacion: String
    telefono: String
    fechaCreacion?: Date
    costo?: number
    cartera?: number
}


export interface MatrizAsientos{
         filas:Number;
    columnas:Number;
}


export interface ValidacionesSala{
          validar_comnentarios:boolean;
     validar_calificaciones:boolean;
     visible:boolean;
 }
export interface sala {
    id?:String;
     nombre:String;
     tipoSala?:String;
     matrizAsientos:MatrizAsientos;
     validacionesSala:ValidacionesSala;
     idCine:String;
     promedio_valoracion?:Number;
}

export enum TipoSnacks{
     BEBIDA, ANTOJITO, DULCERIA

}

export interface snacks {
        id?:String;
    nombre:String;
     precio:Number;
      tipo:String;
     idCine:String;
    promedio_valoracion?:Number;

}


export interface bloqueoAnuncio {
     id?:String;
     fecha:Date;
     fecha_fin:Date;
     cantidad_dias:Number;
     idCine:String;
}


export interface CostosCine {
    id?:String;
     fecha:Date;
     costo:Number;
     idCine:String;
}