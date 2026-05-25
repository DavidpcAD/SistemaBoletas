import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/items?q=varilla
// Retorna catálogo de materiales distintos usados en boletas de salida
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT DISTINCT
        itemNo,
        Descripcion,
        unitOfMeasureCode
      FROM dbo.V_BoletaSalidaDET
      WHERE itemNo IS NOT NULL
        AND Descripcion IS NOT NULL
    `;
    if (q) {
      request.input("q", sql.NVarChar, `%${q}%`);
      query += " AND Descripcion LIKE @q";
    }
    query += " ORDER BY Descripcion";
    const result = await request.query(query);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/items error:", err);
    return NextResponse.json({ error: "Error al obtener items" }, { status: 500 });
  }
}
