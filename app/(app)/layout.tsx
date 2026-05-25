"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { Icon } from "@/components/ds/Icon";
import { springs } from "@/components/ds/springs";
import { haptic } from "@/components/ds/haptic";
import "@/components/ds/design-system.css";

type NavItem = { href: string; icon: "home" | "boleta" | "entrega" | "traslado" | "list" | "folder"; label: string };

const NAV_BY_ROL: Record<string, NavItem[]> = {
  encargado:    [{ href:"/obras",  icon:"home",    label:"Obras"   }, { href:"/boletas",icon:"boleta",  label:"Boletas" }],
  maestro:      [{ href:"/obras",  icon:"home",    label:"Obras"   }, { href:"/aprobaciones",icon:"list",label:"Aprobar"}],
  bodeguero:    [{ href:"/boletas",icon:"boleta",  label:"Boletas" }, { href:"/bodega", icon:"folder",  label:"Bodega"  }],
  transportista:[{ href:"/entrega",icon:"entrega", label:"Entregas"}, { href:"/traslado",icon:"traslado",label:"Traslados"}],
};

const ROL_LABEL: Record<string, string> = {
  encargado:    "Encargado",
  maestro:      "Maestro de Obra",
  bodeguero:    "Bodeguero",
  transportista:"Transportista",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { rol, isOnline, pendingSync, setOnline, userName, userEmail, obraActual, reset } = useAppStore();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [setOnline]);

  const nav = NAV_BY_ROL[rol ?? "encargado"] ?? NAV_BY_ROL.encargado;

  const handleLogout = () => {
    haptic.select();
    reset();
    setShowProfile(false);
    router.push("/login");
  };

  // Initials from name
  const initials = userName
    ? userName.split(" ").slice(0,2).map((w: string) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="app-shell">
      {!isOnline && (
        <div style={{ position:"fixed",top:8,right:12,zIndex:200,pointerEvents:"none" }}>
          <motion.span
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            transition={springs.snappy}
            style={{ background:"var(--ds-color-gray-500)",color:"#fff",fontSize:11,fontWeight:600,
              padding:"2px 10px",borderRadius:99,letterSpacing:"0.4px" }}
          >
            {pendingSync > 0 ? `${pendingSync} pendientes` : "Sin conexión"}
          </motion.span>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity:0, x:14 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-14 }}
          transition={springs.snappy}
          style={{ flex:1, overflow:"hidden" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <nav className="app-bottombar">
        {nav.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== "/obras" && pathname.startsWith(href));
          return (
            <a key={href} href={href} className={`app-nav-item${active?" app-nav-item--active":""}`}
              onClick={() => haptic.select()}
              style={{ textDecoration:"none",flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:3,padding:"8px 0",WebkitTapHighlightColor:"transparent" }}
            >
              <motion.span animate={{ scale:active?1.1:1, y:active?-1:0 }} transition={springs.snappy}
                style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}
              >
                <Icon name={icon} size="lg" color={active?"var(--ds-color-green-100)":"var(--ds-color-gray-400)"} />
                <span style={{ fontSize:10,fontWeight:active?600:400,letterSpacing:"0.4px",
                  color:active?"var(--ds-color-green-100)":"var(--ds-color-gray-400)",textTransform:"uppercase" }}>
                  {label}
                </span>
              </motion.span>
            </a>
          );
        })}

        {/* Perfil button */}
        <button
          onClick={() => { haptic.select(); setShowProfile(true); }}
          style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:3,padding:"8px 0",background:"none",border:"none",cursor:"pointer",
            WebkitTapHighlightColor:"transparent" }}
        >
          <motion.span animate={{ scale:1 }} transition={springs.snappy}
            style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}
          >
            <div style={{ width:26,height:26,borderRadius:99,
              background:"var(--ds-color-gray-700)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <span style={{ fontSize:10,fontWeight:700,color:"#fff",letterSpacing:"0.5px" }}>{initials}</span>
            </div>
            <span style={{ fontSize:10,fontWeight:400,letterSpacing:"0.4px",
              color:"var(--ds-color-gray-400)",textTransform:"uppercase" }}>Perfil</span>
          </motion.span>
        </button>
      </nav>

      {/* Profile sheet */}
      <AnimatePresence>
        {showProfile && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              onClick={() => setShowProfile(false)}
              style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:300 }}
            />
            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={springs.snappy}
              style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:301,
                background:"var(--ds-color-white)",borderRadius:"20px 20px 0 0",
                padding:"var(--ds-space-6) var(--ds-space-4) calc(var(--ds-space-6) + env(safe-area-inset-bottom))" }}
            >
              {/* Handle */}
              <div style={{ width:40,height:4,borderRadius:99,background:"var(--ds-color-gray-200)",
                margin:"0 auto var(--ds-space-6)" }} />

              {/* Avatar + name */}
              <div style={{ display:"flex",alignItems:"center",gap:"var(--ds-space-4)",
                marginBottom:"var(--ds-space-6)" }}>
                <div style={{ width:56,height:56,borderRadius:99,
                  background:"var(--ds-color-gray-800)",display:"flex",alignItems:"center",justifyContent:"center",
                  flexShrink:0 }}>
                  <span style={{ fontSize:20,fontWeight:700,color:"#fff" }}>{initials}</span>
                </div>
                <div>
                  <div style={{ fontWeight:700,fontSize:"var(--ds-font-size-subtitle)",
                    color:"var(--ds-color-black)" }}>{userName ?? "Usuario"}</div>
                  <div style={{ fontSize:"var(--ds-font-size-label)",color:"var(--ds-color-gray-500)",marginTop:2 }}>
                    {userEmail}
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display:"flex",flexDirection:"column",gap:"var(--ds-space-2)",
                marginBottom:"var(--ds-space-6)" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"var(--ds-space-3) var(--ds-space-4)",
                  background:"var(--ds-color-surface)",borderRadius:"var(--ds-radius-md)" }}>
                  <span style={{ fontSize:"var(--ds-font-size-label)",color:"var(--ds-color-gray-500)" }}>Rol</span>
                  <span style={{ fontWeight:600,fontSize:"var(--ds-font-size-label)" }}>
                    {ROL_LABEL[rol ?? ""] ?? rol}
                  </span>
                </div>
                {obraActual && (
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"var(--ds-space-3) var(--ds-space-4)",
                    background:"var(--ds-color-surface)",borderRadius:"var(--ds-radius-md)" }}>
                    <span style={{ fontSize:"var(--ds-font-size-label)",color:"var(--ds-color-gray-500)" }}>Obra activa</span>
                    <span style={{ fontWeight:600,fontSize:"var(--ds-font-size-label)",
                      maxWidth:180,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {obraActual.descripcion}
                    </span>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{ width:"100%",padding:"var(--ds-space-4)",borderRadius:"var(--ds-radius-md)",
                  background:"#FEE2E2",border:"none",cursor:"pointer",
                  fontWeight:700,fontSize:"var(--ds-font-size-label)",color:"#DC2626",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  WebkitTapHighlightColor:"transparent" }}
              >
                <Icon name="close" size="md" color="#DC2626" />
                Cerrar sesión
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
