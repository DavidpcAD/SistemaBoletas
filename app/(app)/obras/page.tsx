"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { SearchBar } from "@/components/ds/SearchBar";
import { Icon } from "@/components/ds/Icon";
import { springs } from "@/components/ds/springs";
import { haptic } from "@/components/ds/haptic";


const ROL_ICON: Record<string, "user"|"list"|"folder"|"traslado"> = {
  encargado:"user", maestro:"list", bodeguero:"folder", transportista:"traslado"
};

const ROL_LABEL: Record<string, string> = {
  encargado:"Encargado", maestro:"Maestro de obras", bodeguero:"Bodeguero", transportista:"Transportista"
};

type ObraDB = { IDObraBC: string; Proyecto: string | null };

export default function ObrasPage() {
  const router    = useRouter();
  const { obraActual, setObraActual, rol, userEmail, idCol } = useAppStore();
  const [search, setSearch]   = useState("");
  const [pressed, setPressed] = useState<string|null>(null);
  const [obras, setObras]     = useState<ObraDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (idCol) params.set("idCol", String(idCol));
    fetch(`/api/obras?${params}`)
      .then(r => r.json())
      .then(d => { setObras(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [idCol]);

  const filtered = obras
    .map(o => ({
      id:          o.IDObraBC,
      numero:      o.IDObraBC,
      descripcion: o.Proyecto ?? o.IDObraBC,
    }))
    .filter(o =>
      o.numero.toLowerCase().includes(search.toLowerCase()) ||
      o.descripcion.toLowerCase().includes(search.toLowerCase())
    );

  const handleSelect = (obra: { id: string; numero: string; descripcion: string }) => {
    haptic.select();
    setObraActual(obra);
    setTimeout(() => {
      const dest = rol === "transportista" ? "/entrega" : "/boletas";
      router.push(dest);
    }, 120);
  };

  return (
    <div className="app-shell" style={{ background:"var(--ds-color-surface)" }}>
      {/* ── Header ── */}
      <div style={{ padding:"var(--ds-space-6) var(--ds-space-4) var(--ds-space-4)",
        background:"var(--ds-color-white)",
        borderBottom:"1px solid var(--ds-color-gray-100)" }}
      >
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
          <span style={{ fontSize:"var(--ds-font-size-subtitle)",fontWeight:700,letterSpacing:"-0.3px" }}>
            Obras
          </span>
          <div style={{ display:"flex",alignItems:"center",gap:8,
            background:"var(--ds-color-surface)",borderRadius:"var(--ds-radius-xl)",
            padding:"6px 12px 6px 8px" }}
          >
            <div style={{ width:28,height:28,borderRadius:"50%",background:"var(--ds-color-green-100)",
              display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Icon name={ROL_ICON[rol ?? "encargado"] ?? "user"} size="sm" color="var(--ds-color-black)" />
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:1 }}>
              <span style={{ fontSize:11,fontWeight:600,lineHeight:1 }}>
                {userEmail?.split("@")[0] ?? "Usuario"}
              </span>
              <span style={{ fontSize:10,color:"var(--ds-color-gray-500)",lineHeight:1 }}>
                {ROL_LABEL[rol ?? "encargado"]}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop:"var(--ds-space-3)" }}>
          <SearchBar
            layout="label"
            placeholder="Buscar obra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClose={search ? () => setSearch("") : undefined}
          />
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ padding:"var(--ds-space-3) var(--ds-space-4)", display:"flex", flexDirection:"column", gap:8 }}>
        {loading && (
          <div style={{ textAlign:"center",padding:32,color:"var(--ds-color-gray-400)" }}>Cargando obras...</div>
        )}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={springs.expanding}
            style={{ textAlign:"center",padding:"40px 0",color:"var(--ds-color-gray-400)" }}
          >
            <Icon name="search" size="lg" color="var(--ds-color-gray-300)" />
            <p style={{ marginTop:12,fontSize:"var(--ds-font-size-label)",fontWeight:600 }}>Sin resultados</p>
          </motion.div>
        )}

        {filtered.map((obra, i) => {
          const isActive  = obraActual?.id === obra.id;
          const isPressed = pressed === obra.id;
          return (
            <motion.div
              key={obra.id}
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ ...springs.expanding, delay: i * 0.04 }}
            >
              <motion.button
                type="button"
                animate={{ scale: isPressed ? 0.97 : 1 }}
                transition={springs.snappy}
                onPointerDown={() => { setPressed(obra.id); haptic.select(); }}
                onPointerUp={() => { setPressed(null); handleSelect(obra); }}
                onPointerLeave={() => setPressed(null)}
                style={{ width:"100%",textAlign:"left",border:"none",cursor:"pointer",
                  background:"var(--ds-color-white)",
                  borderRadius:"var(--ds-radius-lg)",
                  padding:"var(--ds-space-4)",
                  boxShadow: isActive ? "0 0 0 2px var(--ds-color-green-100)" : "var(--ds-shadow-01)",
                  display:"flex",alignItems:"center",gap:"var(--ds-space-3)",
                  WebkitTapHighlightColor:"transparent" }}
              >
                {/* Badge */}
                <div style={{ width:48,height:48,flexShrink:0,borderRadius:"var(--ds-radius-md)",
                  background: isActive ? "var(--ds-color-green-100)" : "var(--ds-color-surface)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:700,fontSize:"var(--ds-font-size-label)",
                  color: isActive ? "var(--ds-color-black)" : "var(--ds-color-gray-500)" }}
                >
                  {obra.numero}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600,fontSize:"var(--ds-font-size-body-md)",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                    {obra.descripcion}
                  </div>
                  <div style={{ fontSize:"var(--ds-font-size-body-sm)",color:"var(--ds-color-gray-500)",marginTop:2 }}>
                    Obra {obra.numero}
                  </div>
                </div>

                {/* Check */}
                <motion.span
                  animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                  transition={springs.completing}
                  style={{ flexShrink:0 }}
                >
                  <Icon name="check" size="lg" color="var(--ds-color-green-200)" />
                </motion.span>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
