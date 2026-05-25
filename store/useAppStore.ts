import { create } from "zustand";
import { BOLETAS_SALIDA, BoletaSalida } from "@/lib/mockData";

export interface Obra {
  id: string;
  numero: string;
  descripcion: string;
}

export type Rol = "encargado" | "maestro" | "bodeguero" | "transportista";

export interface AppState {
  obraActual: Obra | null;
  rol: Rol | null;
  userEmail: string | null;
  idCol: number | null;
  isOnline: boolean;
  pendingSync: number;
  boletasSalida: BoletaSalida[];
  setObraActual: (obra: Obra) => void;
  setRol: (rol: Rol) => void;
  setUserEmail: (email: string) => void;
  setIdCol: (id: number) => void;
  setOnline: (v: boolean) => void;
  setPendingSync: (n: number) => void;
  addBoleta: (boleta: BoletaSalida) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  obraActual: null,
  rol: null,
  userEmail: null,
  idCol: null,
  isOnline: true,
  pendingSync: 0,
  boletasSalida: [...BOLETAS_SALIDA],
  setObraActual: (obra) => set({ obraActual: obra }),
  setRol: (rol) => set({ rol }),
  setUserEmail: (email) => set({ userEmail: email }),
  setIdCol: (id) => set({ idCol: id }),
  setOnline: (v) => set({ isOnline: v }),
  setPendingSync: (n) => set({ pendingSync: n }),
  addBoleta: (boleta) => set((s) => ({ boletasSalida: [boleta, ...s.boletasSalida] })),
  reset: () => set({ obraActual: null, rol: null, userEmail: null, idCol: null }),
}));
