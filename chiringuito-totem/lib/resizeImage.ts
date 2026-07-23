// Las fotos de celular suelen pesar varios MB, más de lo que Vercel deja
// mandar en un solo request (4.5 MB). Achicamos la imagen en el navegador
// antes de subirla, así entra siempre sin importar el tamaño original.
export async function resizeImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );

    return blob ?? file;
  } catch {
    // Si algo falla al redimensionar, intentamos subir el original igual.
    return file;
  }
}
