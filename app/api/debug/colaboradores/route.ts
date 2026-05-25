import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT IDCol, NombreCompleto, Correo, Activo, Puesto
      FROM dbo.Colaboradores
      WHERE (Correo LIKE '%david%' OR NombreCompleto LIKE '%david%' OR NombreCompleto LIKE '%David%')
         OR Activo = 1
      ORDER BY Activo DESC, IDCol
    `);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
