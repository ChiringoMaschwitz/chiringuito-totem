import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listProducts, createProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const products = await listProducts();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
  }
  const product = await createProduct({
    name: body.name,
    description: body.description ?? "",
    price: Number(body.price) || 0,
    photo_url: body.photo_url ?? null,
    visible: body.visible ?? true,
  });
  return NextResponse.json({ product });
}
