"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Topbar } from "@/components/app/Topbar";
import { OBRAS, ITEMS_CATALOGO } from "@/lib/mockData";
import { SlideButton } from "@/components/ds/SlideButton";

export default function NuevoTrasladoPage() {
  const router = useRouter();
  const { obraActual } = useAppStore();
  const [obraDestino, setObraDestino] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [lineas, setLineas] = useState<{itemNo:string;desc:string;unidad:string;cantidad:number}[]>([]);
  const [saving, setSaving] = useState(false);

  const obrasDestino = OBRAS.filter((o) => o.id !== obraActual?.id);
  const itemsFilt = ITEMS_CATALOGO.filter((i) => i.itemNo.toLowerCase().includes(searchItem.toLowerCase()) || i.desc.toLowerCase().includes(searchItem.toLowerCase()));

  const addItem = (item: typeof ITEMS_CATALOGO[0]) => {
    if (lineas.find((l) => l.itemNo === item.itemNo)) return;
    setLineas((prev) => [...prev, { ...item, cantidad:1 }]);
    setSearchItem("");
  };

  const handleGuardar = async () => {
    if (!obraDestino || lineas.length === 0) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push("/traslado");
  };

  return (
    <>
      <Topbar title="Nuevo Traslado" showBack />
      <div className="app-content">
        <div className="section-card">
          <div className="section-card__title">Ruta</div>
          <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-3)" }}>
            <div style={{ flex:1, textAlign:"center", padding:"var(--ds-space-3)", background:"var(--ds-color-surface)", borderRadius:"var(--ds-radius-md)" }}>
              <div style={{ fontSize:20 }}>🏗️</div>
              <div style={{ fontWeight:700 }}>{obraActual?.numero || "—"}</div>
              <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>Origen</div>
            </div>
            <div style={{ fontSize:20 }}>→</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:"var(--ds-color-gray-400)", marginBottom:"var(--ds-space-1)" }}>Destino</div>
              <select className="field-input" style={{ margin:0 }} value={obraDestino} onChange={(e) => setObraDestino(e.target.value)}>
                <option value="">Seleccionar...</option>
                {obrasDestino.map((o) => <option key={o.id} value={o.id}>{o.numero} · {o.descripcion}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card__title">Agregar materiales</div>
          <input className="field-input" placeholder="Buscar ítem..." value={searchItem} onChange={(e) => setSearchItem(e.target.value)} style={{ marginBottom:"var(--ds-space-2)" }} />
          {searchItem && (
            <div style={{ background:"var(--ds-color-white)", border:"1px solid var(--ds-color-gray-200)", borderRadius:"var(--ds-radius-md)", overflow:"hidden" }}>
              {itemsFilt.slice(0,5).map((item) => (
                <div key={item.itemNo} onClick={() => addItem(item)} style={{ padding:"var(--ds-space-3) var(--ds-space-4)", borderBottom:"1px solid var(--ds-color-gray-100)", cursor:"pointer" }}>
                  <div style={{ fontWeight:600, fontSize:"var(--ds-font-size-body-sm)" }}>{item.itemNo}</div>
                  <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-500)" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {lineas.length > 0 && (
          <div className="section-card">
            <div className="section-card__title">Materiales ({lineas.length})</div>
            {lineas.map((l) => (
              <div key={l.itemNo} className="material-row">
                <div className="material-row__desc">
                  <div style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{l.itemNo}</div>
                  {l.desc}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-2)" }}>
                  <input type="number" min={1} value={l.cantidad}
                    onChange={(e) => setLineas((prev) => prev.map((x) => x.itemNo === l.itemNo ? {...x, cantidad:Number(e.target.value)} : x))}
                    style={{ width:56, padding:"var(--ds-space-1) var(--ds-space-2)", border:"1.5px solid var(--ds-color-gray-200)", borderRadius:"var(--ds-radius-sm)", textAlign:"center", fontSize:"var(--ds-font-size-label)", fontFamily:"var(--ds-font-family)" }} />
                  <span style={{ fontSize:11, color:"var(--ds-color-gray-400)" }}>{l.unidad}</span>
                  <button onClick={() => setLineas((prev) => prev.filter((x) => x.itemNo !== l.itemNo))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ds-color-red-100)", fontSize:18 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="app-bottombar" style={{ padding:"12px 16px", justifyContent:"center" }}>
        <SlideButton
          label={saving ? "Guardando..." : "Crear traslado"}
          confirmedLabel="¡Creado!"
          onConfirm={handleGuardar}
          disabled={!obraDestino || lineas.length === 0 || saving}
          confirmedHoldMs={800}
        />
      </div>
    </>
  );
}
