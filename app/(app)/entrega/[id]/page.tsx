"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { springs } from "@/components/ds/springs";

type R = Record<string, unknown>;

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  Pendiente: { bg: "var(--ds-color-yellow)",    text: "var(--ds-color-black)" },
  EnCamino:  { bg: "#fff3d0",                   text: "#996600" },
  Entregado: { bg: "var(--ds-color-green-100)",  text: "var(--ds-color-black)" },
  Parcial:   { bg: "#e8f0ff",                   text: "#3366cc" },
};
const ESTADO_TRASLADO_COLOR: Record<string, { bg: string; text: string }> = {
  SinAutorizar: { bg: "var(--ds-color-yellow)",    text: "var(--ds-color-black)" },
  Aprobado:     { bg: "var(--ds-color-green-100)",  text: "var(--ds-color-black)" },
  Denegado:     { bg: "var(--ds-color-red-100)",    text: "var(--ds-color-white)" },
  EnTransito:   { bg: "#fff3d0",                   text: "#996600" },
  Completado:   { bg: "var(--ds-color-gray-100)",   text: "var(--ds-color-gray-500)" },
};
const PASOS = ["Pendiente", "En Camino", "Entregado"];
const PASO_IDX: Record<string, number> = { Pendiente:0, EnCamino:1, Entregado:2, Parcial:1 };

