"use client";
import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { FirmaDigital } from "@/components/app/FirmaDigital";
import { Topbar } from "@/components/app/Topbar";
import { BOLETAS_SALIDA } from "@/lib/mockData";

export default function FirmarBoletaPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rol = searchParams.get("rol") || "encargado";
  const boleta = BOLETAS_SALIDA.find((b) => b.id === id) || BOLETAS_SALIDA[0];
  const [firma, setFirma] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const titulo = rol === "bodeguero" ? "Firma del Bodeguero" : rol === "transportista" ? "Firma del Transportista" : "Firma del Encargado";
  const nombre = rol === "bodeguero" ? "Confirma despacho de materiales" : rol === "transportista" ? "Confirma recepción para transporte" : "Confirma solicitud de materiales";

  const handleFirma = (dataUrl: string) => setFirma(dataUrl);

  const handleConfirmar = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push(`/boletas/${id}`);
  };

  return (
    <>
      <Topbar title={titulo} subtitle={`Boleta ${boleta.numero}`} showBack />
      <div className="app-content">
        <div className="section-card">
          <div className="section-card__title">Detalles de la boleta</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--ds-space-2)" }}>
            {[["Obra", boleta.obraNum], ["Actividad", boleta.actividad], ["Fecha", boleta.fecha], ["Encargado", boleta.encargado]].map(([k, v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"var(--ds-color-gray-400)", fontSize:"var(--ds-font-size-label)" }}>{k}</span>
                <span style={{ fontWeight:600, fontSize:"var(--ds-font-size-label)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {firma ? (
          <div className="section-card">
            <div className="section-card__title">Firma capturada</div>
            <img src={firma} alt="Firma" style={{ width:"100%", height:120, objectFit:"contain", border:"1px solid var(--ds-color-gray-200)", borderRadius:"var(--ds-radius-md)" }} />
            <button onClick={() => setFirma(null)} style={{ marginTop:"var(--ds-space-2)", background:"none", border:"none", color:"var(--ds-color-red-100)", cursor:"pointer", fontSize:"var(--ds-font-size-label)", fontFamily:"var(--ds-font-family)" }}>
              Volver a firmar
            </button>
          </div>
        ) : (
          <div className="section-card" style={{ padding:0, overflow:"hidden" }}>
            <FirmaDigital titulo={titulo} nombre={nombre} onFirma={handleFirma} onCancelar={() => router.back()} />
          </div>
        )}
      </div>
      {firma && (
        <div className="app-bottombar">
          <button className="ds-btn ds-btn--green ds-btn--full" onClick={handleConfirmar} disabled={saving}>
            {saving ? "Guardando..." : "Confirmar firma"}
          </button>
        </div>
      )}
    </>
  );
}
