"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { SearchBar } from "@/components/ds/SearchBar";
import { Button } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { springs } from "@/components/ds/springs";

const FILTROS = ["Todas","Sin Autorizar","Aprobado","Denegado","Bodega","Entregado","Completado"] as const;
type Filtro = typeof FILTROS[number];

const ESTADO_COLOR: Record<string, { bg:string; text:string }> = {
  "Sin Autorizar": { bg:"var(--ds-color-yellow)",   text:"var(--ds-color-black)" },
  Aprobado:        { bg:"var(--ds-color-green-100)", text:"var(--ds-color-black)" },
  Denegado:        { bg:"var(--ds-color-red-100)",   text:"var(--ds-color-white)" },
  Bodega:          { bg:"#e8f0ff",                   text:"#3366cc" },
  Completado:      { bg:"#fff3d0",                   text:"#996600" },
  Entregado:       { bg:"var(--ds-color-gray-100)",  text:"var(--ds-color-gray-500)" },
};

interface BoletaRow {
  IDBoletaSalida: number;
  IDObraBC: string;
  DetBSalida: string;
  Estado: string;
  TgAprobado: boolean;
  TgBodega: boolean;
  TgCompletado: boolean;
  NomCreadoPor: string;
  TaskNo: string;
  TareaObra: string;
  FechaStr: string;
  NumMateriales: number;
}

