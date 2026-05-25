import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  userName: string | null;
  idCol: number | null;
  isOnline: boolean;
  pendingSync: number;
  setObraActual: (obra: Obra) => void;
  setRol: (rol: Rol) => void;
  setUserEmail: (email: string) => void;
  setUserName: (name: string) => void;
  setIdCol: (id: number) => void;
  setOnline: (v: boolean) => void;
  setPendingSync: (n: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      obraActual: null,
      rol: null,
      userEmail: null,
      userName: null,
      idCol: null,
      isOnline: true,
      pendingSync: 0,
      setObraActual: (obra) => set({ obraActual: obra }),
      setRol: (rol) => set({ rol }),
      setUserEmail: (email) => set({ userEmail: email }),
      setUserName: (name) => set({ userName: name }),
      setIdCol: (id) => set({ idCol: id }),
      setOnline: (v) => set({ isOnline: v }),
      setPendingSync: (n) => set({ pendingSync: n }),
      reset: () => set({ obraActual: null, rol: null, userEmail: null, userName: null, idCol: null }),
    }),
    {
      name: "boletas-auth",
      partialize: (state) => ({
        rol:       state.rol,
        userEmail: state.userEmail,
        userName:  state.userName,
        idCol:     state.idCol,
      }),
    }
  )
);
