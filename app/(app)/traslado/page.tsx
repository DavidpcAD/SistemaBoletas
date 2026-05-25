"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { BoletaCard } from "@/components/app/BoletaCard";
import { BOLETAS_TRASLADO } from "@/lib/mockData";

const FILTROS = ["Todas","SinAutorizar","Aprobado","EnTransito","Completado","Denegado"] as const;

export default function TrasladoPage() {
  const router = useRouter();
  const { rol } = useAppStore();
  const [filtro, setFiltro] = useState<string>("Todas");
  const [search, setSearch] = useState("");

  const filtered = BOLETAS_TRASLADO.filter((b) => {
    const matchSearch = b.numero.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === "Todas" || b.estado === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <>
      <Topbar title="Boletas de Traslado" subtitle="Traslados y devoluciones"
        action={(rol === "encargado" || rol === "maestro") && (
          <button className="ds-btn ds-btn--green ds-btn--sm" onClick={() => router.push("/traslado/nueva")}>+ Nuevo</button>
        )} />
      <div style={{ padding:"var(--ds-space-3) var(--ds-space-4) 0" }}>
        <input className="field-input" placeholder="Buscar por # boleta..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom:"var(--ds-space-3)" }} />
        <div style={{ display:"flex", gap:"var(--ds-space-2)", overflowX:"auto", paddingBottom:"var(--ds-space-2)" }}>
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)} style={{ flexShrink:0, padding:"var(--ds-space-1) var(--ds-space-3)", borderRadius:"var(--ds-radius-xl)", border:`2px solid ${filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-gray-200)"}`, background: filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-white)", fontSize:"var(--ds-font-size-body-sm)", fontWeight:600, cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
              {f === "SinAutorizar" ? "Sin autorizar" : f}
            </button>
          ))}
        </div>
      </div>
      <div className="app-content">
        {filtered.length === 0 && (
          <div className="empty-state"><span style={{ fontSize:40 }}>🚛</span><span className="empty-state__text">No hay traslados</span></div>
        )}
        {filtered.map((b) => (
          <BoletaCard key={b.id} numero={b.numero} fecha={b.fecha} estado={b.estado} icon="🚛"
            extra={`${b.obraOrigenNum} → ${b.obraDestinoNum} · ${b.materiales.length} ítems`}
            onClick={() => router.push(`/traslado/${b.id}`)} />
        ))}
      </div>
    </>
  );
}
