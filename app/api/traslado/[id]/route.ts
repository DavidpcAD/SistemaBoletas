import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/traslado/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const pool = await getPool();
    const [tResult, detResult] = await Promise.all([
      pool.request()
        .input("id", sql.Int, parseInt(id))
        .query(`SELECT * FROM dbo.V_BoletaTraslado WHERE IDTraslado = @id`),
      pool.request()
        .input("id", sql.Int, parseInt(id))
        .query(`SELECT * FROM dbo.V_BoletaTrasladoDET WHERE IDTraslado = @id`),
    ]);
    if (tResult.recordset.length === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ traslado: tResult.recordset[0], items: detResult.recordset });
  } catch (err: unknown) {
    console.error("GET /api/traslado/[id] error:", err);
    return NextResponse.json({ error: "Error al obtener traslado" }, { status: 500 });
  }
}
