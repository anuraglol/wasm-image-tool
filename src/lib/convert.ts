import { initializeImageMagick, ImageMagick, MagickFormat } from "@imagemagick/magick-wasm";

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

export async function convertImage(srcBytes: Uint8Array, dstType: string): Promise<Uint8Array> {
  await init();

  const fmtKey = dstType.toUpperCase();
  console.log("Converting to format:", fmtKey);
  const fmt = (MagickFormat as Record<string, MagickFormat | undefined>)[fmtKey];
  // if (fmt == null) {
  //   throw new Error(`Unsupported output format: ${dstType}`);
  // }

  return new Promise<Uint8Array>((resolve, reject) => {
    try {
      ImageMagick.read(srcBytes, (image) => {
        try {
          image.write(fmt!, (data) => {
            resolve(data);
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      console.error("Error converting image:", e);
      reject(e);
    }
  });
}
