"use client";
import React from "react";

type Estado = string;

const ESTADO_CLASS: Record<string, string> = {
  Pendiente:"status-chip--pendiente", Aprobado:"status-chip--aprobado", Denegado:"status-chip--denegado",
  Preparación:"status-chip--preparacion", Transporte:"status-chip--transporte", Entregado:"status-chip--entregado",
  EnCamino:"status-chip--transporte", Parcial:"status-chip--pendiente",
  SinAutorizar:"status-chip--pendiente", EnTransito:"status-chip--transporte", Completado:"status-chip--entregado",
};

export interface BoletaCardProps {
  numero: string; actividad?: string; fecha: string; estado: Estado;
  materiales?: number; extra?: string; icon?: string; onClick?: () => void;
}

export function BoletaCard({ numero, actividad, fecha, estado, materiales, extra, icon="📋", onClick }: BoletaCardProps) {
  return (
    <div className="boleta-card" onClick={onClick}>
      <div style={{ width:44, height:44, background:"var(--ds-color-gray-100)", borderRadius:"var(--ds-radius-md)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
        {icon}
      </div>
      <div className="boleta-card__info">
        <div className="boleta-card__numero">{numero}</div>
        {actividad && <div className="boleta-card__meta">{actividad}</div>}
        <div className="boleta-card__meta">{fecha}{materiales ? ` · ${materiales} materiales` : ""}</div>
        {extra && <div className="boleta-card__meta">{extra}</div>}
      </div>
      <div className="boleta-card__right">
        <span className={`status-chip ${ESTADO_CLASS[estado] || "status-chip--pendiente"}`}>{estado}</span>
      </div>
    </div>
  );
}
