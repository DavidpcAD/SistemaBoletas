import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/entrega?obraId=VV-A.01
export async function GET(req: NextRequest) {
  const obraId = req.nextUrl.searchParams.get("obraId");
  try {
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT
        IDEntrega, EntregaNo, IDBoletaSalida, IDObraBC,
        FechaEntrega, Estado, TgEntregado, TgAnulada,
        NomEntregado, NomRecibido, NomDespachado, NomSolicitado,
        Observaciones, TaskNo
      FROM dbo.V_BoletaEntrega
    `;
    if (obraId) {
      request.input("obraId", sql.NVarChar, obraId);
      query += " WHERE IDObraBC = @obraId";
    }
    query += " ORDER BY IDEntrega DESC";
    const result = await request.query(query);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/entrega error:", err);
    return NextResponse.json({ error: "Error al obtener entregas" }, { status: 500 });
  }
}

// POST /api/entrega
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { IDBoletaSalida, IDObraBC, Despachadopor, Entregadopor } = body;
    if (!IDBoletaSalida || !IDObraBC) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    const pool = await getPool();
    const now = new Date().toISOString();
    const result = await pool.request()
      .input("IDBoletaSalida", sql.Int,      IDBoletaSalida)
      .input("IDObraBC",       sql.NVarChar, IDObraBC)
      .input("Despachadopor",  sql.Int,      Despachadopor ?? 1)
      .input("Entregadopor",   sql.Int,      Entregadopor ?? 1)
      .input("IDEstado",       sql.Int,      47)  // En Camino
      .input("FechaCreacion",  sql.NVarChar, now)
      .query(`
        INSERT INTO dbo.BoletaEntrega
          (IDBoletaSalida, IDObraBC, Despachadopor, Entregadopor, IDEstado, FechaCreacion, Creadopor)
        OUTPUT INSERTED.IDEntrega
        VALUES
          (@IDBoletaSalida, @IDObraBC, @Despachadopor, @Entregadopor, @IDEstado, @FechaCreacion, @Despachadopor)
      `);
    return NextResponse.json({ success: true, id: result.recordset[0].IDEntrega }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/entrega error:", err);
    return NextResponse.json({ error: "Error al crear entrega" }, { status: 500 });
  }
}