export default function BoletasPage() {
  const router = useRouter();
  const { obraActual, rol } = useAppStore();
  const [filtro, setFiltro]     = useState<Filtro>("Todas");
  const [search, setSearch]     = useState("");
  const [boletas, setBoletas]   = useState<BoletaRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const canCreate = rol === "encargado" || rol === "maestro";

  const fetchBoletas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = obraActual?.id ? `?obraId=${encodeURIComponent(obraActual.id)}` : "";
      const res = await fetch(`/api/boletas${qs}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setBoletas(json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar boletas");
    } finally {
      setLoading(false);
    }
  }, [obraActual?.id]);

  useEffect(() => { fetchBoletas(); }, [fetchBoletas]);

  // Derive display estado considering flags
  const displayEstado = (b: BoletaRow) => {
    if (b.TgBodega && !b.TgCompletado) return "Bodega";
    return b.Estado;
  };

  const filtered = boletas.filter((b) => {
    const q    = search.toLowerCase();
    const est  = displayEstado(b);
    const matchSearch = (b.DetBSalida ?? "").toLowerCase().includes(q)
      || (b.TareaObra ?? "").toLowerCase().includes(q)
      || (b.NomCreadoPor ?? "").toLowerCase().includes(q);
    const matchFiltro = filtro === "Todas" || est === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100dvh",background:"var(--ds-color-surface)" }}>

      {/* ── Header ── */}
      <div style={{ background:"var(--ds-color-white)",padding:"var(--ds-space-6) var(--ds-space-4) 0",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}
      >
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"var(--ds-space-3)" }}>
          <div>
            <div style={{ fontSize:"var(--ds-font-size-subtitle)",fontWeight:700 }}>Boletas de Salida</div>
            {obraActual && (
              <div style={{ fontSize:"var(--ds-font-size-body-sm)",color:"var(--ds-color-gray-500)",marginTop:2 }}>
                {obraActual.id} · {obraActual.descripcion}
              </div>
            )}
          </div>
          {canCreate && (
            <Button size="sm" color="green" layout="icon-left" icon="plus" label="Nueva"
              onClick={() => router.push("/boletas/nueva")} />
          )}
        </div>

        <SearchBar layout="label" placeholder="Buscar boleta, actividad..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClose={search ? () => setSearch("") : undefined} />

        {/* Filter chips */}
        <div style={{ display:"flex",gap:6,overflowX:"auto",padding:"var(--ds-space-3) 0",
          scrollbarWidth:"none",WebkitOverflowScrolling:"touch" }}>
          {FILTROS.map((f) => {
            const active = filtro === f;
            const colors = ESTADO_COLOR[f];
            return (
              <motion.button key={f} type="button"
                animate={{ scale: active ? 1 : 0.96 }}
                transition={springs.snappy}
                onClick={() => setFiltro(f)}
                style={{ flexShrink:0,padding:"5px 14px",borderRadius:99,border:"none",cursor:"pointer",
                  fontFamily:"var(--ds-font-family)",fontSize:12,fontWeight:active?700:500,
                  letterSpacing:"0.25px",
                  background: active && colors ? colors.bg : "var(--ds-color-gray-100)",
                  color: active && colors ? colors.text : "var(--ds-color-gray-500)",
                  WebkitTapHighlightColor:"transparent",
                  boxShadow: active ? "var(--ds-shadow-01)" : "none",
                  transition:"background 0.15s,color 0.15s" }}
              >
                {f}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ flex:1,overflowY:"auto",padding:"var(--ds-space-3) var(--ds-space-4)",
        display:"flex",flexDirection:"column",gap:8 }}>

        {loading && (
          <div style={{ textAlign:"center",padding:"48px 0",color:"var(--ds-color-gray-400)" }}>
            Cargando boletas...
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign:"center",padding:"32px 0" }}>
            <div style={{ color:"var(--ds-color-red-100)",fontWeight:600,marginBottom:12 }}>{error}</div>
            <Button size="sm" color="white" label="Reintentar" onClick={fetchBoletas} />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!loading && !error && filtered.length === 0 && (
            <motion.div key="empty"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ textAlign:"center",padding:"48px 0",color:"var(--ds-color-gray-400)" }}
            >
              <Icon name="boleta" size="lg" color="var(--ds-color-gray-300)" />
              <p style={{ marginTop:12,fontWeight:600,fontSize:"var(--ds-font-size-label)" }}>
                No hay boletas {filtro !== "Todas" ? `con estado ${filtro}` : ""}
              </p>
            </motion.div>
          )}

          {!loading && filtered.map((b, i) => {
            const est    = displayEstado(b);
            const colors = ESTADO_COLOR[est] ?? { bg:"var(--ds-color-gray-100)", text:"var(--ds-color-gray-500)" };
            return (
              <motion.div key={b.IDBoletaSalida}
                layout
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.96 }}
                transition={{ ...springs.expanding, delay: i * 0.03 }}
              >
                <motion.button type="button"
                  whileTap={{ scale:0.97 }}
                  transition={springs.snappy}
                  onClick={() => router.push(`/boletas/${b.IDBoletaSalida}`)}
                  style={{ width:"100%",textAlign:"left",border:"none",cursor:"pointer",
                    background:"var(--ds-color-white)",borderRadius:"var(--ds-radius-lg)",
                    padding:"var(--ds-space-4)",boxShadow:"var(--ds-shadow-01)",
                    display:"flex",alignItems:"center",gap:"var(--ds-space-3)",
                    WebkitTapHighlightColor:"transparent" }}
                >
                  <div style={{ width:44,height:44,flexShrink:0,borderRadius:"var(--ds-radius-md)",
                    background:"var(--ds-color-surface)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Icon name="boleta" size="lg" color="var(--ds-color-gray-500)" />
                  </div>

                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-label)" }}>{b.DetBSalida ?? `#${b.IDBoletaSalida}`}</div>
                    <div style={{ fontSize:"var(--ds-font-size-body-sm)",color:"var(--ds-color-gray-500)",
                      marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                      {b.TareaObra || b.TaskNo}
                    </div>
                    <div style={{ fontSize:11,color:"var(--ds-color-gray-400)",marginTop:2 }}>
                      {b.FechaStr} · {b.NumMateriales} materiales · {b.NomCreadoPor}
                    </div>
                  </div>

                  <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0 }}>
                    <span style={{ padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                      background:colors.bg,color:colors.text }}>
                      {est}
                    </span>
                    <Icon name="arrow-right" size="sm" color="var(--ds-color-gray-300)" />
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
