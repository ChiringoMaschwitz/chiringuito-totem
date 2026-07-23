import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { moveProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const direction = body?.direction === "up" ? "up" : "down";
  await moveProduct(id, direction);
  return NextResponse.json({ ok: true });
}
