import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();

  const connStr = process.env.POSTGRES_URL!;
  const sql = neon(connStr, { fullResults: true });

  const exact = await sql`
    SELECT id, name, description, price, photo_url, visible, sort_order
    FROM products
    WHERE visible = true
    ORDER BY sort_order ASC, id ASC;
  `;

  return NextResponse.json({
    exactCount: exact.rows.length,
    exactRows: exact.rows,
  });
}
