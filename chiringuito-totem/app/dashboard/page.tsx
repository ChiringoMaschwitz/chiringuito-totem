import { isAuthed } from "@/lib/auth";
import LoginForm from "./LoginForm";
import ProductManager from "./ProductManager";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authed = await isAuthed();

  if (!authed) {
    return <LoginForm />;
  }

  return <ProductManager />;
}
