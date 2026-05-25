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
  SinAutorizar: { bg: "var(--ds-color-yellow)",    text: "var(--ds-color-black)" },
  Aprobado:     { bg: "var(--ds-color-green-100)",  text: "var(--ds-color-black)" },
  Denegado:     { bg: "var(--ds-color-red-100)",    text: "var(--ds-color-white)" },
  EnTransito:   { bg: "#fff3d0",                   text: "#996600" },
  Completado:   { bg: "var(--ds-color-gray-100)",   text: "var(--ds-color-gray-500)" },
};
const LABEL: Record<string, string> = { SinAutorizar:"Sin autorizar", EnTransito:"En Tránsito" };
const PASOS = ["Sin autorizar", "Aprobado", "En Tránsito", "Completado"];
const PASO_IDX: Record<string, number> = { SinAutorizar:0, Aprobado:1, Denegado:0, EnTransito:2, Completado:3 };

export default function TrasladoDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { rol } = useAppStore();
  const [data, setData] = useState<{ traslado: R; items: R[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/traslado/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding:32,textAlign:"center" }}><p>Cargando...</p></div>;

  if (!data?.traslado) return (
    <div style={{ padding:32,textAlign:"center" }}>
      <Icon name="info" size="lg" color="var(--ds-color-gray-300)" />
      <p>Traslado no encontrado</p>
      <Button label="Volver" color="black" size="sm" onClick={() => router.back()} />
    </div>
  );

  const { traslado, items } = data;
  const estado  = String(traslado.Estado ?? "SinAutorizar");
  const colors  = ESTADO_COLOR[estado] ?? { bg:"var(--ds-color-gray-100)",text:"var(--ds-color-gray-500)" };
  const pasoIdx = PASO_IDX[estado] ?? 0;
  const numero  = String(traslado.TrasladoNo ?? traslado.IDTraslado);

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100dvh",background:"var(--ds-color-surface)" }}>

      {/* Topbar */}
      <div style={{ background:"var(--ds-color-white)",padding:"var(--ds-space-6) var(--ds-space-4) var(--ds-space-4)",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"var(--ds-space-3)" }}>
          <Button size="sm" color="white" layout="icon" icon="back" onClick={() => router.back()} ariaLabel="Volver" />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-body-md)" }}>{numero}</div>
            <div style={{ fontSize:12,color:"var(--ds-color-gray-500)",marginTop:1 }}>Boleta de Traslado</div>
          </div>
          <span style={{ padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:700,
            background:colors.bg,color:colors.text }}>
            {LABEL[estado] ?? estado}
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

        {/* Ruta */}
        <div style={{ margin:"var(--ds-space-3) var(--ds-space-4) 0",background:"var(--ds-color-white)",
          borderRadius:"var(--ds-radius-lg)",boxShadow:"var(--ds-shadow-01)",padding:"var(--ds-space-4)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"var(--ds-space-3)" }}>
            <div style={{ flex:1,textAlign:"center" }}>
              <div style={{ fontSize:28 }}>🏗️</div>
              <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-subtitle)" }}>
                {String(traslado.IDObraBC ?? "—")}
              </div>
              <div style={{ fontSize:11,color:"var(--ds-color-gray-400)" }}>Origen</div>
              {traslado.nomTareaOrigen && (
                <div style={{ fontSize:11,color:"var(--ds-color-gray-500)",marginTop:2 }}>
                  {String(traslado.nomTareaOrigen)}
                </div>
              )}
            </div>
            <div style={{ fontSize:24,color:"var(--ds-color-gray-400)" }}>→</div>
            <div style={{ flex:1,textAlign:"center" }}>
              <div style={{ fontSize:28 }}>🏗️</div>
              <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-subtitle)" }}>
                {String(traslado.IDObraBCDestino ?? "—")}
              </div>
              <div style={{ fontSize:11,color:"var(--ds-color-gray-400)" }}>Destino</div>
              {traslado.nomTareaDestino && (
                <div style={{ fontSize:11,color:"var(--ds-color-gray-500)",marginTop:2 }}>
                  {String(traslado.nomTareaDestino)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ margin:"var(--ds-space-3) var(--ds-space-4) 0",background:"var(--ds-color-white)",
          borderRadius:"var(--ds-radius-lg)",boxShadow:"var(--ds-shadow-01)",overflow:"hidden" }}>
          {[
            { label:"Número",      value:numero },
            { label:"Solicitado",  value:String(traslado.NomSolicitado ?? "—") },
            { label:"Observ.",     value:String(traslado.Observaciones ?? "—") },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"var(--ds-space-3) var(--ds-space-4)",
              borderBottom: i < arr.length-1 ? "1px solid var(--ds-color-gray-100)" : "none" }}>
              <span style={{ fontSize:"var(--ds-font-size-label)",color:"var(--ds-color-gray-500)",fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:"var(--ds-font-size-label)",fontWeight:600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Materiales */}
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

        {/* Acciones */}
        <div style={{ padding:"var(--ds-space-4) var(--ds-space-4) calc(var(--ds-space-4) + 80px)",
          display:"flex",flexDirection:"column",gap:"var(--ds-space-3)",marginTop:"var(--ds-space-3)" }}>
          {rol === "maestro" && estado === "SinAutorizar" && (
            <motion.div style={{ display:"flex",gap:"var(--ds-space-3)" }}
              initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={springs.expanding}>
              <Button fullWidth color="red" layout="icon-left" icon="close" label="Denegar" onClick={() => {}} />
              <Button fullWidth color="green" layout="icon-left" icon="check" label="Aprobar" onClick={() => {}} />
            </motion.div>
          )}
          {rol === "transportista" && estado === "Aprobado" && (
            <Button fullWidth color="green" layout="icon-left" icon="truck" label="Iniciar traslado — Firmar salida"
              onClick={() => router.push(`/traslado/${id}/firmar?tipo=origen`)} />
          )}
          {rol === "transportista" && estado === "EnTransito" && (
            <Button fullWidth color="green" layout="icon-left" icon="check" label="Confirmar llegada — Firmar recepción"
              onClick={() => router.push(`/traslado/${id}/firmar?tipo=destino`)} />
          )}
          {rol === "encargado" && estado === "SinAutorizar" && (
            <Button fullWidth color="black" layout="icon-left" icon="check" label="Firmar solicitud de traslado"
              onClick={() => router.push(`/traslado/${id}/firmar?tipo=encargado`)} />
          )}
          <Button fullWidth color="white" layout="icon-left" icon="back" label="Volver"
            onClick={() => router.back()} />
        </div>

      </div>
    </div>
  );
}

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
