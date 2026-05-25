export type EstadoBoleta = "Pendiente" | "Aprobado" | "Denegado" | "Preparación" | "Transporte" | "Entregado";
export type EstadoEntrega = "Pendiente" | "EnCamino" | "Entregado" | "Parcial";
export type EstadoTraslado = "SinAutorizar" | "Aprobado" | "Denegado" | "EnTransito" | "Completado";

export interface MaterialLine {
  itemNo: string;
  desc: string;
  cantidad: number;
  cantEnt: number;
  unidad: string;
  almacen: string;
}

export interface BoletaSalida {
  id: string; numero: string; obraId: string; obraNum: string; actividad: string;
  fecha: string; estado: EstadoBoleta; encargado: string; tipo: string;
  materiales: MaterialLine[];
}

export interface BoletaEntrega {
  id: string; numero: string; boletaSalidaId: string; obraId: string;
  transportista: string; fecha: string; estado: EstadoEntrega; materiales: MaterialLine[];
}

export interface BoletaTraslado {
  id: string; numero: string; obraOrigenId: string; obraOrigenNum: string;
  obraDestinoId: string; obraDestinoNum: string; fecha: string;
  estado: EstadoTraslado; materiales: MaterialLine[]; transportista?: string;
}

export const OBRAS = [
  { id: "C01", numero: "C.01", descripcion: "EDIFICIO NOVARUM TORRE A" },
  { id: "C02", numero: "C.02", descripcion: "RESIDENCIAL LAS PALMAS" },
  { id: "C03", numero: "C.03", descripcion: "CENTRO COMERCIAL METRO SUR" },
  { id: "C04", numero: "C.04", descripcion: "PUENTE RUTA 32 KM 48" },
];

const MAT_BASE: MaterialLine[] = [
  { itemNo:"M01-0147", desc:"VARILLA #3 DEFORMADA G40",         cantidad:230, cantEnt:0,  unidad:"UND", almacen:"ALM GRAL" },
  { itemNo:"M01-0008", desc:'PLATINA DE ACERO ESMALTADA 4"',    cantidad:17,  cantEnt:17, unidad:"UND", almacen:"ALM GRAL" },
  { itemNo:"M01-0023", desc:'TUBO CONDUIT EMT 1/2" X 3M',       cantidad:42,  cantEnt:40, unidad:"UND", almacen:"ALM GRAL" },
  { itemNo:"M01-0055", desc:"CLAVO CABEZA PLANA 3\" CAJA 5LB",  cantidad:10,  cantEnt:10, unidad:"CAJ", almacen:"ALM GRAL" },
  { itemNo:"M01-0089", desc:"CEMENTO PORTLAND TIPO I SACO 50KG",cantidad:80,  cantEnt:60, unidad:"SAC", almacen:"ALM GRAL" },
];

export const BOLETAS_SALIDA: BoletaSalida[] = [
  { id:"1", numero:"BS000095", obraId:"C01", obraNum:"C.01", actividad:"CIMENTACIÓN",    fecha:"25/05/2026", estado:"Pendiente",    encargado:"David Pérez", tipo:"sinpresupuesto", materiales:MAT_BASE.slice(0,3) },
  { id:"2", numero:"BS000094", obraId:"C01", obraNum:"C.01", actividad:"ESTRUCTURA",     fecha:"24/05/2026", estado:"Aprobado",     encargado:"David Pérez", tipo:"presupuesto",    materiales:MAT_BASE.slice(1,4) },
  { id:"3", numero:"BS000093", obraId:"C01", obraNum:"C.01", actividad:"ACABADOS",       fecha:"23/05/2026", estado:"Transporte",   encargado:"David Pérez", tipo:"sinpresupuesto", materiales:MAT_BASE.slice(2,5) },
  { id:"4", numero:"BS000092", obraId:"C01", obraNum:"C.01", actividad:"INSTALACIONES",  fecha:"22/05/2026", estado:"Entregado",    encargado:"David Pérez", tipo:"plantilla",      materiales:MAT_BASE.slice(0,2) },
  { id:"5", numero:"BS000091", obraId:"C01", obraNum:"C.01", actividad:"PINTURA",        fecha:"21/05/2026", estado:"Denegado",     encargado:"David Pérez", tipo:"sinpresupuesto", materiales:MAT_BASE.slice(3,5) },
  { id:"6", numero:"BS000090", obraId:"C02", obraNum:"C.02", actividad:"CIMENTACIÓN",    fecha:"20/05/2026", estado:"Preparación",  encargado:"María López", tipo:"presupuesto",    materiales:MAT_BASE },
];

