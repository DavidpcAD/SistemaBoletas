"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Icon } from "@/components/ds/Icon";

type Entrega = Record<string, unknown>;

const FILTROS = ["Todas","Pendiente","EnCamino","Entregado","Parcial"] as const;

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  Pendiente: { bg: "var(--ds-color-yellow)",    text: "var(--ds-color-black)" },
  EnCamino:  { bg: "#fff3d0",                   text: "#996600" },
  Entregado: { bg: "var(--ds-color-green-100)",  text: "var(--ds-color-black)" },
  Parcial:   { bg: "#e8f0ff",                   text: "#3366cc" },
};

export default function EntregaPage() {
  const router = useRouter();
  const { obraActual } = useAppStore();
  const [filtro, setFiltro] = useState("Todas");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (obraActual?.id) params.set("obraId", String(obraActual.id));
    fetch(`/api/entrega?${params}`)
      .then(r => r.json())
      .then(d => { setData(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [obraActual]);

  const filtered = data.filter(e => {
    const no   = String(e.EntregaNo ?? "").toLowerCase();
    const desp = String(e.NomDespachado ?? "").toLowerCase();
    const q    = search.toLowerCase();
    const matchSearch = no.includes(q) || desp.includes(q);
    const matchFiltro = filtro === "Todas" || e.Estado === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100dvh",background:"var(--ds-color-surface)" }}>

      {/* Topbar */}
      <div style={{ background:"var(--ds-color-white)",padding:"var(--ds-space-6) var(--ds-space-4) var(--ds-space-4)",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}>
        <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-title)" }}>Boletas de Entrega</div>
        <div style={{ fontSize:12,color:"var(--ds-color-gray-500)",marginTop:2 }}>
          {obraActual ? `Obra ${obraActual.numero ?? obraActual.id}` : "Todas las obras"}
        </div>
        <input
          placeholder="Buscar por # boleta o despachador..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginTop:12,width:"100%",boxSizing:"border-box",padding:"8px 12px",
            borderRadius:"var(--ds-radius-md)",border:"1.5px solid var(--ds-color-gray-200)",
            fontSize:14,outline:"none",background:"var(--ds-color-surface)" }}
        />
        <div style={{ display:"flex",gap:"var(--ds-space-2)",overflowX:"auto",paddingBottom:4,marginTop:8,
          WebkitOverflowScrolling:"touch" } as React.CSSProperties}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              flexShrink:0,padding:"4px 14px",borderRadius:99,
              border:`2px solid ${filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-gray-200)"}`,
              background: filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-white)",
              fontSize:13,fontWeight:600,cursor:"pointer",WebkitTapHighlightColor:"transparent",
            } as React.CSSProperties}>
              {f === "EnCamino" ? "En Camino" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ flex:1,overflowY:"auto",padding:"var(--ds-space-3) var(--ds-space-4)",
        display:"flex",flexDirection:"column",gap:"var(--ds-space-2)" }}>
        {loading && (
          <div style={{ textAlign:"center",padding:32,color:"var(--ds-color-gray-400)" }}>Cargando...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center",padding:32 }}>
            <Icon name="truck" size="lg" color="var(--ds-color-gray-300)" />
            <p style={{ color:"var(--ds-color-gray-400)",marginTop:8,fontSize:14 }}>No hay entregas</p>
          </div>
        )}
        {filtered.map(e => {
          const estado = String(e.Estado ?? "Pendiente");
          const colors = ESTADO_COLOR[estado] ?? { bg:"var(--ds-color-gray-100)",text:"var(--ds-color-gray-500)" };
          const fecha  = String(e.FechaEntrega ?? "").slice(0, 10);
          return (
            <div key={String(e.IDEntrega)}
              onClick={() => router.push(`/entrega/${e.IDEntrega}`)}
              style={{ background:"var(--ds-color-white)",borderRadius:"var(--ds-radius-lg)",
                boxShadow:"var(--ds-shadow-01)",padding:"var(--ds-space-3) var(--ds-space-4)",
                cursor:"pointer",display:"flex",alignItems:"center",gap:"var(--ds-space-3)" }}>
              <div style={{ width:40,height:40,borderRadius:"var(--ds-radius-md)",
                background:"var(--ds-color-surface)",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:20,flexShrink:0 }}>📦</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-label)" }}>
                  {String(e.EntregaNo ?? e.IDEntrega)}
                </div>
                <div style={{ fontSize:12,color:"var(--ds-color-gray-500)",marginTop:2,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                  {fecha}{e.NomDespachado ? ` · ${e.NomDespachado}` : ""}
                </div>
              </div>
              <span style={{ padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                background:colors.bg,color:colors.text,flexShrink:0 }}>
                {estado === "EnCamino" ? "En Camino" : estado}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
