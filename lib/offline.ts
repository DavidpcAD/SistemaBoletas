import Dexie, { type Table } from "dexie";

export type EstadoBoleta = "Pendiente" | "Aprobado" | "Denegado" | "Preparación" | "Transporte" | "Entregado";
export type EstadoEntrega = "Pendiente" | "EnCamino" | "Entregado" | "Parcial";
export type EstadoTraslado = "SinAutorizar" | "Aprobado" | "Denegado" | "EnTransito" | "Completado";

export interface MaterialLine {
  itemNo: string;
  descripcion: string;
  cantidad: number;
  cantidadEntregada: number;
  unidad: string;
  almacen: string;
}

export interface BoletaSalidaLocal {
  id?: number;
  remoteId?: number;
  numero?: string;
  obraId: string;
  obraDesc: string;
  actividad: string;
  fecha: string;
  estado: EstadoBoleta;
  encargado: string;
  tipo: "presupuesto" | "sinpresupuesto" | "plantilla";
  materiales: MaterialLine[];
  firmaEncargado?: string;
  firmaMaestro?: string;
  synced: boolean;
  updatedAt: number;
}

export interface BoletaEntregaLocal {
  id?: number;
  remoteId?: number;
  numero?: string;
  boletaSalidaId: number;
  obraId: string;
  transportistaEmail: string;
  fecha: string;
  estado: EstadoEntrega;
  materiales: MaterialLine[];
  firmaTransportista?: string;
  firmaEncargado?: string;
  observaciones?: string;
  synced: boolean;
  updatedAt: number;
}

export interface BoletaTrasladoLocal {
  id?: number;
  remoteId?: number;
  numero?: string;
  obraOrigenId: string;
  obraDestinoId: string;
  fecha: string;
  estado: EstadoTraslado;
  materiales: MaterialLine[];
  firmaOrigen?: string;
  firmaDestino?: string;
  transportistaEmail?: string;
  synced: boolean;
  updatedAt: number;
}

export interface SyncQueueItem {
  id?: number;
  entity: "boleta-salida" | "boleta-entrega" | "boleta-traslado";
  action: "create" | "update";
  localId: number;
  payload: unknown;
  createdAt: number;
  retries: number;
}

class BoletasDB extends Dexie {
  boletasSalida!: Table<BoletaSalidaLocal>;
  boletasEntrega!: Table<BoletaEntregaLocal>;
  boletasTraslado!: Table<BoletaTrasladoLocal>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("boletasdb");
    this.version(1).stores({
      boletasSalida:  "++id, remoteId, obraId, estado, synced, updatedAt",
      boletasEntrega: "++id, remoteId, boletaSalidaId, obraId, estado, synced, updatedAt",
      boletasTraslado:"++id, remoteId, obraOrigenId, estado, synced, updatedAt",
      syncQueue:      "++id, entity, action, localId, createdAt",
    });
  }
}

export const db = new BoletasDB();

// ── Helpers de acceso ──
export async function getBoletasSalidaByObra(obraId: string) {
  return db.boletasSalida.where("obraId").equals(obraId).reverse().sortBy("updatedAt");
}

export async function guardarBoletaSalida(data: Omit<BoletaSalidaLocal, "id" | "synced" | "updatedAt">) {
  const id = await db.boletasSalida.add({ ...data, synced: false, updatedAt: Date.now() });
  await db.syncQueue.add({ entity: "boleta-salida", action: "create", localId: id as number, payload: data, createdAt: Date.now(), retries: 0 });
  return id;
}

export async function actualizarEstadoBoleta(id: number, estado: EstadoBoleta) {
  await db.boletasSalida.update(id, { estado, synced: false, updatedAt: Date.now() });
}
