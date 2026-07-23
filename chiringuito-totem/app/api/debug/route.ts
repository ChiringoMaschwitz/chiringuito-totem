import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sql = neon(process.env.POSTGRES_URL!);

    const rows = await sql`
      SELECT id, name, description, price, photo_url, visible, sort_order
      FROM products
      WHERE visible = true
      ORDER BY sort_order ASC, id ASC
    `;

    const slides = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: r.price,
      photoUrl: r.photo_url,
    }));

    return NextResponse.json(
      { slides },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("totem query failed:", e?.message ?? e);
    return NextResponse.json(
      { slides: [], error: "query_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
