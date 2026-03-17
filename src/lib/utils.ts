import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mapFiles = (files: File[]) => {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
  }));
};

export const IMAGE_TYPES = [
  "jpeg",
  "png",
  "bmp",
  "gif",
  "tiff",
  "webp",
  "avif",
  "heic",
  "ico",
  "svg",
  "pdf",
  "psd",
  "jp2",
  "jxl",
] as const;

export type IMAGE_TYPES = (typeof IMAGE_TYPES)[number];

export const urlToBase64 = async (url: string) => {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};
