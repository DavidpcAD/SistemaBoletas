import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/boletas?obraId=VV-A.01
export async function GET(req: NextRequest) {
  const obraId = req.nextUrl.searchParams.get("obraId");
  try {
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT
        bs.IDBoletaSalida, bs.IDObraBC, bs.DetBSalida, v.Estado, v.IDEstado,
        v.TgAprobado, v.TgBodega, v.TgCompletado, v.TgPendiente,
        v.NomCreadoPor, v.Creadopor, v.TaskNo, v.TareaObra,
        CONVERT(varchar(10), v.FechaC, 103) AS FechaStr,
        (SELECT COUNT(*) FROM dbo.BoletaSalidaDET d WHERE d.IDBoletaSalida = bs.IDBoletaSalida) AS NumMateriales
      FROM dbo.BoletaSalida bs
      JOIN dbo.V_BoletaSalida v ON v.IDBoletaSalida = bs.IDBoletaSalida
    `;
    if (obraId) {
      request.input("obraId", sql.NVarChar, obraId);
      query += " WHERE bs.IDObraBC = @obraId";
    }
    query += " ORDER BY bs.IDBoletaSalida DESC";
    const result = await request.query(query);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/boletas error:", err);
    return NextResponse.json({ error: "Error al obtener boletas" }, { status: 500 });
  }
}

// POST /api/boletas
// body: { IDObraBC, TaskNo, TareaObra, Creadopor, materiales: [{itemNo, Descripcion, quantity, unitOfMeasureCode, locationCode}] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { IDObraBC, TaskNo, TareaObra, Creadopor, materiales } = body;
    if (!IDObraBC || !Creadopor || !Array.isArray(materiales) || materiales.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const pool = await getPool();
    const now = new Date().toISOString();

    // INSERT BoletaSalida
    const insertBS = await pool.request()
      .input("IDObraBC",        sql.NVarChar,  IDObraBC)
      .input("TaskNo",          sql.NVarChar,  TaskNo ?? "")
      .input("DetVSControl",    sql.NVarChar,  TareaObra ?? "")
      .input("IDEstado",        sql.Int,        10)           // Sin Autorizar = Pendiente
      .input("Creadopor",       sql.Int,        Creadopor)
      .input("FechaCreacion",   sql.NVarChar,  now)
      .input("TgPendiente",     sql.Bit,        1)
      .query(`
        INSERT INTO dbo.BoletaSalida
          (IDObraBC, TaskNo, DetVSControl, IDEstado, Creadopor, FechaCreacion, TgPendiente)
        OUTPUT INSERTED.IDBoletaSalida
        VALUES
          (@IDObraBC, @TaskNo, @DetVSControl, @IDEstado, @Creadopor, @FechaCreacion, @TgPendiente)
      `);

    const IDBoletaSalida: number = insertBS.recordset[0].IDBoletaSalida;

    // INSERT BoletaSalidaDET for each material
    for (const mat of materiales) {
      await pool.request()
        .input("IDBoletaSalida",   sql.Int,       IDBoletaSalida)
        .input("IDObraBC",         sql.NVarChar,  IDObraBC)
        .input("Descripcion",      sql.NVarChar,  mat.Descripcion ?? mat.desc ?? "")
        .input("CantidadEntregable", sql.Float,   mat.quantity ?? mat.cantidad ?? 1)
        .input("itemNo",           sql.VarChar,   mat.itemNo ?? "")
        .input("unitOfMeasureCode",sql.VarChar,   mat.unitOfMeasureCode ?? mat.unidad ?? "")
        .input("locationCode",     sql.VarChar,   mat.locationCode ?? "ALM-GRAL")
        .input("Creadopor",        sql.Int,        Creadopor)
        .input("FechaCreacion",    sql.NVarChar,  now)
        .query(`
          INSERT INTO dbo.BoletaSalidaDET
            (IDBoletaSalida, IDObraBC, Descripcion, CantidadEntregable, itemNo, unitOfMeasureCode, locationCode, Creadopor, FechaCreacion)
          VALUES
            (@IDBoletaSalida, @IDObraBC, @Descripcion, @CantidadEntregable, @itemNo, @unitOfMeasureCode, @locationCode, @Creadopor, @FechaCreacion)
        `);
    }

    return NextResponse.json({ success: true, id: IDBoletaSalida }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/boletas error:", err);
    return NextResponse.json({ error: "Error al crear boleta" }, { status: 500 });
  }
}
