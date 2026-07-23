import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const candidates: Record<string, string | undefined> = {
    POSTGRES_URL: process.env.POSTGRES_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    STORAGE_URL: process.env.STORAGE_URL,
    STORAGE_DATABASE_URL: process.env.STORAGE_DATABASE_URL,
    STORAGE_POSTGRES_URL: process.env.STORAGE_POSTGRES_URL,
    POSTGRES_DATABASE_URL: process.env.POSTGRES_DATABASE_URL,
  };
  const usedKey = Object.keys(candidates).find((k) => !!candidates[k]);
  const connStr = usedKey ? candidates[usedKey]! : null;

  if (!connStr) {
    return NextResponse.json({ error: "sin conexión" }, { status: 500 });
  }

  const sql = neon(connStr, { fullResults: true });
  const info = await sql`SELECT current_database() as db, current_schema() as schema;`;
  const counts = await sql`SELECT count(*)::int as total, count(*) filter (where visible) ::int as visible_count FROM products;`;

  return NextResponse.json({
    usedEnvVar: usedKey,
    db: info.rows[0],
    counts: counts.rows[0],
  });
}
