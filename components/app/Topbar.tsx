"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface TopbarProps {
  title: string; subtitle?: string; backHref?: string;
  action?: React.ReactNode; showBack?: boolean;
}

export function Topbar({ title, subtitle, backHref, action, showBack = false }: TopbarProps) {
  const router = useRouter();
  return (
    <div className="app-topbar">
      <div style={{ display:"flex", alignItems:"center", gap:"var(--ds-space-2)", flex:1, minWidth:0 }}>
        {(showBack || backHref) && (
          <button
            onClick={() => backHref ? router.push(backHref) : router.back()}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"var(--ds-space-1)", flexShrink:0, fontSize:20, color:"var(--ds-color-black)", WebkitTapHighlightColor:"transparent" }}
          >←</button>
        )}
        <div style={{ minWidth:0 }}>
          <div className="app-topbar__title" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</div>
          {subtitle && <div className="app-topbar__subtitle">{subtitle}</div>}
        </div>
      </div>
      {action && <div style={{ flexShrink:0 }}>{action}</div>}
    </div>
  );
}
