"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { SlideButton } from "@/components/ds/SlideButton";

interface Material {
  itemNo: string;
  Descripcion: string;
  quantity: number;
  CantidadEntregable: number | null;
  unitOfMeasureCode: string;
  cantPreparada: number;
}

export default function PrepararPage() {
  const router = useRouter();
  const { id }  = useParams<{ id: string }>();
  const { idCol } = useAppStore();
  const [boleta, setBoleta]       = useState<Record<string,unknown> | null>(null);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/boletas/${id}`)
      .then(r => r.json())
      .then(d => {
        setBoleta(d.boleta ?? null);
        setMateriales(
          (d.materiales ?? []).map((m: Record<string,unknown>) => ({
            itemNo:              String(m.itemNo ?? ""),
            Descripcion:         String(m.Descripcion ?? ""),
            quantity:            Number(m.quantity ?? 0),
            CantidadEntregable:  m.CantidadEntregable != null ? Number(m.CantidadEntregable) : null,
            unitOfMeasureCode:   String(m.unitOfMeasureCode ?? ""),
            cantPreparada:       Number(m.CantidadEntregable ?? m.quantity ?? 0),
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateCant = (itemNo: string, delta: number) =>
    setMateriales(prev => prev.map(m =>
      m.itemNo === itemNo
        ? { ...m, cantPreparada: Math.max(0, Math.min(
            m.cantPreparada + delta,
            Math.min(m.quantity, m.CantidadEntregable ?? m.quantity)
          )) }
        : m
    ));

  const handleLanzar = async () => {
    if (!boleta) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/entrega", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDBoletaSalida: boleta.IDBoletaSalida,
          IDObraBC:       boleta.IDObraBC,
          Despachadopor:  idCol,
          materiales:     materiales.map(m => ({
            itemNo:            m.itemNo,
            Descripcion:       m.Descripcion,
            quantity:          m.cantPreparada,
            unitOfMeasureCode: m.unitOfMeasureCode,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear entrega");
      router.push("/boletas");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al procesar");
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding:32, textAlign:"center", color:"var(--ds-color-gray-400)" }}>Cargando...</div>;
  if (!boleta)  return <div style={{ padding:32, textAlign:"center" }}>Boleta no encontrada</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"var(--ds-color-surface)" }}>
      <Topbar title="Preparar Solicitud" subtitle={String(boleta.DetBSalida ?? id)} showBack />

      {/* Scrollable content — extra bottom padding to clear fixed bar + nav */}
      <div style={{ flex:1, overflowY:"auto", padding:"var(--ds-space-4)",
        paddingBottom:"calc(var(--ds-space-4) + 160px)" }}>

        {/* Info */}
        <div style={{ background:"var(--ds-color-white)", borderRadius:"var(--ds-radius-lg)",
          boxShadow:"var(--ds-shadow-01)", padding:"var(--ds-space-4)", marginBottom:"var(--ds-space-3)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--ds-space-3)" }}>
            {[
              { label:"Obra",      value: String(boleta.IDObraBC ?? "") },
              { label:"Actividad", value: String(boleta.TareaObra ?? "") },
              { label:"Encargado", value: String(boleta.NomCreadoPor ?? "") },
              { label:"Fecha",     value: String(boleta.FechaStr ?? "") },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{f.label}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{f.value || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div style={{ background:"var(--ds-color-white)", borderRadius:"var(--ds-radius-lg)",
          boxShadow:"var(--ds-shadow-01)", overflow:"hidden" }}>
          <div style={{ padding:"var(--ds-space-3) var(--ds-space-4)",
            borderBottom:"1px solid var(--ds-color-gray-100)",
            fontWeight:700, fontSize:11, color:"var(--ds-color-gray-500)",
            letterSpacing:"0.4px", textTransform:"uppercase" }}>
            Materiales a preparar
          </div>
          {materiales.map((m, i) => (
            <div key={m.itemNo || i} style={{ padding:"var(--ds-space-3) var(--ds-space-4)",
              borderBottom: i < materiales.length - 1 ? "1px solid var(--ds-color-gray-100)" : "none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{m.itemNo}</div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{m.Descripcion}</div>
                  <div style={{ fontSize:11, marginTop:2 }}>
                    <span style={{ color:"var(--ds-color-gray-400)" }}>Solicitado: <strong style={{ color:"var(--ds-color-black)" }}>{m.quantity} {m.unitOfMeasureCode}</strong></span>
                    {m.CantidadEntregable != null && (
                      <span style={{
                        marginLeft:6,
                        color: m.CantidadEntregable < m.quantity ? "#DC2626" : "#16a34a",
                        fontWeight:600
                      }}>
                        · Stock: {m.CantidadEntregable}{m.CantidadEntregable < m.quantity ? " ⚠" : " ✓"}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <button onClick={() => updateCant(m.itemNo, -1)}
                    style={{ width:32, height:32, borderRadius:"50%",
                      border:"1.5px solid var(--ds-color-gray-200)",
                      background:"var(--ds-color-white)", cursor:"pointer", fontSize:18,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                  <span style={{ minWidth:32, textAlign:"center", fontWeight:700, fontSize:16 }}>
                    {m.cantPreparada}
                  </span>
                  <button onClick={() => updateCant(m.itemNo, 1)}
                    style={{ width:32, height:32, borderRadius:"50%",
                      border:"1.5px solid var(--ds-color-gray-200)",
                      background:"var(--ds-color-white)", cursor:"pointer", fontSize:18,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              </div>
              {m.cantPreparada < m.quantity && (
                <div style={{ marginTop:6, fontSize:11, color:"#856404", background:"#FFF3CD",
                  padding:"2px 8px", borderRadius:4, display:"inline-block" }}>
                  ⚠ Entrega parcial
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginTop:"var(--ds-space-3)", padding:"var(--ds-space-3)",
            borderRadius:"var(--ds-radius-md)", background:"#FEE2E2",
            color:"#DC2626", fontSize:13, fontWeight:600, textAlign:"center" }}>
            {error}
          </div>
        )}
      </div>

      {/* Bottom action — fixed above the bottom nav (~68px) */}
      <div style={{
        position:"fixed", bottom:68, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:430,
        padding:"var(--ds-space-3) var(--ds-space-4)",
        background:"var(--ds-color-white)",
        borderTop:"1px solid var(--ds-color-gray-100)",
        zIndex:110,
      }}>
        {error && (
          <div style={{ marginBottom:8, padding:"8px 12px", borderRadius:8,
            background:"#FEE2E2", color:"#DC2626", fontSize:13, fontWeight:600, textAlign:"center" }}>
            {error}
          </div>
        )}
        <SlideButton
          label={saving ? "Generando entrega..." : "Lanzar a transporte"}
          confirmedLabel="¡En camino!"
          onConfirm={handleLanzar}
          disabled={saving}
          confirmedHoldMs={1200}
        />
      </div>
    </div>
  );
}
