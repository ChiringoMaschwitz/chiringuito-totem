import { NextResponse } from "next/server";
import { listVisibleProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

// Endpoint público: lo consume la pantalla /totem. Solo expone lo necesario
// para mostrar el slideshow (sin datos internos de administración).
export async function GET() {
  const products = await listVisibleProducts();
  const slides = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    photo_url: p.photo_url,
  }));
  return NextResponse.json({ slides });
}
