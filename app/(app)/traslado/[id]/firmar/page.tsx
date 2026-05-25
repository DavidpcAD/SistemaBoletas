"use client";
import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { FirmaDigital } from "@/components/app/FirmaDigital";
import { Topbar } from "@/components/app/Topbar";
import { BOLETAS_TRASLADO } from "@/lib/mockData";

export default function FirmarTrasladoPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") || "origen";
  const boleta = BOLETAS_TRASLADO.find((b) => b.id === id) || BOLETAS_TRASLADO[0];
  const [firma, setFirma] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const CONFIG = {
    origen:      { titulo:"Firma de Salida",     subtitulo:"Confirma salida de materiales del almacén origen" },
    destino:     { titulo:"Firma de Llegada",    subtitulo:"Confirma llegada de materiales al destino" },
    encargado:   { titulo:"Firma del Encargado", subtitulo:"Autoriza el traslado de materiales" },
  } as const;
  const cfg = CONFIG[tipo as keyof typeof CONFIG] || CONFIG.origen;

  const handleConfirmar = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push(`/traslado/${id}`);
  };

  return (
    <>
      <Topbar title={cfg.titulo} subtitle={`Traslado ${boleta.numero}`} showBack />
      <div className="app-content">
        <div className="section-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:"var(--ds-font-size-subtitle)" }}>{boleta.obraOrigenNum} → {boleta.obraDestinoNum}</div>
              <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{boleta.materiales.length} ítems · {boleta.fecha}</div>
            </div>
            <span style={{ fontSize:32 }}>{tipo === "destino" ? "🏁" : "🚛"}</span>
          </div>
        </div>
        {firma ? (
          <div className="section-card">
            <div className="section-card__title">Firma capturada ✓</div>
            <img src={firma} alt="Firma" style={{ width:"100%", height:100, objectFit:"contain", border:"1px solid var(--ds-color-gray-200)", borderRadius:"var(--ds-radius-md)" }} />
            <button onClick={() => setFirma(null)} style={{ marginTop:"var(--ds-space-2)", background:"none", border:"none", color:"var(--ds-color-red-100)", cursor:"pointer", fontSize:"var(--ds-font-size-label)", fontFamily:"var(--ds-font-family)" }}>Volver a firmar</button>
          </div>
        ) : (
          <div className="section-card" style={{ padding:0, overflow:"hidden" }}>
            <FirmaDigital titulo={cfg.titulo} nombre={cfg.subtitulo} onFirma={setFirma} onCancelar={() => router.back()} />
          </div>
        )}
      </div>
      {firma && (
        <div className="app-bottombar">
          <button className="ds-btn ds-btn--green ds-btn--full" onClick={handleConfirmar} disabled={saving}>
            {saving ? "Guardando..." : tipo === "origen" ? "🚛 Iniciar traslado" : "✅ Confirmar llegada"}
          </button>
        </div>
      )}
    </>
  );
}
