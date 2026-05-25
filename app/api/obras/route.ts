import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/obras  — retorna lista de obras activas (IDObraBC distintos)
export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT DISTINCT IDObraBC
      FROM dbo.BoletaSalida
      WHERE IDObraBC IS NOT NULL
      ORDER BY IDObraBC
    `);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/obras error:", err);
    return NextResponse.json({ error: "Error al obtener obras" }, { status: 500 });
  }
}
