import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/actividades — retorna las tareas de obra para el selector
export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT IDTareaObra, TareaObra, NumTarea, Etapa, Orden
      FROM dbo.TareaObraD365
      ORDER BY Orden
    `);
    return NextResponse.json({ data: result.recordset });
  } catch (err: unknown) {
    console.error("GET /api/actividades error:", err);
    return NextResponse.json({ error: "Error al obtener actividades" }, { status: 500 });
  }
}
