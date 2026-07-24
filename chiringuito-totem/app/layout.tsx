import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chiringuito Lounge — Totem",
  description: "Pantalla y dashboard propio del totem de Chiringuito Lounge",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
