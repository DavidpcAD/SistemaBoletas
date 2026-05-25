"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { SearchBar } from "@/components/ds/SearchBar";
import { springs } from "@/components/ds/springs";
import { haptic } from "@/components/ds/haptic";
import { ITEMS_CATALOGO } from "@/lib/mockData";

type LineaMaterial = { itemNo: string; desc: string; unidad: string; cantidad: number };
type Tarea = { IDTareaObra: number; TareaObra: string; NumTarea: string; Etapa: string };

export default function NuevaBoletaPage() {
  const router = useRouter();
  const { obraActual, idCol } = useAppStore();
  const [tareas, setTareas]       = useState<Tarea[]>([]);
  const [actividad, setActividad] = useState("");
  const [tareaKey, setTareaKey]   = useState(""); // NumTarea key
  const [searchItem, setSearchItem] = useState("");
  const [showSugs, setShowSugs]     = useState(false);
  const [materiales, setMateriales] = useState<LineaMaterial[]>([]);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load actividades from DB
  useEffect(() => {
    fetch("/api/actividades")
      .then((r) => r.json())
      .then((j) => setTareas(j.data ?? []))
      .catch(() => {/* silently fail, catalog still works */});
  }, []);

  const suggestions = ITEMS_CATALOGO.filter((i) =>
    i.desc.toLowerCase().includes(searchItem.toLowerCase()) && searchItem.length > 1
  ).slice(0, 6);

  const addItem = (item: typeof ITEMS_CATALOGO[0]) => {
    haptic.select();
    setMateriales((prev) => {
      const exists = prev.find((m) => m.itemNo === item.itemNo);
      if (exists) return prev.map((m) => m.itemNo === item.itemNo ? { ...m, cantidad: m.cantidad + 1 } : m);
      return [...prev, { itemNo: item.itemNo, desc: item.desc, unidad: item.unidad, cantidad: 1 }];
    });
    setSearchItem(""); setShowSugs(false);
  };

  const updateQty = (itemNo: string, delta: number) => {
    setMateriales((prev) =>
      prev.map((m) => m.itemNo === itemNo ? { ...m, cantidad: Math.max(1, m.cantidad + delta) } : m)
    );
  };

  const remove = (itemNo: string) => {
    haptic.select();
    setMateriales((prev) => prev.filter((m) => m.itemNo !== itemNo));
  };

  const handleGuardar = async () => {
    if (!actividad || materiales.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const tarea = tareas.find((t) => t.NumTarea === tareaKey);
      const res = await fetch("/api/boletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDObraBC:   obraActual?.id ?? "",
          TaskNo:     tareaKey,
          TareaObra:  tarea?.TareaObra ?? actividad,
          Creadopor:  idCol ?? 1,
          materiales: materiales.map((m) => ({
            itemNo:            m.itemNo,
            Descripcion:       m.desc,
            quantity:          m.cantidad,
            unitOfMeasureCode: m.unidad,
            locationCode:      "ALM-GRAL",
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al guardar");
      }
      haptic.complete();
      router.back();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar boleta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"var(--ds-color-surface)" }}>

      {/* Header */}
      <div style={{ background:"var(--ds-color-white)", padding:"var(--ds-space-6) var(--ds-space-4) var(--ds-space-4)",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-3)" }}>
          <Button size="sm" color="white" layout="icon" icon="back" onClick={() => router.back()} ariaLabel="Volver" />
          <div>
            <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-body-md)" }}>Nueva Boleta de Salida</div>
            {obraActual && (
              <div style={{ fontSize:12, color:"var(--ds-color-gray-500)" }}>{obraActual.id}</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"var(--ds-space-4)" }}>

        {/* Actividad */}
        <div style={{ marginBottom:"var(--ds-space-4)" }}>
          <label style={{ fontSize:12, fontWeight:700, color:"var(--ds-color-gray-500)",
            letterSpacing:"0.4px", textTransform:"uppercase", display:"block", marginBottom:8 }}>
            Actividad
          </label>
          <select value={actividad} onChange={(e) => {
              setActividad(e.target.value);
              const t = tareas.find((x) => x.TareaObra === e.target.value);
              setTareaKey(t?.NumTarea ?? "");
            }}
            style={{ width:"100%", padding:"14px var(--ds-space-4)", border:"2px solid var(--ds-color-gray-200)",
              borderRadius:"var(--ds-radius-lg)", fontSize:"var(--ds-font-size-label)",
              fontFamily:"var(--ds-font-family)", background:"var(--ds-color-white)",
              outline:"none", appearance:"none", cursor:"pointer",
              color: actividad ? "var(--ds-color-black)" : "var(--ds-color-gray-400)" }}
          >
            <option value="">Seleccionar actividad...</option>
            {(tareas.length > 0 ? tareas : []).map((t) => (
              <option key={t.NumTarea} value={t.TareaObra}>{t.NumTarea} — {t.TareaObra}</option>
            ))}
          </select>
        </div>

        {/* Buscar material */}
        <div style={{ marginBottom:"var(--ds-space-4)" }}>
          <label style={{ fontSize:12, fontWeight:700, color:"var(--ds-color-gray-500)",
            letterSpacing:"0.4px", textTransform:"uppercase", display:"block", marginBottom:8 }}>
            Agregar Material
          </label>
          <div style={{ position:"relative" }}>
            <SearchBar layout="label" placeholder="Buscar material..." value={searchItem}
              inputRef={searchRef}
              onChange={(e) => { setSearchItem(e.target.value); setShowSugs(true); }}
              onFocus={() => setShowSugs(true)}
              onClose={searchItem ? () => { setSearchItem(""); setShowSugs(false); } : undefined}
            />
            <AnimatePresence>
              {showSugs && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                  transition={springs.snappy}
                  style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:50,
                    background:"var(--ds-color-white)", borderRadius:"var(--ds-radius-lg)",
                    boxShadow:"var(--ds-shadow-03-big)", listStyle:"none", margin:0, padding:"4px 0",
                    maxHeight:220, overflowY:"auto" }}
                >
                  {suggestions.map((s) => (
                    <li key={s.itemNo}>
                      <button type="button" onClick={() => addItem(s)}
                        style={{ width:"100%", textAlign:"left", border:"none", background:"none",
                          cursor:"pointer", padding:"10px var(--ds-space-4)",
                          fontFamily:"var(--ds-font-family)", fontSize:"var(--ds-font-size-label)" }}
                      >
                        <div style={{ fontWeight:500 }}>{s.desc}</div>
                        <div style={{ fontSize:11, color:"var(--ds-color-gray-400)", marginTop:2 }}>{s.unidad}</div>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Materiales */}
        {materiales.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--ds-color-gray-500)",
              letterSpacing:"0.4px", textTransform:"uppercase", marginBottom:8 }}>
              Materiales ({materiales.length})
            </div>
            <div style={{ background:"var(--ds-color-white)", borderRadius:"var(--ds-radius-lg)",
              boxShadow:"var(--ds-shadow-01)", overflow:"hidden" }}>
              <AnimatePresence mode="popLayout">
                {materiales.map((m, i) => (
                  <motion.div key={m.itemNo} layout
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                    exit={{ opacity:0, height:0 }} transition={springs.snappy}
                    style={{ borderBottom: i < materiales.length-1 ? "1px solid var(--ds-color-gray-100)" : "none",
                      padding:"var(--ds-space-3) var(--ds-space-4)",
                      display:"flex", alignItems:"center", gap:"var(--ds-space-3)" }}
                  >
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"var(--ds-font-size-label)", fontWeight:500,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.desc}</div>
                      <div style={{ fontSize:11, color:"var(--ds-color-gray-400)", marginTop:2 }}>{m.unidad}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      <button type="button" onClick={() => updateQty(m.itemNo, -1)}
                        style={{ width:32, height:32, borderRadius:"50%", border:"none",
                          background:"var(--ds-color-surface)", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:20, fontWeight:700, color:"var(--ds-color-gray-500)", lineHeight:1 }}>−</button>
                      <span style={{ minWidth:28, textAlign:"center", fontWeight:700,
                        fontSize:"var(--ds-font-size-body-md)" }}>{m.cantidad}</span>
                      <button type="button" onClick={() => updateQty(m.itemNo, 1)}
                        style={{ width:32, height:32, borderRadius:"50%", border:"none",
                          background:"var(--ds-color-green-100)", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:20, fontWeight:700, lineHeight:1 }}>+</button>
                    </div>
                    <button type="button" onClick={() => remove(m.itemNo)}
                      style={{ border:"none", background:"none", cursor:"pointer", padding:4, flexShrink:0 }}>
                      <Icon name="close" size="sm" color="var(--ds-color-gray-400)" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div style={{ height:100 }} />
      </div>

      {/* Footer */}
      <div style={{ background:"var(--ds-color-white)", padding:"var(--ds-space-4)",
        borderTop:"1px solid var(--ds-color-gray-100)" }}>
        {saveError && (
          <div style={{ marginBottom:8, fontSize:12, color:"var(--ds-color-red-100)", textAlign:"center" }}>
            {saveError}
          </div>
        )}
        <Button fullWidth
          color={materiales.length > 0 && actividad ? "green" : "gray"}
          state={materiales.length === 0 || !actividad || saving ? "disabled" : "standard"}
          label={saving ? "Guardando..." : `Guardar (${materiales.length} materiales)`}
          layout="icon-right" icon="check"
          onClick={handleGuardar} />
      </div>
    </div>
  );
}
