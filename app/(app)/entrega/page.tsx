"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { BoletaCard } from "@/components/app/BoletaCard";
import { BOLETAS_ENTREGA } from "@/lib/mockData";

const FILTROS = ["Todas","Pendiente","EnCamino","Entregado","Parcial"] as const;

export default function EntregaPage() {
  const router = useRouter();
  const { obraActual, rol } = useAppStore();
  const [filtro, setFiltro] = useState<string>("Todas");
  const [search, setSearch] = useState("");

  const filtered = BOLETAS_ENTREGA.filter((b) => {
    const matchSearch = b.numero.toLowerCase().includes(search.toLowerCase()) || b.transportista.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === "Todas" || b.estado === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <>
      <Topbar title="Boletas de Entrega" subtitle={obraActual ? `Obra ${obraActual.numero}` : "Todas las obras"} />
      <div style={{ padding:"var(--ds-space-3) var(--ds-space-4) 0" }}>
        <input className="field-input" placeholder="Buscar por # boleta o transportista..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom:"var(--ds-space-3)" }} />
        <div style={{ display:"flex", gap:"var(--ds-space-2)", overflowX:"auto", paddingBottom:"var(--ds-space-2)" }}>
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)} style={{ flexShrink:0, padding:"var(--ds-space-1) var(--ds-space-3)", borderRadius:"var(--ds-radius-xl)", border:`2px solid ${filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-gray-200)"}`, background: filtro === f ? "var(--ds-color-green-100)" : "var(--ds-color-white)", fontSize:"var(--ds-font-size-body-sm)", fontWeight:600, cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="app-content">
        {filtered.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize:40 }}>📦</span>
            <span className="empty-state__text">No hay entregas</span>
          </div>
        )}
        {filtered.map((b) => (
          <BoletaCard key={b.id} numero={b.numero} fecha={b.fecha} estado={b.estado} icon="📦"
            extra={`Transportista: ${b.transportista} · ${b.materiales.length} items`}
            onClick={() => router.push(`/entrega/${b.id}`)} />
        ))}
      </div>
    </>
  );
}
