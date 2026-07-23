"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  visible: boolean;
  sort_order: number;
};

type FormState = {
  id: number | null;
  name: string;
  description: string;
  price: string;
  visible: boolean;
  photo_url: string | null;
  file: File | null;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
  price: "",
  visible: true,
  photo_url: null,
  file: null,
};

export default function ProductManager() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  }

  async function handleSeed() {
    const res = await fetch("/api/seed", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.ok === false) {
      alert(data.message ?? "No se pudo cargar la semilla");
    }
    loadProducts();
  }

  function openNewForm() {
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  function openEditForm(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price ?? 0),
      visible: p.visible,
      photo_url: p.photo_url,
      file: null,
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function handleMove(id: number, direction: "up" | "down") {
    await fetch(`/api/products/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    loadProducts();
  }

  async function handleToggleVisible(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !p.visible }),
    });
    loadProducts();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Poné un nombre");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let photoUrl = form.photo_url;
      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) throw new Error("No se pudo subir la foto");
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url;
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        photo_url: photoUrl,
        visible: form.visible,
      };

      if (form.id) {
        await fetch(`/api/products/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setFormOpen(false);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-5">
        <div>
          <p className="text-sm text-neutral-500">Dashboard Totem</p>
          <h1 className="text-3xl font-bold text-neutral-900">
            Chiringuito Lounge
          </h1>
        </div>
        <div className="flex gap-3">
          <a
            href="/totem"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-acc px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Ver totem ↗
          </a>
          <button
            onClick={handleLogout}
            className="rounded-full border border-neutral-300 px-5 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={openNewForm}
            className="rounded-full bg-acc px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            + Agregar producto
          </button>
          {!loading && products.length === 0 && (
            <button
              onClick={handleSeed}
              className="rounded-full border border-neutral-300 px-5 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Cargar los 12 productos iniciales
            </button>
          )}
        </div>

        {loading && <p className="text-neutral-500">Cargando…</p>}

        {!loading && products.length === 0 && (
          <p className="text-neutral-500">
            No hay productos todavía. Agregá el primero o cargá la semilla de
            arriba.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 h-36 w-full overflow-hidden rounded-xl bg-neutral-100">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo_url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                    Sin foto
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-neutral-900">{p.name}</h3>
              <p className="text-sm text-neutral-500">{p.description}</p>
              <p className="mt-1 font-semibold text-neutral-900">
                ${p.price.toLocaleString("es-AR")}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleToggleVisible(p)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    p.visible
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {p.visible ? "Visible" : "Oculto"}
                </button>
                <button
                  onClick={() => handleMove(p.id, "up")}
                  disabled={i === 0}
                  className="rounded-full border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMove(p.id, "down")}
                  disabled={i === products.length - 1}
                  className="rounded-full border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEditForm(p)}
                  className="flex-1 rounded-lg border border-acc px-3 py-1.5 text-sm font-semibold text-acc hover:bg-acc/10"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-neutral-900">
              {form.id ? "Editar producto" : "Agregar producto"}
            </h2>

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Nombre
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-acc focus:outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Descripción
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-acc focus:outline-none"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Precio
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-acc focus:outline-none"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Foto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, file: e.target.files?.[0] ?? null })
              }
              className="mt-1 w-full text-sm"
            />
            {(form.file || form.photo_url) && (
              <img
                src={
                  form.file
                    ? URL.createObjectURL(form.file)
                    : form.photo_url ?? undefined
                }
                alt="preview"
                className="mt-2 h-24 w-24 rounded-lg object-cover"
              />
            )}

            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) =>
                  setForm({ ...form, visible: e.target.checked })
                }
              />
              Mostrar en el totem
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 rounded-lg border border-neutral-300 py-2 font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-acc py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
