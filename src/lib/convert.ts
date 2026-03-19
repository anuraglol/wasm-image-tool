import { initializeImageMagick, ImageMagick, MagickFormat } from "@imagemagick/magick-wasm";
import type { IMAGE_TYPES } from "./utils";

let initialized = false;
let initPromise: Promise<void> | null = null;

const wasmUrl = "/magick.wasm";

async function init() {
  if (initialized) return;

  if (!initPromise) {
    initPromise = fetch(wasmUrl)
      .then((r) => r.arrayBuffer())
      .then((bytes) => initializeImageMagick(new Uint8Array(bytes)))
      .then(() => {
        initialized = true;
      })
      .finally(() => {
        initPromise = null;
      });
  }

  await initPromise;
}

export const FORMAT_CAPS: Record<IMAGE_TYPES, { read: boolean; write: boolean }> = {
  jpeg: { read: true, write: true },
  png: { read: true, write: true },
  bmp: { read: true, write: true },
  gif: { read: true, write: true },
  tiff: { read: true, write: true },
  webp: { read: true, write: true },
  avif: { read: true, write: true },
  jp2: { read: true, write: true },
  ico: { read: true, write: true },

  svg: { read: true, write: false },
  pdf: { read: true, write: false },
  psd: { read: true, write: false },

  heic: { read: false, write: false },
  jxl: { read: false, write: false },
};

const FORMAT_MAP: Partial<Record<IMAGE_TYPES, MagickFormat>> = {
  jpeg: MagickFormat.Jpeg,
  png: MagickFormat.Png,
  bmp: MagickFormat.Bmp,
  gif: MagickFormat.Gif,
  tiff: MagickFormat.Tiff,
  webp: MagickFormat.WebP,
  avif: MagickFormat.Avif,
  jp2: MagickFormat.Jp2,
  ico: MagickFormat.Ico,
};

function canRead(type: IMAGE_TYPES) {
  return FORMAT_CAPS[type]?.read;
}

function canWrite(type: IMAGE_TYPES) {
  return FORMAT_CAPS[type]?.write;
}

async function convertWithMagick(srcBytes: Uint8Array, fmt: MagickFormat): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      ImageMagick.read(srcBytes, (image) => {
        try {
          image.write(fmt, (data) => resolve(data));
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function convertSvgWithCanvas(
  srcBytes: Uint8Array,
  dstType: IMAGE_TYPES,
): Promise<Uint8Array> {
  const blob = new Blob([new Uint8Array(srcBytes)], {
    type: "image/svg+xml",
  });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = url;

  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(url);

  const mime = `image/${dstType === "jpeg" ? "jpeg" : dstType}`;

  const outBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime));

  return new Uint8Array(await outBlob.arrayBuffer());
}

export async function convertImage(
  srcBytes: Uint8Array,
  srcType: IMAGE_TYPES,
  dstType: IMAGE_TYPES,
): Promise<Uint8Array> {
  if (!canRead(srcType)) {
    throw new Error(`${srcType} is not supported in browser`);
  }

  if (!canWrite(dstType)) {
    throw new Error(`${dstType} cannot be used as output`);
  }

  if (srcType === "svg") {
    return convertSvgWithCanvas(srcBytes, dstType);
  }

  await init();

  const fmt = FORMAT_MAP[dstType];

  if (!fmt) {
    throw new Error(`Format ${dstType} not supported by Magick WASM`);
  }

  return convertWithMagick(srcBytes, fmt);
}
