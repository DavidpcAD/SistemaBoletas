"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Topbar } from "@/components/app/Topbar";
import { BOLETAS_SALIDA } from "@/lib/mockData";

export default function PrepararPage() {
  const router = useRouter();
  const { id } = useParams();
  const boleta = BOLETAS_SALIDA.find((b) => b.id === id) || BOLETAS_SALIDA[1];
  const [materiales, setMateriales] = useState(
    boleta.materiales.map((m) => ({ ...m, cantPreparada: m.cantidad, disponible: m.cantidad + 20 }))
  );
  const [saving, setSaving] = useState(false);

  const updateCant = (itemNo: string, val: number) =>
    setMateriales((prev) => prev.map((m) => m.itemNo === itemNo ? { ...m, cantPreparada: Math.min(val, m.disponible) } : m));

  const handleLanzar = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push(`/boletas/${id}/firmar?rol=bodeguero`);
  };

  return (
    <>
      <Topbar title="Preparar Solicitud" subtitle={boleta.numero} showBack />
      <div className="app-content">
        <div className="section-card">
          <div className="section-card__title">Información</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--ds-space-3)" }}>
            {[{ label:"Obra",      value:boleta.obraNum },
              { label:"Actividad", value:boleta.actividad },
              { label:"Encargado", value:boleta.encargado },
              { label:"Fecha",     value:boleta.fecha }].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{f.label}</div>
                <div style={{ fontSize:"var(--ds-font-size-label)", fontWeight:600 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card__title">Materiales a preparar</div>
          {materiales.map((m) => (
            <div key={m.itemNo} style={{ padding:"var(--ds-space-3) 0", borderBottom:"1px solid var(--ds-color-gray-100)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"var(--ds-space-2)" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{m.itemNo}</div>
                  <div style={{ fontSize:"var(--ds-font-size-label)", lineHeight:"var(--ds-line-height-label)" }}>{m.desc}</div>
                  <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)", marginTop:2 }}>
                    Disponible: <strong>{m.disponible} {m.unidad}</strong> · Solicitado: <strong>{m.cantidad}</strong>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-2)", flexShrink:0 }}>
                  <button onClick={() => updateCant(m.itemNo, Math.max(0, m.cantPreparada - 1))}
                    style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid var(--ds-color-gray-200)", background:"var(--ds-color-white)", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                  <span style={{ minWidth:32, textAlign:"center", fontWeight:600, fontSize:"var(--ds-font-size-label)" }}>{m.cantPreparada}</span>
                  <button onClick={() => updateCant(m.itemNo, Math.min(m.disponible, m.cantPreparada + 1))}
                    style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid var(--ds-color-gray-200)", background:"var(--ds-color-white)", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                  <span style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)", minWidth:24 }}>{m.unidad}</span>
                </div>
              </div>
              {m.cantPreparada < m.cantidad && (
                <div style={{ marginTop:"var(--ds-space-1)", fontSize:"var(--ds-font-size-body-sm)", color:"#856404", background:"#FFF3CD", padding:"2px var(--ds-space-2)", borderRadius:"var(--ds-radius-sm)", display:"inline-block" }}>
                  ⚠️ Stock insuficiente para cantidad completa
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="app-bottombar">
        <button className="ds-btn ds-btn--green ds-btn--full" onClick={handleLanzar} disabled={saving}>
          {saving ? "Procesando..." : "Lanzar a transporte →"}
        </button>
      </div>
    </>
  );
}
