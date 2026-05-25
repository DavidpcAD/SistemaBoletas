"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { ProgressSteps } from "@/components/app/ProgressSteps";
import { BOLETAS_TRASLADO } from "@/lib/mockData";

const STEPS = ["Sin autorizar","Aprobado","En tránsito","Completado"];
const STEP_IDX: Record<string,number> = { SinAutorizar:0, Aprobado:1, Denegado:0, EnTransito:2, Completado:3 };

export default function DetalleTrasladoPage() {
  const router = useRouter();
  const { id } = useParams();
  const { rol } = useAppStore();
  const found = BOLETAS_TRASLADO.find((b) => b.id === id);
  const [boleta, setBoleta] = useState(found || BOLETAS_TRASLADO[0]);
  const [loading, setLoading] = useState(false);

  const handleAccion = async (accion: "aprobar"|"denegar") => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setBoleta((prev) => ({ ...prev, estado: accion === "aprobar" ? "Aprobado" : "Denegado" }));
    setLoading(false);
  };

  const stepIdx = STEP_IDX[boleta.estado] ?? 0;

  return (
    <>
      <Topbar title={boleta.numero} subtitle={`${boleta.obraOrigenNum} → ${boleta.obraDestinoNum}`} showBack
        action={<span className={`status-chip status-chip--${boleta.estado === "Completado" ? "entregado" : boleta.estado === "Aprobado" ? "aprobado" : boleta.estado === "Denegado" ? "denegado" : boleta.estado === "EnTransito" ? "transporte" : "pendiente"}`}>{boleta.estado === "SinAutorizar" ? "Sin autorizar" : boleta.estado}</span>}
      />
      <ProgressSteps steps={STEPS} currentStep={stepIdx} />

      <div className="app-content">
        <div className="section-card">
          <div className="section-card__title">Ruta del traslado</div>
          <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-4)", padding:"var(--ds-space-2) 0" }}>
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:28 }}>🏗️</div>
              <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-subtitle)" }}>{boleta.obraOrigenNum}</div>
              <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>Origen</div>
            </div>
            <div style={{ fontSize:24 }}>→</div>
            <div style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:28 }}>🏗️</div>
              <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-subtitle)" }}>{boleta.obraDestinoNum}</div>
              <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>Destino</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--ds-space-3)", marginTop:"var(--ds-space-3)", paddingTop:"var(--ds-space-3)", borderTop:"1px solid var(--ds-color-gray-100)" }}>
            {[["Fecha",boleta.fecha],["Transportista",boleta.transportista||"—"]].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{k}</div>
                <div style={{ fontSize:"var(--ds-font-size-label)", fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card__title">Materiales ({boleta.materiales.length})</div>
          {boleta.materiales.map((m) => (
            <div key={m.itemNo} className="material-row">
              <div className="material-row__desc">
                <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{m.itemNo}</div>
                {m.desc}
              </div>
              <div className="material-row__qty">{m.cantidad} {m.unidad}</div>
            </div>
          ))}
        </div>

        {/* Acciones por rol */}
        {rol === "maestro" && boleta.estado === "SinAutorizar" && (
          <div style={{ display:"flex", gap:"var(--ds-space-3)" }}>
            <button className="ds-btn ds-btn--red ds-btn--full" onClick={() => handleAccion("denegar")} disabled={loading}>Denegar</button>
            <button className="ds-btn ds-btn--green ds-btn--full" onClick={() => handleAccion("aprobar")} disabled={loading}>Aprobar traslado</button>
          </div>
        )}
        {rol === "transportista" && boleta.estado === "Aprobado" && (
          <button className="ds-btn ds-btn--green ds-btn--full" onClick={() => router.push(`/traslado/${id}/firmar?tipo=origen`)}>
            🚛 Iniciar traslado — Firmar salida
          </button>
        )}
        {rol === "transportista" && boleta.estado === "EnTransito" && (
          <button className="ds-btn ds-btn--green ds-btn--full" onClick={() => router.push(`/traslado/${id}/firmar?tipo=destino`)}>
            ✅ Confirmar llegada — Firmar recepción
          </button>
        )}
        {(rol === "encargado") && boleta.estado === "SinAutorizar" && (
          <button className="ds-btn ds-btn--black ds-btn--full" onClick={() => router.push(`/traslado/${id}/firmar?tipo=encargado`)}>
            ✍️ Firmar solicitud de traslado
          </button>
        )}
      </div>
    </>
  );
}
