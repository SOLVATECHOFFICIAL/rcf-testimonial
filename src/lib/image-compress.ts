/**
 * Compresses an uploaded image file client-side to a fast, lightweight WebP or JPEG data URL
 * (max 360px on longest side, under 90 KB base64) for instant preview and Firestore storage.
 */
export async function compressImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (JPG, PNG, or WebP).');
  }

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read the selected image.'));
      el.src = bitmapUrl;
    });

    const maxEdge = 360;
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const width = Math.max(1, Math.round((img.naturalWidth || maxEdge) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || maxEdge) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser image processing is unavailable.');
    }
    ctx.drawImage(img, 0, 0, width, height);

    let dataUrl = canvas.toDataURL('image/webp', 0.65);
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.65);
    }

    if (dataUrl.length > 95000) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.45);
    }

    if (dataUrl.length > 98000) {
      throw new Error('Image is still too large after compression. Please pick a smaller photo.');
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}
