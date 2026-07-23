import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { countProducts, createProduct } from "@/lib/db";
import { SEED_PRODUCTS } from "@/lib/seedData";

export const dynamic = "force-dynamic";

// Se usa una sola vez desde el dashboard ("Cargar los 12 productos iniciales").
// Es idempotente: si ya hay productos cargados, no hace nada.
export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const existing = await countProducts();
  if (existing > 0) {
    return NextResponse.json({
      ok: false,
      message: "Ya hay productos cargados, no se sembró nada.",
    });
  }
  for (const p of SEED_PRODUCTS) {
    await createProduct({ ...p, visible: true });
  }
  return NextResponse.json({ ok: true, count: SEED_PRODUCTS.length });
}
