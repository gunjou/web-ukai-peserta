const MAX_BYTES = 500 * 1024;
const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 480;
const QUALITIES = [0.82, 0.7, 0.6, 0.5];

function toJpegBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
}

/** Mengubah foto menjadi JPEG berukuran maksimal 500 KB sebelum diunggah. */
export async function compressToJpeg(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  }).catch(() => {
    throw new Error("Foto tidak dapat dibaca. Gunakan foto JPEG, PNG, atau WebP.");
  });

  try {
    const sourceLongest = Math.max(bitmap.width, bitmap.height);
    let longest = Math.min(MAX_DIMENSION, sourceLongest);

    while (longest >= MIN_DIMENSION || longest === sourceLongest) {
      const scale = longest / sourceLongest;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));

      const context = canvas.getContext("2d");
      if (!context) break;

      // JPEG tidak punya transparansi; tanpa latar putih area transparan menjadi hitam.
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const blob = await toJpegBlob(canvas, quality);
        if (blob && blob.size <= MAX_BYTES) {
          const name = file.name.replace(/\.[^.]*$/, "") || "bukti-kehadiran";
          return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
        }
      }

      if (longest < MIN_DIMENSION) break;
      longest = Math.round(longest * 0.75);
    }
  } finally {
    bitmap.close();
  }

  throw new Error("Foto gagal diperkecil. Coba gunakan foto lain.");
}
