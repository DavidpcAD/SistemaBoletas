"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { FirmaDigital } from "@/components/app/FirmaDigital";
import { Topbar } from "@/components/app/Topbar";
import { SlideToConfirm } from "@/components/ds/SlideToConfirm";
import { BOLETAS_ENTREGA } from "@/lib/mockData";

export default function FirmarEntregaPage() {
  const router = useRouter();
  const { id } = useParams();
  const { rol } = useAppStore();
  const boleta = BOLETAS_ENTREGA.find((b) => b.id === id) || BOLETAS_ENTREGA[0];
  const [firma, setFirma] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const esTransportista = rol === "transportista";
  const titulo = esTransportista ? "Firma del Transportista" : "Firma del Encargado";
  const subtitulo = esTransportista ? "Confirma entrega de materiales en obra" : "Confirma recepción de materiales";

  const handleConfirmar = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push(`/entrega/${id}`);
  };

  return (
    <>
      <Topbar title={titulo} subtitle={`Entrega ${boleta.numero}`} showBack />
      <div className="app-content">
        <div className="section-card">
          <div className="section-card__title">Resumen de entrega</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--ds-space-2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"var(--ds-color-gray-400)" }}>Transportista</span>
              <span style={{ fontWeight:600 }}>{boleta.transportista}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"var(--ds-color-gray-400)" }}>Materiales</span>
              <span style={{ fontWeight:600 }}>{boleta.materiales.length} ítems</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"var(--ds-color-gray-400)" }}>Fecha</span>
              <span style={{ fontWeight:600 }}>{boleta.fecha}</span>
            </div>
          </div>
        </div>

        {firma ? (
          <div className="section-card">
            <div className="section-card__title">Firma capturada ✓</div>
            <img src={firma} alt="Firma" style={{ width:"100%", height:100, objectFit:"contain", border:"1px solid var(--ds-color-gray-200)", borderRadius:"var(--ds-radius-md)" }} />
            <button onClick={() => setFirma(null)} style={{ marginTop:"var(--ds-space-2)", background:"none", border:"none", color:"var(--ds-color-red-100)", cursor:"pointer", fontSize:"var(--ds-font-size-label)", fontFamily:"var(--ds-font-family)" }}>
              Volver a firmar
            </button>
          </div>
        ) : (
          <div className="section-card" style={{ padding:0, overflow:"hidden" }}>
            <FirmaDigital titulo={titulo} nombre={subtitulo} onFirma={setFirma} onCancelar={() => router.back()} />
          </div>
        )}
      </div>
      {firma && (
        <div className="app-bottombar" style={{ padding:"12px 16px" }}>
          <SlideToConfirm
            label={saving ? "Guardando..." : "Confirmar entrega"}
            onConfirm={handleConfirmar}
            enabled={!saving}
            successHoldMs={600}
          />
        </div>
      )}
    </>
  );
}
