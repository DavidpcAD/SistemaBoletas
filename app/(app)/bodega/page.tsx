"use client";
import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { STOCK_BODEGA } from "@/lib/mockData";

type Tab = "stock" | "movimientos";

const MOCK_MOVIMIENTOS = [
  { id:"m1", tipo:"Salida",  numero:"BS000094", item:"VARILLA #3 DEFORMADA G40",          cant:-17,  fecha:"24/05/2026" },
  { id:"m2", tipo:"Entrada", numero:"RC000021", item:"CEMENTO PORTLAND TIPO I SACO 50KG", cant:+100, fecha:"23/05/2026" },
  { id:"m3", tipo:"Salida",  numero:"BS000093", item:'TUBO CONDUIT EMT 1/2" X 3M',        cant:-40,  fecha:"23/05/2026" },
  { id:"m4", tipo:"Traslado",numero:"BT000011", item:"PLATINA DE ACERO ESMALTADA 4\"",    cant:-10,  fecha:"22/05/2026" },
  { id:"m5", tipo:"Entrada", numero:"RC000020", item:"BLOCKS 15X20X40 CM",                cant:+300, fecha:"21/05/2026" },
];

export default function BodegaPage() {
  const { obraActual } = useAppStore();
  const [tab, setTab] = useState<Tab>("stock");
  const [search, setSearch] = useState("");

  const stockFiltrado = STOCK_BODEGA.filter((s) => s.itemNo.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Bodega" subtitle={obraActual ? `Obra ${obraActual.numero}` : "Almacén General"} />

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"2px solid var(--ds-color-gray-100)", background:"var(--ds-color-white)", flexShrink:0 }}>
        {(["stock","movimientos"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"var(--ds-space-3)", background:"none", border:"none", borderBottom: tab === t ? "2px solid var(--ds-color-green-100)" : "2px solid transparent", marginBottom:-2, fontFamily:"var(--ds-font-family)", fontSize:"var(--ds-font-size-label)", fontWeight: tab === t ? 600 : 400, color: tab === t ? "var(--ds-color-black)" : "var(--ds-color-gray-400)", cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
            {t === "stock" ? "📦 Stock" : "📋 Movimientos"}
          </button>
        ))}
      </div>

      {tab === "stock" && (
        <>
          <div style={{ padding:"var(--ds-space-3) var(--ds-space-4) 0" }}>
            <input className="field-input" placeholder="Buscar ítem..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="app-content">
            {/* Resumen */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"var(--ds-space-2)", marginBottom:"var(--ds-space-3)" }}>
              {[
                { label:"Ítems",      value:String(STOCK_BODEGA.length),  color:"var(--ds-color-black)" },
                { label:"Stock bajo", value:String(STOCK_BODEGA.filter((s) => s.stock < s.minimo).length), color:"var(--ds-color-red-100)" },
                { label:"OK",         value:String(STOCK_BODEGA.filter((s) => s.stock >= s.minimo).length), color:"var(--ds-color-green-200)" },
              ].map((kpi) => (
                <div key={kpi.label} className="section-card" style={{ padding:"var(--ds-space-3)", textAlign:"center", margin:0 }}>
                  <div style={{ fontSize:"var(--ds-font-size-subtitle)", fontWeight:700, color:kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize:10, color:"var(--ds-color-gray-400)", marginTop:2 }}>{kpi.label}</div>
                </div>
              ))}
            </div>

            {stockFiltrado.map((s) => {
              const bajo = s.stock < s.minimo;
              return (
                <div key={s.itemNo} className="section-card" style={{ marginBottom:"var(--ds-space-2)", padding:"var(--ds-space-3) var(--ds-space-4)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"var(--ds-space-3)" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{s.itemNo}</div>
                      <div style={{ fontSize:"var(--ds-font-size-label)", fontWeight:600, lineHeight:"var(--ds-line-height-label)" }}>{s.desc}</div>
                      <div style={{ fontSize:11, color:"var(--ds-color-gray-400)", marginTop:2 }}>{s.almacen}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:"var(--ds-font-size-subtitle)", fontWeight:700, color: bajo ? "var(--ds-color-red-100)" : "var(--ds-color-green-200)" }}>{s.stock}</div>
                      <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{s.unidad}</div>
                    </div>
                  </div>
                  <div style={{ marginTop:"var(--ds-space-2)", height:4, background:"var(--ds-color-gray-100)", borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${Math.min(100,(s.stock/Math.max(s.stock,s.minimo*2))*100)}%`, background: bajo ? "var(--ds-color-red-100)" : "var(--ds-color-green-100)", borderRadius:2 }} />
                  </div>
                  {bajo && <div style={{ marginTop:"var(--ds-space-1)", fontSize:11, color:"var(--ds-color-red-100)", fontWeight:600 }}>⚠️ Stock bajo mínimo ({s.minimo})</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "movimientos" && (
        <div className="app-content">
          {MOCK_MOVIMIENTOS.map((m) => (
            <div key={m.id} className="section-card" style={{ marginBottom:"var(--ds-space-2)", padding:"var(--ds-space-3) var(--ds-space-4)", display:"flex", alignItems:"center", gap:"var(--ds-space-3)" }}>
              <div style={{ width:40, height:40, borderRadius:"var(--ds-radius-md)", background: m.cant > 0 ? "rgba(173,208,16,0.1)" : "rgba(201,108,108,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                {m.tipo === "Entrada" ? "⬇️" : m.tipo === "Salida" ? "⬆️" : "↔️"}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"var(--ds-font-size-label)", fontWeight:600 }}>{m.tipo} · {m.numero}</div>
                <div style={{ fontSize:11, color:"var(--ds-color-gray-400)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.item}</div>
                <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{m.fecha}</div>
              </div>
              <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-label)", color: m.cant > 0 ? "var(--ds-color-green-200)" : "var(--ds-color-red-100)", flexShrink:0 }}>
                {m.cant > 0 ? "+" : ""}{m.cant}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
