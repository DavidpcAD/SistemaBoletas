"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { springs } from "@/components/ds/springs";
import { haptic } from "@/components/ds/haptic";
import "@/components/ds/design-system.css";

type Rol = "encargado" | "maestro" | "bodeguero" | "transportista";

export default function LoginPage() {
  const router = useRouter();
  const { setRol, setUserEmail, setIdCol } = useAppStore();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Ingresá correo y contraseña"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error de acceso"); return; }
      haptic.complete();
      setRol(data.rol as Rol);
      setUserEmail(data.correo);
      setIdCol(data.IDCol);
      router.push("/obras");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100dvh",background:"var(--ds-color-surface)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"var(--ds-space-6)" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }}
        transition={springs.expanding}
        style={{ marginBottom:"var(--ds-space-10)",textAlign:"center" }}
      >
        <div style={{ width:72,height:72,background:"var(--ds-color-green-100)",
          borderRadius:"var(--ds-radius-xl)",display:"flex",alignItems:"center",
          justifyContent:"center",margin:"0 auto var(--ds-space-4)" }}
        >
          <Icon name="boleta" size="lg" color="var(--ds-color-black)" />
        </div>
        <div style={{ fontSize:"var(--ds-font-size-subtitle-lg)",fontWeight:700,letterSpacing:"-0.5px" }}>
          Boletas Adelante
        </div>
        <div style={{ fontSize:"var(--ds-font-size-label)",color:"var(--ds-color-gray-500)",marginTop:4 }}>
          Sistema de gestión de materiales
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
        transition={springs.snappy}
        style={{ width:"100%",maxWidth:400 }}
      >
        <div style={{ display:"flex",flexDirection:"column",gap:"var(--ds-space-3)" }}>
          <div>
            <div style={{ fontSize:12,fontWeight:700,color:"var(--ds-color-gray-500)",
              letterSpacing:"0.4px",textTransform:"uppercase",marginBottom:6 }}>Correo</div>
            <input type="email" placeholder="nombre@adelante.cr" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ width:"100%",padding:"14px var(--ds-space-4)",border:"2px solid var(--ds-color-gray-200)",
                borderRadius:"var(--ds-radius-lg)",fontSize:"var(--ds-font-size-body-md)",
                fontFamily:"var(--ds-font-family)",background:"var(--ds-color-white)",
                outline:"none",boxSizing:"border-box" }}
              onFocus={(e) => e.target.style.borderColor="var(--ds-color-green-100)"}
              onBlur={(e) =>  e.target.style.borderColor="var(--ds-color-gray-200)"}
            />
          </div>

          <div>
            <div style={{ fontSize:12,fontWeight:700,color:"var(--ds-color-gray-500)",
              letterSpacing:"0.4px",textTransform:"uppercase",marginBottom:6 }}>Contraseña</div>
            <input type="password" placeholder="••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ width:"100%",padding:"14px var(--ds-space-4)",border:"2px solid var(--ds-color-gray-200)",
                borderRadius:"var(--ds-radius-lg)",fontSize:"var(--ds-font-size-body-md)",
                fontFamily:"var(--ds-font-family)",background:"var(--ds-color-white)",
                outline:"none",boxSizing:"border-box" }}
              onFocus={(e) => e.target.style.borderColor="var(--ds-color-green-100)"}
              onBlur={(e) =>  e.target.style.borderColor="var(--ds-color-gray-200)"}
            />
          </div>

          {error && (
            <div style={{ color:"var(--ds-color-red-100)",fontSize:13,fontWeight:600,textAlign:"center" }}>
              {error}
            </div>
          )}

          <Button fullWidth color="green" label={loading ? "Ingresando..." : "Ingresar"}
            layout="icon-right" icon="arrow-right"
            state={loading ? "disabled" : "standard"}
            onClick={handleLogin} />
        </div>
      </motion.div>
    </div>
  );
}
