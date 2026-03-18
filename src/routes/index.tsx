import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { FileHandlerItem } from "@/components/file-handler";
import { FileUpload, FileUploadDropzone, FileUploadTrigger } from "../components/ui/file-upload";

export const Route = createFileRoute("/")({ component: App });

type FileItem = {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
};

function App() {
  const [items, setItems] = React.useState<FileItem[]>([]);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onFilesChange = (files: File[]) => {
    setItems((prev) => {
      const existingNames = new Set(prev.map((f) => f.name + f.size));

      const next = files
        .filter((f) => !existingNames.has(f.name + f.size))
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        }));

      return [...prev, ...next];
    });
  };

  const removeFile = (id: string) => {
    setItems((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-3 px-4 py-6 sm:p-6">
      <Link
        to="/history"
        className="underline text-muted-foreground hover:text-white transition-all duration-75"
      >
        /history
      </Link>
      <p className="max-w-xl text-center text-sm text-muted-foreground sm:text-[15px] xl:max-w-2xl">
        hi! this is a simple local-only image conversion tool built using wasm. it uses{" "}
        <span className="italic">imagemagick</span> under the hood, along with{" "}
        <span className="italic">indexed-db</span> for synced local state management. <br />
        upload files in the below area to proceed.
      </p>
      <FileUpload
        maxSize={50 * 1024 * 1024}
        className="w-full max-w-md"
        value={items.map((i) => i.file)}
        onValueChange={onFilesChange}
        onFileReject={onFileReject}
        multiple
        accept="image/*"
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Drag & drop images here</p>
            <p className="text-xs text-muted-foreground">
              Or click to browse (each image{" <"}50mb)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-full sm:w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
      </FileUpload>

      {items.length > 0 ? (
        <div className="flex w-full max-w-lg flex-col gap-2 2xl:max-w-xl">
          {items.map((file) => (
            <FileHandlerItem key={file.id} file={file} removeFile={removeFile} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
