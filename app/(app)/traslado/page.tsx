"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";

type T = Record<string, unknown>;

const FILTROS = ["Todas","SinAutorizar","Aprobado","EnTransito","Completado","Denegado"] as const;

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  SinAutorizar: { bg: "var(--ds-color-yellow)",    text: "var(--ds-color-black)" },
  Aprobado:     { bg: "var(--ds-color-green-100)",  text: "var(--ds-color-black)" },
  Denegado:     { bg: "var(--ds-color-red-100)",    text: "var(--ds-color-white)" },
  EnTransito:   { bg: "#fff3d0",                   text: "#996600" },
  Completado:   { bg: "var(--ds-color-gray-100)",   text: "var(--ds-color-gray-500)" },
};

const LABEL: Record<string, string> = { SinAutorizar:"Sin autorizar", EnTransito:"En Tránsito" };

export default function TrasladoPage() {
  const router = useRouter();
  const { rol, obraActual } = useAppStore();
  const [filtro, setFiltro] = useState("Todas");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (obraActual?.id) params.set("obraId", String(obraActual.id));
    fetch(`/api/traslado?${params}`)
      .then(r => r.json())
      .then(d => { setData(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [obraActual]);

  const filtered = data.filter(t => {
    const no = String(t.TrasladoNo ?? "").toLowerCase();
    const matchSearch = no.includes(search.toLowerCase());
    const matchFiltro = filtro === "Todas" || t.Estado === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100dvh",background:"var(--ds-color-surface)" }}>

      {/* Topbar */}
      <div style={{ background:"var(--ds-color-white)",padding:"var(--ds-space-6) var(--ds-space-4) var(--ds-space-4)",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-title)" }}>Boletas de Traslado</div>
            <div style={{ fontSize:12,color:"var(--ds-color-gray-500)",marginTop:2 }}>Traslados y devoluciones</div>
          </div>
          {(rol === "encargado" || rol === "maestro") && (
            <Button size="sm" color="green" label="+ Nuevo" onClick={() => router.push("/traslado/nueva")} />
          )}
        </div>
        <input
          placeholder="Buscar por # boleta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginTop:12,width:"100%",boxSizing:"border-box",padding:"8px 12px",
            borderRadius:"var(--ds-radius-md)",border:"1.5px solid var(--ds-color-gray-200)",
            fontSize:14,outline:"none",background:"var(--ds-color-surface)" }}
        />
        <div style={{ display:"flex",gap:"var(--ds-space-2)",overflowX:"auto",paddingBottom:4,marginTop:8 }}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              flexShrink:0,padding:"4px 14px",borderRadius:99,
              border:`2px solid ${filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-gray-200)"}`,
              background: filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-white)",
              fontSize:13,fontWeight:600,cursor:"pointer",WebkitTapHighlightColor:"transparent",
            } as React.CSSProperties}>
              {LABEL[f] ?? f}
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
            <p style={{ color:"var(--ds-color-gray-400)",marginTop:8,fontSize:14 }}>No hay traslados</p>
          </div>
        )}
        {filtered.map(t => {
          const estado = String(t.Estado ?? "SinAutorizar");
          const colors = ESTADO_COLOR[estado] ?? { bg:"var(--ds-color-gray-100)",text:"var(--ds-color-gray-500)" };
          const fecha  = String(t.FechaTraslado ?? "").slice(0, 10);
          return (
            <div key={String(t.IDTraslado)}
              onClick={() => router.push(`/traslado/${t.IDTraslado}`)}
              style={{ background:"var(--ds-color-white)",borderRadius:"var(--ds-radius-lg)",
                boxShadow:"var(--ds-shadow-01)",padding:"var(--ds-space-3) var(--ds-space-4)",
                cursor:"pointer",display:"flex",alignItems:"center",gap:"var(--ds-space-3)" }}>
              <div style={{ width:40,height:40,borderRadius:"var(--ds-radius-md)",
                background:"var(--ds-color-surface)",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:20,flexShrink:0 }}>🚛</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-label)" }}>
                  {String(t.TrasladoNo ?? t.IDTraslado)}
                </div>
                <div style={{ fontSize:12,color:"var(--ds-color-gray-500)",marginTop:2,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                  {fecha} · {String(t.IDObraBC ?? "")} → {String(t.IDObraBCDestino ?? "")}
                </div>
              </div>
              <span style={{ padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                background:colors.bg,color:colors.text,flexShrink:0 }}>
                {LABEL[estado] ?? estado}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}