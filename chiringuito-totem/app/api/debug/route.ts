import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const connStr = process.env.POSTGRES_URL!;
  const sql = neon(connStr, { fullResults: true });

  const viaWhere = await sql`
    SELECT id, name, visible FROM products WHERE visible = true ORDER BY id ASC;
  `;
  const viaNoFilter = await sql`
    SELECT id, name, visible FROM products ORDER BY id ASC;
  `;

  return NextResponse.json({
    viaWhereCount: viaWhere.rows.length,
    viaWhereRows: viaWhere.rows,
    viaNoFilterCount: viaNoFilter.rows.length,
  });
}
