"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo iniciar sesión");
      return;
    }
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-neutral-900">
          Dashboard Totem
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Chiringuito Lounge</p>

        <label className="mt-6 block text-sm font-medium text-neutral-700">
          Usuario
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-acc focus:outline-none"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoFocus
        />

        <label className="mt-4 block text-sm font-medium text-neutral-700">
          Contraseña
        </label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-acc focus:outline-none"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-acc py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
