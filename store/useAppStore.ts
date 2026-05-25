import { create } from "zustand";

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
  setObraActual: (obra: Obra) => void;
  setRol: (rol: Rol) => void;
  setUserEmail: (email: string) => void;
  setIdCol: (id: number) => void;
  setOnline: (v: boolean) => void;
  setPendingSync: (n: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  obraActual: null,
  rol: null,
  userEmail: null,
  idCol: null,
  isOnline: true,
  pendingSync: 0,
  setObraActual: (obra) => set({ obraActual: obra }),
  setRol: (rol) => set({ rol }),
  setUserEmail: (email) => set({ userEmail: email }),
  setIdCol: (id) => set({ idCol: id }),
  setOnline: (v) => set({ isOnline: v }),
  setPendingSync: (n) => set({ pendingSync: n }),
  reset: () => set({ obraActual: null, rol: null, userEmail: null, idCol: null }),
}));
