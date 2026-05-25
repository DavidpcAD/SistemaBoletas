import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

// GET /api/entrega?obraId=VV-A.01&boletaSalidaId=123
export async function GET(req: NextRequest) {
  const obraId = req.nextUrl.searchParams.get("obraId");
  const boletaSalidaId = req.nextUrl.searchParams.get("boletaSalidaId");
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
    if (boletaSalidaId) {
      request.input("boletaSalidaId", sql.Int, parseInt(boletaSalidaId));
      query += " WHERE IDBoletaSalida = @boletaSalidaId";
    } else if (obraId) {
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
// body: { IDBoletaSalida, IDObraBC, Despachadopor, materiales?: [{itemNo,Descripcion,quantity,unitOfMeasureCode}] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { IDBoletaSalida, IDObraBC, Despachadopor, materiales } = body;
    if (!IDBoletaSalida || !IDObraBC) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    const pool = await getPool();
    const now = new Date().toISOString();

    // 1. Crear cabecera BoletaEntrega
    const result = await pool.request()
      .input("IDBoletaSalida", sql.Int,      IDBoletaSalida)
      .input("IDObraBC",       sql.NVarChar, IDObraBC)
      .input("Despachadopor",  sql.Int,      Despachadopor ?? 1)
      .input("IDEstado",       sql.Int,      47)  // Pendiente de recoger / En Camino
      .input("FechaCreacion",  sql.NVarChar, now)
      .query(`
        INSERT INTO dbo.BoletaEntrega
          (IDBoletaSalida, IDObraBC, Despachadopor, IDEstado, FechaCreacion, Creadopor)
        OUTPUT INSERTED.IDEntrega
        VALUES
          (@IDBoletaSalida, @IDObraBC, @Despachadopor, @IDEstado, @FechaCreacion, @Despachadopor)
      `);
    const IDEntrega: number = result.recordset[0].IDEntrega;

    // 2. Insertar detalle por cada material
    if (Array.isArray(materiales) && materiales.length > 0) {
      for (const mat of materiales) {
        await pool.request()
          .input("IDEntrega",         sql.Int,      IDEntrega)
          .input("IDObraBC",          sql.NVarChar, IDObraBC)
          .input("itemNo",            sql.VarChar,  mat.itemNo ?? "")
          .input("Descripcion",       sql.NVarChar, mat.Descripcion ?? "")
          .input("quantity",          sql.Float,    mat.quantity ?? 0)
          .input("unitOfMeasureCode", sql.VarChar,  mat.unitOfMeasureCode ?? "")
          .input("FechaCreacion",     sql.NVarChar, now)
          .query(`
            INSERT INTO dbo.BoletaEntregaDET
              (IDEntrega, IDObraBC, itemNo, Descripcion, quantity, unitOfMeasureCode, FechaCreacion)
            VALUES
              (@IDEntrega, @IDObraBC, @itemNo, @Descripcion, @quantity, @unitOfMeasureCode, @FechaCreacion)
          `);
      }
    }

    // 3. Marcar boleta de salida como en bodega (TgBodega=1)
    await pool.request()
      .input("id",    sql.Int, IDBoletaSalida)
      .input("fecha", sql.NVarChar, now)
      .query(`UPDATE dbo.BoletaSalida SET TgBodega=1, FechaModificacion=@fecha WHERE IDBoletaSalida=@id`);

    return NextResponse.json({ success: true, id: IDEntrega }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/entrega error:", err);
    return NextResponse.json({ error: "Error al crear entrega" }, { status: 500 });
  }
}
