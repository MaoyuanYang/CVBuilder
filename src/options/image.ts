export class PhotoError extends Error {}

export interface PhotoProcessOptions {
  maxEdge?: number;
  quality?: number;
}

export async function processPhoto(file: File, options: PhotoProcessOptions = {}): Promise<string> {
  const { maxEdge = 512, quality = 0.85 } = options;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError("无法识别该图片，请更换 JPG 或 PNG 格式的图片");
  }

  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new PhotoError("照片处理失败，请重试");
    }
    context.drawImage(bitmap, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (!dataUrl.startsWith("data:image/jpeg")) {
      throw new PhotoError("照片处理失败，请更换图片");
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
