import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const product = await updateProduct(id, {
    name: body.name,
    description: body.description,
    price: body.price !== undefined ? Number(body.price) : undefined,
    photo_url: body.photo_url,
    visible: body.visible,
  });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = Number(params.id);
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
