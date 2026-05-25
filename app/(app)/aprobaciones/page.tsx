"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { BOLETAS_SALIDA, BOLETAS_TRASLADO } from "@/lib/mockData";

type TabAprob = "salida" | "traslado";

export default function AprobacionesPage() {
  const router = useRouter();
  const { obraActual } = useAppStore();
  const [tab, setTab] = useState<TabAprob>("salida");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [estados, setEstados] = useState<Record<string, string>>({});

  const pendientesSalida  = BOLETAS_SALIDA.filter((b)  => b.estado === "Pendiente");
  const pendientesTraslado = BOLETAS_TRASLADO.filter((b) => b.estado === "SinAutorizar");

  const handleAccion = async (id: string, accion: "aprobar"|"denegar") => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    await new Promise((r) => setTimeout(r, 500));
    setEstados((prev) => ({ ...prev, [id]: accion === "aprobar" ? "Aprobado" : "Denegado" }));
    setLoading((prev) => ({ ...prev, [id]: false }));
  };

  const totalPendientes = pendientesSalida.length + pendientesTraslado.length;

  return (
    <>
      <Topbar title="Aprobaciones" subtitle={`${totalPendientes} pendiente${totalPendientes !== 1 ? "s" : ""}`} />

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"2px solid var(--ds-color-gray-100)", background:"var(--ds-color-white)", flexShrink:0 }}>
        {([["salida","📋 Boletas de salida",pendientesSalida.length],["traslado","🚛 Traslados",pendientesTraslado.length]] as [TabAprob,string,number][]).map(([t,label,count]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"var(--ds-space-3)", background:"none", border:"none", borderBottom: tab === t ? "2px solid var(--ds-color-green-100)" : "2px solid transparent", marginBottom:-2, fontFamily:"var(--ds-font-family)", fontSize:"var(--ds-font-size-label)", fontWeight: tab === t ? 600 : 400, color: tab === t ? "var(--ds-color-black)" : "var(--ds-color-gray-400)", cursor:"pointer", WebkitTapHighlightColor:"transparent", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            {label}
            {count > 0 && <span style={{ background:"var(--ds-color-red-100)", color:"white", borderRadius:10, fontSize:10, padding:"1px 6px", fontWeight:700 }}>{count}</span>}
          </button>
        ))}
      </div>

      <div className="app-content">
        {tab === "salida" && (
          <>
            {pendientesSalida.length === 0 && (
              <div className="empty-state"><span style={{ fontSize:40 }}>✅</span><span className="empty-state__text">No hay boletas pendientes</span></div>
            )}
            {pendientesSalida.map((b) => {
              const estadoLocal = estados[b.id];
              const procesado = !!estadoLocal;
              return (
                <div key={b.id} className="section-card" style={{ marginBottom:"var(--ds-space-3)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"var(--ds-space-3)" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-label)" }}>{b.numero}</div>
                      <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{b.actividad} · Obra {b.obraNum}</div>
                      <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>Encargado: {b.encargado} · {b.fecha}</div>
                    </div>
                    {procesado ? (
                      <span className={`status-chip ${estadoLocal === "Aprobado" ? "status-chip--aprobado" : "status-chip--denegado"}`}>{estadoLocal}</span>
                    ) : (
                      <span className="status-chip status-chip--pendiente">Pendiente</span>
                    )}
                  </div>

                  <div style={{ marginBottom:"var(--ds-space-3)", padding:"var(--ds-space-2) var(--ds-space-3)", background:"var(--ds-color-surface)", borderRadius:"var(--ds-radius-md)" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--ds-color-gray-400)", marginBottom:"var(--ds-space-1)" }}>MATERIALES ({b.materiales.length})</div>
                    {b.materiales.map((m) => (
                      <div key={m.itemNo} style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--ds-font-size-body-sm)", padding:"2px 0" }}>
                        <span style={{ color:"var(--ds-color-gray-500)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>{m.desc}</span>
                        <span style={{ fontWeight:600, flexShrink:0 }}>{m.cantidad} {m.unidad}</span>
                      </div>
                    ))}
                  </div>

                  {!procesado && (
                    <div style={{ display:"flex", gap:"var(--ds-space-2)" }}>
                      <button className="ds-btn ds-btn--white ds-btn--sm" style={{ flex:1 }} onClick={() => router.push(`/boletas/${b.id}`)}>Ver detalle</button>
                      <button className="ds-btn ds-btn--red ds-btn--sm" style={{ flex:1 }} onClick={() => handleAccion(b.id,"denegar")} disabled={loading[b.id]}>Denegar</button>
                      <button className="ds-btn ds-btn--green ds-btn--sm" style={{ flex:1.5 }} onClick={() => handleAccion(b.id,"aprobar")} disabled={loading[b.id]}>
                        {loading[b.id] ? "..." : "Aprobar"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {tab === "traslado" && (
          <>
            {pendientesTraslado.length === 0 && (
              <div className="empty-state"><span style={{ fontSize:40 }}>✅</span><span className="empty-state__text">No hay traslados pendientes</span></div>
            )}
            {pendientesTraslado.map((b) => {
              const estadoLocal = estados[`t_${b.id}`];
              const procesado = !!estadoLocal;
              return (
                <div key={b.id} className="section-card" style={{ marginBottom:"var(--ds-space-3)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"var(--ds-space-3)" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-label)" }}>{b.numero}</div>
                      <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{b.obraOrigenNum} → {b.obraDestinoNum} · {b.fecha}</div>
                    </div>
                    {procesado ? (
                      <span className={`status-chip ${estadoLocal === "Aprobado" ? "status-chip--aprobado" : "status-chip--denegado"}`}>{estadoLocal}</span>
                    ) : (
                      <span className="status-chip status-chip--pendiente">Sin autorizar</span>
                    )}
                  </div>
                  <div style={{ marginBottom:"var(--ds-space-3)", padding:"var(--ds-space-2) var(--ds-space-3)", background:"var(--ds-color-surface)", borderRadius:"var(--ds-radius-md)" }}>
                    {b.materiales.map((m) => (
                      <div key={m.itemNo} style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--ds-font-size-body-sm)", padding:"2px 0" }}>
                        <span style={{ color:"var(--ds-color-gray-500)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>{m.desc}</span>
                        <span style={{ fontWeight:600, flexShrink:0 }}>{m.cantidad} {m.unidad}</span>
                      </div>
                    ))}
                  </div>
                  {!procesado && (
                    <div style={{ display:"flex", gap:"var(--ds-space-2)" }}>
                      <button className="ds-btn ds-btn--white ds-btn--sm" style={{ flex:1 }} onClick={() => router.push(`/traslado/${b.id}`)}>Ver detalle</button>
                      <button className="ds-btn ds-btn--red ds-btn--sm" style={{ flex:1 }} onClick={() => handleAccion(`t_${b.id}`,"denegar")} disabled={loading[`t_${b.id}`]}>Denegar</button>
                      <button className="ds-btn ds-btn--green ds-btn--sm" style={{ flex:1.5 }} onClick={() => handleAccion(`t_${b.id}`,"aprobar")} disabled={loading[`t_${b.id}`]}>
                        {loading[`t_${b.id}`] ? "..." : "Autorizar"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
