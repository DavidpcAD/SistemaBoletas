import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// POST /api/auth/login
// body: { correo, contrasena }
export async function POST(req: NextRequest) {
  try {
    const { correo, contrasena } = await req.json();
    if (!correo || !contrasena) {
      return NextResponse.json({ error: "Credenciales requeridas" }, { status: 400 });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input("correo",     sql.NVarChar, correo)
      .input("contrasena", sql.NVarChar, contrasena)
      .query(`
        SELECT TOP 1
          c.IDCol, c.NombreCompleto, c.Correo, c.Departamento, c.Puesto, c.Iniciales,
          c.Activo,
          STRING_AGG(r.NombreRol, ',') AS Roles
        FROM dbo.Colaboradores c
        LEFT JOIN dbo.ColaboradorRoles cr ON cr.IDCol = c.IDCol
        LEFT JOIN dbo.Roles r ON r.IDRol = cr.IDRol
        WHERE c.Correo = @correo AND c.Contrasena = @contrasena AND c.Activo = 1
        GROUP BY c.IDCol, c.NombreCompleto, c.Correo, c.Departamento, c.Puesto, c.Iniciales, c.Activo
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const user = result.recordset[0];
    // Map DB roles to app roles
    const roles: string[] = user.Roles ? user.Roles.split(",") : [];
    let appRol: string = "encargado";
    if (roles.some((r: string) => r === "Maestro de Obra")) appRol = "maestro";
    else if (roles.some((r: string) => r === "Encargado")) appRol = "encargado";
    else if (roles.some((r: string) => r === "Bodeguero" || r === "Jefe de Bodega")) appRol = "bodeguero";
    else if (roles.some((r: string) => r === "Transportista")) appRol = "transportista";

    return NextResponse.json({
      IDCol: user.IDCol,
      nombre: user.NombreCompleto,
      correo: user.Correo,
      rol: appRol,
      iniciales: user.Iniciales,
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 });
  }
}