export default function EntregaDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { rol } = useAppStore();
  const [data, setData] = useState<{ entrega: R; items: R[] } | null>(null);
  const [traslados, setTraslados] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/entrega/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (d.entrega?.IDEntrega) {
          fetch(`/api/traslado?entregaId=${d.entrega.IDEntrega}`)
            .then(r => r.json())
            .then(t => setTraslados(t.data ?? []));
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding:32,textAlign:"center" }}><p>Cargando...</p></div>;

  if (!data?.entrega) return (
    <div style={{ padding:32,textAlign:"center" }}>
      <Icon name="info" size="lg" color="var(--ds-color-gray-300)" />
      <p>Entrega no encontrada</p>
      <Button label="Volver" color="black" size="sm" onClick={() => router.back()} />
    </div>
  );

  const { entrega, items } = data;
  const estado  = String(entrega.Estado ?? "Pendiente");
  const colors  = ESTADO_COLOR[estado] ?? { bg:"var(--ds-color-gray-100)",text:"var(--ds-color-gray-500)" };
  const pasoIdx = PASO_IDX[estado] ?? 0;
  const numero  = String(entrega.EntregaNo ?? entrega.IDEntrega);
  const fecha   = String(entrega.FechaEntrega ?? "").slice(0, 10);

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100dvh",background:"var(--ds-color-surface)" }}>

      {/* Topbar */}
      <div style={{ background:"var(--ds-color-white)",padding:"var(--ds-space-6) var(--ds-space-4) var(--ds-space-4)",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"var(--ds-space-3)" }}>
          <Button size="sm" color="white" layout="icon" icon="back" onClick={() => router.back()} ariaLabel="Volver" />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-body-md)" }}>{numero}</div>
            <div style={{ fontSize:12,color:"var(--ds-color-gray-500)",marginTop:1 }}>
              {entrega.NomDespachado ? `Despachado: ${entrega.NomDespachado}` : "Boleta de Entrega"}
            </div>
          </div>
          <span style={{ padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:700,
            background:colors.bg,color:colors.text }}>
            {estado === "EnCamino" ? "En Camino" : estado}
          </span>
        </div>
      </div>

      <div style={{ flex:1,overflowY:"auto" }}>

        {/* Progress */}
        <div style={{ background:"var(--ds-color-white)",padding:"var(--ds-space-4)",
          margin:"var(--ds-space-3) var(--ds-space-4) 0",borderRadius:"var(--ds-radius-lg)",
          boxShadow:"var(--ds-shadow-01)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative" }}>
            <div style={{ position:"absolute",top:"50%",left:20,right:20,height:2,
              background:"var(--ds-color-gray-100)",transform:"translateY(-50%)",zIndex:0 }} />
            <div style={{ position:"absolute",top:"50%",left:20,height:2,zIndex:1,
              background:"var(--ds-color-green-100)",transform:"translateY(-50%)",
              width:`${(pasoIdx/(PASOS.length-1))*100}%`,transition:"width 0.4s ease" }} />
            {PASOS.map((paso, i) => {
              const done    = i <= pasoIdx;
              const current = i === pasoIdx;
              return (
                <div key={paso} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6,zIndex:2,flex:1 }}>
                  <motion.div
                    animate={{ scale:current?1.15:1, background:done?"var(--ds-color-green-100)":"var(--ds-color-gray-200)" }}
                    transition={springs.completing}
                    style={{ width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {done && <Icon name="check" size="sm" color="var(--ds-color-black)" />}
                  </motion.div>
                  <span style={{ fontSize:10,fontWeight:600,color:done?"var(--ds-color-black)":"var(--ds-color-gray-400)",
                    textAlign:"center",lineHeight:1.2 }}>
                    {paso}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div style={{ margin:"var(--ds-space-3) var(--ds-space-4) 0",background:"var(--ds-color-white)",
          borderRadius:"var(--ds-radius-lg)",boxShadow:"var(--ds-shadow-01)",overflow:"hidden" }}>
          {[
            { label:"Número",       value:numero },
            { label:"Fecha",        value:fecha },
            { label:"Despachado",   value:String(entrega.NomDespachado ?? "—") },
            { label:"Recibido por", value:String(entrega.NomRecibido ?? "—") },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"var(--ds-space-3) var(--ds-space-4)",
              borderBottom: i < arr.length-1 ? "1px solid var(--ds-color-gray-100)" : "none" }}>
              <span style={{ fontSize:"var(--ds-font-size-label)",color:"var(--ds-color-gray-500)",fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:"var(--ds-font-size-label)",fontWeight:600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div style={{ margin:"var(--ds-space-3) var(--ds-space-4) 0" }}>
            <div style={{ fontSize:"var(--ds-font-size-body-sm)",fontWeight:700,color:"var(--ds-color-gray-500)",
              letterSpacing:"0.4px",textTransform:"uppercase",marginBottom:8 }}>
              Materiales ({items.length})
            </div>
            <div style={{ background:"var(--ds-color-white)",borderRadius:"var(--ds-radius-lg)",
              boxShadow:"var(--ds-shadow-01)",overflow:"hidden" }}>
              {items.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }}
                  transition={{ ...springs.expanding, delay:i*0.04 }}
                  style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"var(--ds-space-3) var(--ds-space-4)",
                    borderBottom: i < items.length-1 ? "1px solid var(--ds-color-gray-100)" : "none" }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:"var(--ds-font-size-label)",fontWeight:500,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                      {String(m.Descripcion ?? "")}
                    </div>
                    <div style={{ fontSize:11,color:"var(--ds-color-gray-400)",marginTop:2 }}>
                      {String(m.unitOfMeasureCode ?? "")}
                    </div>
                  </div>
                  <span style={{ flexShrink:0,fontWeight:700,fontSize:"var(--ds-font-size-body-md)",marginLeft:16 }}>
                    {String(m.quantity ?? "")}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Traslados asociados */}
        <div style={{ margin:"var(--ds-space-3) var(--ds-space-4) 0" }}>
          <div style={{ fontSize:"var(--ds-font-size-body-sm)",fontWeight:700,color:"var(--ds-color-gray-500)",
            letterSpacing:"0.4px",textTransform:"uppercase",marginBottom:8 }}>
            Traslados ({traslados.length})
          </div>
          {traslados.length === 0 ? (
            <div style={{ background:"var(--ds-color-white)",borderRadius:"var(--ds-radius-lg)",
              boxShadow:"var(--ds-shadow-01)",padding:"var(--ds-space-4)",textAlign:"center",
              fontSize:13,color:"var(--ds-color-gray-400)" }}>
              Sin traslados asociados
            </div>
          ) : (
            <div style={{ background:"var(--ds-color-white)",borderRadius:"var(--ds-radius-lg)",
              boxShadow:"var(--ds-shadow-01)",overflow:"hidden" }}>
              {traslados.map((t, i) => {
                const tE = String(t.Estado ?? "SinAutorizar");
                const tc = ESTADO_TRASLADO_COLOR[tE] ?? { bg:"var(--ds-color-gray-100)",text:"var(--ds-color-gray-500)" };
                const tLabel: Record<string,string> = { SinAutorizar:"Sin autorizar",EnTransito:"En Tránsito" };
                return (
                  <div key={String(t.IDTraslado)}
                    onClick={() => router.push(`/traslado/${t.IDTraslado}`)}
                    style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"var(--ds-space-3) var(--ds-space-4)",cursor:"pointer",
                      borderBottom: i < traslados.length-1 ? "1px solid var(--ds-color-gray-100)" : "none" }}>
                    <div>
                      <div style={{ fontWeight:600,fontSize:"var(--ds-font-size-label)" }}>
                        {String(t.TrasladoNo ?? t.IDTraslado)}
                      </div>
                      <div style={{ fontSize:11,color:"var(--ds-color-gray-400)",marginTop:2 }}>
                        {String(t.IDObraBC ?? "")} → {String(t.IDObraBCDestino ?? "")}
                      </div>
                    </div>
                    <span style={{ padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                      background:tc.bg,color:tc.text,flexShrink:0 }}>
                      {tLabel[tE] ?? tE}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ padding:"var(--ds-space-4) var(--ds-space-4) calc(var(--ds-space-4) + 80px)",
          display:"flex",flexDirection:"column",gap:"var(--ds-space-3)",marginTop:"var(--ds-space-3)" }}>
          {rol === "transportista" && estado === "EnCamino" && (
            <Button fullWidth color="green" layout="icon-left" icon="check" label="Confirmar entrega con firma"
              onClick={() => router.push(`/entrega/${id}/firmar`)} />
          )}
          {rol === "encargado" && (estado === "EnCamino" || estado === "Parcial") && (
            <Button fullWidth color="green" layout="icon-left" icon="check" label="Confirmar recepción en obra"
              onClick={() => router.push(`/entrega/${id}/firmar`)} />
          )}
          <Button fullWidth color="white" layout="icon-left" icon="back" label="Volver"
            onClick={() => router.back()} />
        </div>

      </div>
    </div>
  );
}

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