export const BOLETAS_ENTREGA: BoletaEntrega[] = [
  { id:"e1", numero:"BE000041", boletaSalidaId:"2", obraId:"C01", transportista:"Carlos Mora",  fecha:"24/05/2026", estado:"EnCamino",  materiales:MAT_BASE.slice(1,4) },
  { id:"e2", numero:"BE000040", boletaSalidaId:"4", obraId:"C01", transportista:"Luis Vargas",  fecha:"22/05/2026", estado:"Entregado", materiales:MAT_BASE.slice(0,2) },
  { id:"e3", numero:"BE000039", boletaSalidaId:"3", obraId:"C01", transportista:"Carlos Mora",  fecha:"23/05/2026", estado:"Parcial",   materiales:MAT_BASE.slice(2,5) },
];

export const BOLETAS_TRASLADO: BoletaTraslado[] = [
  { id:"t1", numero:"BT000012", obraOrigenId:"C01", obraOrigenNum:"C.01", obraDestinoId:"C02", obraDestinoNum:"C.02", fecha:"25/05/2026", estado:"SinAutorizar", materiales:MAT_BASE.slice(0,3), transportista:"Carlos Mora" },
  { id:"t2", numero:"BT000011", obraOrigenId:"C02", obraOrigenNum:"C.02", obraDestinoId:"C01", obraDestinoNum:"C.01", fecha:"24/05/2026", estado:"Aprobado",     materiales:MAT_BASE.slice(2,5), transportista:"Luis Vargas" },
  { id:"t3", numero:"BT000010", obraOrigenId:"C01", obraOrigenNum:"C.01", obraDestinoId:"C03", obraDestinoNum:"C.03", fecha:"22/05/2026", estado:"Completado",   materiales:MAT_BASE.slice(1,3) },
];

export const ITEMS_CATALOGO = [
  { itemNo:"M01-0147", desc:"VARILLA #3 DEFORMADA G40",            unidad:"UND" },
  { itemNo:"M01-0008", desc:'PLATINA DE ACERO ESMALTADA 4"',       unidad:"UND" },
  { itemNo:"M01-0023", desc:'TUBO CONDUIT EMT 1/2" X 3M',          unidad:"UND" },
  { itemNo:"M01-0055", desc:"CLAVO CABEZA PLANA 3\" CAJA 5LB",     unidad:"CAJ" },
  { itemNo:"M01-0089", desc:"CEMENTO PORTLAND TIPO I SACO 50KG",   unidad:"SAC" },
  { itemNo:"M01-0102", desc:"ARENA GRUESA M3",                     unidad:"M3"  },
  { itemNo:"M01-0115", desc:"PIEDRA QUINTILLA M3",                 unidad:"M3"  },
  { itemNo:"M01-0128", desc:"BLOCKS 15X20X40 CM",                  unidad:"UND" },
  { itemNo:"M01-0134", desc:"MALLA ELECTROSOLDADA 6X6 WWF",        unidad:"M2"  },
  { itemNo:"M01-0198", desc:"TUBO PVC 4\" SANITARIO X 6M",         unidad:"UND" },
];

export const ACTIVIDADES = ["CIMENTACIÓN","ESTRUCTURA","ACABADOS","INSTALACIONES ELÉCTRICAS","INSTALACIONES SANITARIAS","PINTURA","IMPERMEABILIZACIÓN"];

export const STOCK_BODEGA = ITEMS_CATALOGO.map((item, i) => ({
  ...item,
  stock: [120, 45, 200, 30, 85, 15, 8, 500, 300, 60][i],
  almacen: "ALM GRAL",
  minimo: [50, 20, 100, 10, 30, 5, 5, 200, 100, 20][i],
}));
