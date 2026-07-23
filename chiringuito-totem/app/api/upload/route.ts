import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const blob = await put(`productos/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    token: process.env.BLOBPUB_READ_WRITE_TOKEN,
  });
  return NextResponse.json({ url: blob.url });
}
