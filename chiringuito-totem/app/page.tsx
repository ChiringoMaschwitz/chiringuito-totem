"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
};

const SLIDE_SECONDS = 8; // tiempo por producto en el slideshow
const REFRESH_MS = 5 * 60 * 1000; // cada cuánto vuelve a pedir productos al dashboard
const MENU_AUTO_CLOSE_MS = 45 * 1000; // vuelve solo al slideshow tras este tiempo de inactividad
const MENU_URL = "https://grupochiringuito.com.ar/carta/lounge/";

function formatPrice(price: number) {
  if (!price) return null;
  return `$${price.toLocaleString("es-AR")}`;
}

export default function TotemPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set());
  const menuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuOpenRef = useRef(false);

  const loadSlides = useCallback(async () => {
    try {
      const res = await fetch("/api/totem", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        setSlides(data.slides);
      }
    } catch {
      // si falla, seguimos mostrando lo que ya teníamos cargado
    }
  }, []);

  useEffect(() => {
    loadSlides();
    const refreshTimer = setInterval(loadSlides, REFRESH_MS);
    return () => clearInterval(refreshTimer);
  }, [loadSlides]);

  // Precarga TODAS las fotos apenas llega la lista, así nunca se ve
  // una imagen a medio cargar cuando entra el slide.
  useEffect(() => {
    slides.forEach((s) => {
      if (!s.photo_url || loadedIds.has(s.id)) return;
      const img = new Image();
      img.onload = () => {
        setLoadedIds((prev) => new Set(prev).add(s.id));
      };
      img.onerror = () => {
        setLoadedIds((prev) => new Set(prev).add(s.id)); // no bloquear el carrusel por una foto rota
      };
      img.src = s.photo_url;
    });
  }, [slides, loadedIds]);

  useEffect(() => {
    if (menuOpen || slides.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_SECONDS * 1000);
    return () => clearInterval(t);
  }, [menuOpen, slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides, index]);

  const resetMenuTimer = useCallback(() => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    menuTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, MENU_AUTO_CLOSE_MS);
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    menuOpenRef.current = true;
    resetMenuTimer();
  }, [resetMenuTimer]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuOpenRef.current = false;
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
  }, []);

  // Truco para detectar interacción DENTRO del iframe (cross-origin):
  // cuando el cliente toca algo adentro del iframe, el foco del navegador
  // pasa al iframe y la ventana principal dispara "blur". Lo usamos como
  // señal de "sigue navegando" y reiniciamos el timer de auto-cierre.
  useEffect(() => {
    const handleBlur = () => {
      if (menuOpenRef.current) resetMenuTimer();
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [resetMenuTimer]);

  useEffect(() => {
    return () => {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    };
  }, []);

  const slide = slides[index];
  const slideReady = slide ? !slide.photo_url || loadedIds.has(slide.id) : false;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white select-none">
      {slide && slideReady && (
        <div key={slide.id} className="totem-fade absolute inset-0">
          {slide.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.photo_url}
              alt={slide.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 p-10 md:p-16 max-w-4xl">
            {formatPrice(slide.price) && (
              <span className="inline-block rounded-full bg-acc px-6 py-2 text-2xl md:text-3xl font-bold text-white shadow-lg">
                {formatPrice(slide.price)}
              </span>
            )}
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
              {slide.name}
            </h1>
            {slide.description && (
              <p className="mt-3 text-lg md:text-2xl text-white/90 drop-shadow">
                {slide.description}
              </p>
            )}
          </div>
        </div>
      )}

      {(!slide || !slideReady) && (
        <div className="flex h-full w-full items-center justify-center text-white/60 text-xl">
          Cargando productos…
        </div>
      )}

      {/* Banner flotante fijo arriba */}
      <button
        onClick={openMenu}
        className="absolute left-1/2 top-6 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-acc/95 px-6 py-3 text-base md:text-lg font-bold text-white shadow-xl active:scale-95 transition-transform"
      >
        👉 Tocá aquí para ver el menú
      </button>

      {menuOpen && (
        <div className="absolute inset-0 z-30 bg-black">
          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={closeMenu}
              className="rounded-full bg-acc px-5 py-3 text-base font-bold text-white shadow-xl active:scale-95 transition-transform"
            >
              ✕ Volver
            </button>
          </div>
          <iframe
            src={MENU_URL}
            title="Menú completo"
            className="h-full w-full border-0"
          />
        </div>
      )}
    </main>
  );
}
