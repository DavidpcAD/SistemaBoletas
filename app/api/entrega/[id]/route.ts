import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/entrega/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const pool = await getPool();
    const [entResult, detResult] = await Promise.all([
      pool.request()
        .input("id", sql.Int, parseInt(id))
        .query(`SELECT * FROM dbo.V_BoletaEntrega WHERE IDEntrega = @id`),
      pool.request()
        .input("id", sql.Int, parseInt(id))
        .query(`SELECT * FROM dbo.V_BolentregaDET WHERE IDEntrega = @id`),
    ]);
    if (entResult.recordset.length === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ entrega: entResult.recordset[0], items: detResult.recordset });
  } catch (err: unknown) {
    console.error("GET /api/entrega/[id] error:", err);
    return NextResponse.json({ error: "Error al obtener entrega" }, { status: 500 });
  }
}
