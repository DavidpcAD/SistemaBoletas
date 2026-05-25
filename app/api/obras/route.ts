import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/obras?idCol=857
// Retorna obras distintas con su nombre (Proyecto) desde V_BoletaSalida
// Si se pasa idCol, filtra por colaborador creador; si no, devuelve todas
export async function GET(req: NextRequest) {
  const idColParam = req.nextUrl.searchParams.get("idCol");
  try {
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT
        bs.IDObraBC,
        MAX(COALESCE(v.Proyecto, bs.IDObraBC)) AS Proyecto
      FROM dbo.BoletaSalida bs
      LEFT JOIN dbo.V_BoletaSalida v ON v.IDBoletaSalida = bs.IDBoletaSalida
      WHERE bs.IDObraBC IS NOT NULL
    `;
    if (idColParam) {
      request.input("idCol", sql.Int, parseInt(idColParam));
      query += " AND bs.Creadopor = @idCol";
    }
    query += " GROUP BY bs.IDObraBC ORDER BY bs.IDObraBC";
    const result = await request.query(query);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/obras error:", err);
    return NextResponse.json({ error: "Error al obtener obras" }, { status: 500 });
  }
}
