"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { ProgressSteps } from "@/components/app/ProgressSteps";
import { BOLETAS_ENTREGA } from "@/lib/mockData";

const STEPS = ["Pendiente","En camino","Entregado"];
const STEP_IDX: Record<string,number> = { Pendiente:0, EnCamino:1, Entregado:2, Parcial:1 };

export default function DetalleEntregaPage() {
  const router = useRouter();
  const { id } = useParams();
  const { rol } = useAppStore();
  const found = BOLETAS_ENTREGA.find((b) => b.id === id);
  const [boleta, setBoleta] = useState(found || BOLETAS_ENTREGA[0]);

  const stepIdx = STEP_IDX[boleta.estado] ?? 0;
  const totalItems = boleta.materiales.length;
  const itemsEntregados = boleta.materiales.filter((m) => m.cantEnt >= m.cantidad).length;

  return (
    <>
      <Topbar title={boleta.numero} subtitle={`Transportista: ${boleta.transportista}`} showBack
        action={<span className={`status-chip status-chip--${boleta.estado === "Entregado" ? "entregado" : boleta.estado === "EnCamino" ? "transporte" : boleta.estado === "Parcial" ? "pendiente" : "pendiente"}`}>{boleta.estado}</span>}
      />
      <ProgressSteps steps={STEPS} currentStep={stepIdx} />

      <div className="app-content">
        {/* Progreso general */}
        <div className="section-card">
          <div className="section-card__title">Progreso de entrega</div>
          <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-3)" }}>
            <div style={{ flex:1 }}>
              <div style={{ height:8, background:"var(--ds-color-gray-100)", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(itemsEntregados/totalItems)*100}%`, background:"var(--ds-color-green-100)", borderRadius:4, transition:"width 400ms" }} />
              </div>
            </div>
            <span style={{ fontWeight:700, fontSize:"var(--ds-font-size-label)", flexShrink:0 }}>{itemsEntregados}/{totalItems}</span>
          </div>
          <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)", marginTop:"var(--ds-space-2)" }}>
            {itemsEntregados === totalItems ? "✅ Entrega completa" : `${totalItems - itemsEntregados} ítem${totalItems - itemsEntregados > 1 ? "s" : ""} pendiente${totalItems - itemsEntregados > 1 ? "s" : ""}`}
          </div>
        </div>

        {/* Info */}
        <div className="section-card">
          <div className="section-card__title">Información</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--ds-space-3)" }}>
            {[["Fecha",boleta.fecha],["Transportista",boleta.transportista],["Estado",boleta.estado],["Items",String(totalItems)]].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{k}</div>
                <div style={{ fontSize:"var(--ds-font-size-label)", fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Materiales con progreso */}
        <div className="section-card">
          <div className="section-card__title">Materiales</div>
          {boleta.materiales.map((m) => {
            const pct = Math.min(100, Math.round((m.cantEnt / m.cantidad) * 100));
            const completo = m.cantEnt >= m.cantidad;
            return (
              <div key={m.itemNo} style={{ padding:"var(--ds-space-3) 0", borderBottom:"1px solid var(--ds-color-gray-100)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--ds-space-1)" }}>
                  <div>
                    <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{m.itemNo}</div>
                    <div style={{ fontSize:"var(--ds-font-size-label)" }}>{m.desc}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <span style={{ fontWeight:700, color: completo ? "var(--ds-color-green-200)" : "var(--ds-color-gray-500)" }}>{m.cantEnt}</span>
                    <span style={{ color:"var(--ds-color-gray-400)" }}>/{m.cantidad} {m.unidad}</span>
                  </div>
                </div>
                <div style={{ height:4, background:"var(--ds-color-gray-100)", borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background: completo ? "var(--ds-color-green-100)" : "var(--ds-color-yellow)", borderRadius:2, transition:"width 400ms" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        {rol === "transportista" && boleta.estado === "EnCamino" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--ds-space-3)" }}>
            <button className="ds-btn ds-btn--green ds-btn--full" onClick={() => router.push(`/entrega/${id}/firmar`)}>
              ✍️ Confirmar entrega con firma
            </button>
            <button className="ds-btn ds-btn--white ds-btn--full" onClick={() => router.push(`/traslado/nueva?from=entrega&entregaId=${id}`)}>
              ↩️ Generar devolución/traslado
            </button>
          </div>
        )}
        {rol === "encargado" && (boleta.estado === "EnCamino" || boleta.estado === "Parcial") && (
          <button className="ds-btn ds-btn--green ds-btn--full" onClick={() => router.push(`/entrega/${id}/firmar`)}>
            ✍️ Confirmar recepción en obra
          </button>
        )}
      </div>
    </>
  );
}
