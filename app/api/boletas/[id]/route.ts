import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/boletas/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const pool = await getPool();
    const [bsResult, detResult] = await Promise.all([
      pool.request()
        .input("id", sql.Int, parseInt(id))
        .query(`
          SELECT
            IDBoletaSalida, IDObraBC, DetBSalida, Estado, IDEstado,
            TgAprobado, TgBodega, TgCompletado, TgPendiente,
            NomCreadoPor, Creadopor, TaskNo, TareaObra,
            DetalleAprobador,
            CONVERT(varchar(10), FechaC, 103) AS FechaStr
          FROM dbo.V_BoletaSalida
          WHERE IDBoletaSalida = @id
        `),
      pool.request()
        .input("id", sql.Int, parseInt(id))
        .query(`
          SELECT
            IDBSalidaDET, IDBoletaSalida, Descripcion,
            quantity, CantidadEntregada, CantidadEntregable, CantidadPendiente,
            itemNo, unitOfMeasureCode, locationCode
          FROM dbo.V_BoletaSalidaDET
          WHERE IDBoletaSalida = @id
        `),
    ]);

    if (bsResult.recordset.length === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      boleta: bsResult.recordset[0],
      materiales: detResult.recordset,
    });
  } catch (err: unknown) {
    console.error("GET /api/boletas/[id] error:", err);
    return NextResponse.json({ error: "Error al obtener boleta" }, { status: 500 });
  }
}

// PATCH /api/boletas/[id] - cambiar estado
// body: { IDEstado, Modificadopor, TgAprobado?, TgBodega?, TgCompletado? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { IDEstado, Modificadopor } = body;
    const pool = await getPool();
    await pool.request()
      .input("id",             sql.Int,     parseInt(id))
      .input("IDEstado",       sql.Int,     IDEstado)
      .input("Modificadopor",  sql.Int,     Modificadopor ?? 1)
      .input("FechaModif",     sql.NVarChar, new Date().toISOString())
      .query(`
        UPDATE dbo.BoletaSalida
        SET IDEstado = @IDEstado, Modificadopor = @Modificadopor, FechaModificacion = @FechaModif
        WHERE IDBoletaSalida = @id
      `);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PATCH /api/boletas/[id] error:", err);
    return NextResponse.json({ error: "Error al actualizar boleta" }, { status: 500 });
  }
}
