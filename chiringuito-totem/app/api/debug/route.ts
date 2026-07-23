import { NextResponse } from "next/server";
import { listVisibleProducts, listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const visible = await listVisibleProducts();
  const all = await listProducts();

  return NextResponse.json({
    visibleCount: visible.length,
    allCount: all.length,
    allVisibleFlags: all.map((p) => ({ id: p.id, visible: p.visible })),
  });
}
