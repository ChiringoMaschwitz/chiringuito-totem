import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = neon(process.env.POSTGRES_URL!);
  const results: Record<string, any> = {};

  const tests: Record<string, () => Promise<any[]>> = {
    // A: columnas simples + ORDER BY id (ya sabemos que anda)
    A_simple_orderId: () =>
      sql`SELECT id, name, visible FROM products WHERE visible = true ORDER BY id ASC`,
    // B: TODAS las columnas + ORDER BY solo id
    B_fullCols_orderId: () =>
      sql`SELECT id, name, description, price, photo_url, visible, sort_order FROM products WHERE visible = true ORDER BY id ASC`,
    // C: columnas simples + ORDER BY sort_order, id
    C_simple_orderSort: () =>
      sql`SELECT id, name, visible FROM products WHERE visible = true ORDER BY sort_order ASC, id ASC`,
    // D: la query exacta de listVisibleProducts
    D_exact: () =>
      sql`SELECT id, name, description, price, photo_url, visible, sort_order FROM products WHERE visible = true ORDER BY sort_order ASC, id ASC`,
    // E: chequeo de tipos de columna (por si sort_order o visible tienen tipo raro)
    E_schema: () =>
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'`,
  };

  for (const [name, fn] of Object.entries(tests)) {
    try {
      const rows = await fn();
      results[name] = { ok: true, count: rows.length, sample: rows[0] ?? null };
    } catch (e: any) {
      results[name] = { ok: false, error: String(e?.message ?? e) };
    }
  }

  return NextResponse.json(results);
}
