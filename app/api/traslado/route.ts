import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/traslado?obraId=VV-A.01
export async function GET(req: NextRequest) {
  const obraId = req.nextUrl.searchParams.get("obraId");
  try {
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT
        IDTraslado, TrasladoNo, IDBoletaSalida, IDObraBC, IDObraBCDestino,
        FechaTraslado, Estado, TgEntregado, TgAnulada, TgDevolucion, TgAprobado,
        NomTraslado, NomRecibido, NomSolicitado, nomTareaOrigen, nomTareaDestino,
        taskNoOrigen, taskNoDestino, Observaciones
      FROM dbo.V_BoletaTraslado
    `;
    if (obraId) {
      request.input("obraId", sql.NVarChar, obraId);
      query += " WHERE IDObraBC = @obraId OR IDObraBCDestino = @obraId";
    }
    query += " ORDER BY IDTraslado DESC";
    const result = await request.query(query);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/traslado error:", err);
    return NextResponse.json({ error: "Error al obtener traslados" }, { status: 500 });
  }
}

// POST /api/traslado
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { IDBoletaSalida, IDObraBC, IDObraBCDestino, Solicitadopor, taskNoOrigen, taskNoDestino } = body;
    if (!IDBoletaSalida || !IDObraBC || !IDObraBCDestino) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    const pool = await getPool();
    const now = new Date().toISOString();
    const result = await pool.request()
      .input("IDBoletaSalida",  sql.Int,      IDBoletaSalida)
      .input("IDObraBC",        sql.NVarChar, IDObraBC)
      .input("IDObraBCDestino", sql.NVarChar, IDObraBCDestino)
      .input("Solicitadopor",   sql.Int,      Solicitadopor ?? 1)
      .input("taskNoOrigen",    sql.NVarChar, taskNoOrigen ?? "")
      .input("taskNoDestino",   sql.NVarChar, taskNoDestino ?? "")
      .input("IDEstado",        sql.Int,      10)  // Sin Autorizar
      .input("FechaCreacion",   sql.NVarChar, now)
      .query(`
        INSERT INTO dbo.BoletaTraslado
          (IDBoletaSalida, IDObraBC, IDObraBCDestino, Solicitadopor, taskNoOrigen, taskNoDestino, IDEstado, FechaCreacion, Creadopor)
        OUTPUT INSERTED.IDTraslado
        VALUES
          (@IDBoletaSalida, @IDObraBC, @IDObraBCDestino, @Solicitadopor, @taskNoOrigen, @taskNoDestino, @IDEstado, @FechaCreacion, @Solicitadopor)
      `);
    return NextResponse.json({ success: true, id: result.recordset[0].IDTraslado }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/traslado error:", err);
    return NextResponse.json({ error: "Error al crear traslado" }, { status: 500 });
  }
}
