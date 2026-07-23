import { sql } from "@vercel/postgres";

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  visible: boolean;
  sort_order: number;
};

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL DEFAULT 0,
        photo_url TEXT,
        visible BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `.then(() => undefined);
  }
  return schemaReady;
}

export async function listProducts(): Promise<Product[]> {
  await ensureSchema();
  const { rows } = await sql<Product>`
    SELECT id, name, description, price, photo_url, visible, sort_order
    FROM products
    ORDER BY sort_order ASC, id ASC;
  `;
  return rows;
}

export async function listVisibleProducts(): Promise<Product[]> {
  await ensureSchema();
  const { rows } = await sql<Product>`
    SELECT id, name, description, price, photo_url, visible, sort_order
    FROM products
    WHERE visible = true
    ORDER BY sort_order ASC, id ASC;
  `;
  return rows;
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  photo_url?: string | null;
  visible?: boolean;
}) {
  await ensureSchema();
  const { rows: maxRows } = await sql<{ max: number | null }>`
    SELECT MAX(sort_order) AS max FROM products;
  `;
  const nextOrder = (maxRows[0]?.max ?? 0) + 1;
  const { rows } = await sql<Product>`
    INSERT INTO products (name, description, price, photo_url, visible, sort_order)
    VALUES (
      ${data.name},
      ${data.description ?? ""},
      ${data.price},
      ${data.photo_url ?? null},
      ${data.visible ?? true},
      ${nextOrder}
    )
    RETURNING id, name, description, price, photo_url, visible, sort_order;
  `;
  return rows[0];
}

export async function updateProduct(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    photo_url: string | null;
    visible: boolean;
  }>
) {
  await ensureSchema();
  const { rows } = await sql<Product>`
    UPDATE products SET
      name = COALESCE(${data.name ?? null}, name),
      description = COALESCE(${data.description ?? null}, description),
      price = COALESCE(${data.price ?? null}, price),
      photo_url = COALESCE(${data.photo_url ?? null}, photo_url),
      visible = COALESCE(${data.visible ?? null}, visible)
    WHERE id = ${id}
    RETURNING id, name, description, price, photo_url, visible, sort_order;
  `;
  return rows[0];
}

export async function deleteProduct(id: number) {
  await ensureSchema();
  await sql`DELETE FROM products WHERE id = ${id};`;
}

export async function moveProduct(id: number, direction: "up" | "down") {
  await ensureSchema();
  const all = await listProducts();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;
  const a = all[idx];
  const b = all[swapIdx];
  await sql`UPDATE products SET sort_order = ${b.sort_order} WHERE id = ${a.id};`;
  await sql`UPDATE products SET sort_order = ${a.sort_order} WHERE id = ${b.id};`;
}

export async function countProducts() {
  await ensureSchema();
  const { rows } = await sql<{ count: number }>`SELECT COUNT(*)::int AS count FROM products;`;
  return rows[0]?.count ?? 0;
}
