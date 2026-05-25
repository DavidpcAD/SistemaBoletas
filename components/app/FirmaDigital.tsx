"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

interface FirmaDigitalProps {
  onFirma: (dataUrl: string) => void;
  onCancelar: () => void;
  titulo?: string;
  nombre?: string;
}

export function FirmaDigital({ onFirma, onCancelar, titulo = "Firma", nombre }: FirmaDigitalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    setHasStroke(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }, [drawing]);

  const endDraw = useCallback(() => setDrawing(false), []);

  const limpiar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    setHasStroke(false);
  };

  const confirmar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onFirma(canvas.toDataURL("image/png"));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"var(--ds-space-4)", padding:"var(--ds-space-4)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"var(--ds-font-size-subtitle)", fontWeight:600 }}>{titulo}</div>
        {nombre && <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)" }}>{nombre}</div>}
      </div>

      <div style={{ fontSize:"var(--ds-font-size-body-sm)", color:"var(--ds-color-gray-400)", textAlign:"center" }}>
        Firma dentro del recuadro
      </div>

      <div style={{ position:"relative", background:"var(--ds-color-white)", borderRadius:"var(--ds-radius-lg)", border:"2px dashed var(--ds-color-gray-200)", overflow:"hidden" }}>
        <canvas
          ref={canvasRef}
          style={{ display:"block", width:"100%", height:200, touchAction:"none", cursor:"crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        {!hasStroke && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", color:"var(--ds-color-gray-300)", fontSize:"var(--ds-font-size-body-sm)" }}>
            Firme aquí
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:"var(--ds-space-3)" }}>
        <button className="ds-btn ds-btn--white ds-btn--sm" onClick={limpiar} style={{ flex:1 }}>Limpiar</button>
        <button className="ds-btn ds-btn--black ds-btn--sm" onClick={onCancelar} style={{ flex:1 }}>Cancelar</button>
        <button className="ds-btn ds-btn--green ds-btn--sm" onClick={confirmar} disabled={!hasStroke} style={{ flex:2 }}>
          Confirmar firma
        </button>
      </div>
    </div>
  );
}
