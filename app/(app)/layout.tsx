"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { Icon } from "@/components/ds/Icon";
import { springs } from "@/components/ds/springs";
import { haptic } from "@/components/ds/haptic";
import "@/components/ds/design-system.css";

type NavItem = { href: string; icon: "home" | "boleta" | "entrega" | "traslado" | "list" | "folder"; label: string };

const NAV_BY_ROL: Record<string, NavItem[]> = {
  encargado:    [{ href:"/obras",icon:"home",label:"Obras"},{href:"/boletas",icon:"boleta",label:"Boletas"},{href:"/entrega",icon:"entrega",label:"Entregas"}],
  maestro:      [{ href:"/obras",icon:"home",label:"Obras"},{href:"/boletas",icon:"boleta",label:"Boletas"},{href:"/aprobaciones",icon:"list",label:"Aprobar"}],
  bodeguero:    [{ href:"/obras",icon:"home",label:"Obras"},{href:"/boletas",icon:"boleta",label:"Boletas"},{href:"/bodega",icon:"folder",label:"Bodega"}],
  transportista:[{ href:"/obras",icon:"home",label:"Obras"},{href:"/entrega",icon:"entrega",label:"Entregas"},{href:"/traslado",icon:"traslado",label:"Traslados"}],
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { rol, isOnline, pendingSync, setOnline } = useAppStore();

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [setOnline]);

  const nav = NAV_BY_ROL[rol ?? "encargado"] ?? NAV_BY_ROL.encargado;

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
      </nav>
    </div>
  );
}
