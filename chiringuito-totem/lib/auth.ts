import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "chiringuito_session";

function expectedToken() {
  const secret = process.env.DASHBOARD_SESSION_SECRET || "dev-secret-cambiame";
  const pass = process.env.DASHBOARD_PASSWORD || "";
  return crypto.createHash("sha256").update(`${pass}:${secret}`).digest("hex");
}

export function checkCredentials(user: string, pass: string) {
  const expectedUser = process.env.DASHBOARD_USER || "";
  const expectedPass = process.env.DASHBOARD_PASSWORD || "";
  if (!expectedUser || !expectedPass) return false;
  return user === expectedUser && pass === expectedPass;
}

export function sessionToken() {
  return expectedToken();
}

export async function isAuthed() {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return !!value && value === expectedToken();
}
