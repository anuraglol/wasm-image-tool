import * as React from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, RotateCw, X } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { convertImage } from "@/lib/convert";
import { downloadFile, formatFileName, IMAGE_TYPES } from "@/lib/utils";

import { filesStore } from "@/db-collections";
import { Button } from "./ui/button";

type FileHandlerItemData = {
  id: string;
  url: string;
  name: string;
  size: number;
  file: File;
};

export function FileHandlerItem({
  file,
  removeFile,
}: {
  file: FileHandlerItemData;
  removeFile: (id: string) => void;
}) {
  const [selectedType, setSelectedType] = React.useState<IMAGE_TYPES>("png");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const outputMime = React.useMemo(() => {
    const map: Partial<Record<IMAGE_TYPES, string>> = {
      jpeg: "image/jpeg",
      png: "image/png",
      bmp: "image/bmp",
      gif: "image/gif",
      tiff: "image/tiff",
      webp: "image/webp",
      avif: "image/avif",
      heic: "image/heic",
      ico: "image/x-icon",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      psd: "image/vnd.adobe.photoshop",
      jp2: "image/jp2",
      jxl: "image/jxl",
    };
    return map[selectedType] ?? `image/${selectedType}`;
  }, [selectedType]);

  const formattedSize = React.useCallback((size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }, []);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { mutate, isPending, data } = useMutation({
    mutationKey: ["convert-image", file.id],
    mutationFn: async () => {
      const srcBytes = new Uint8Array(await file.file.arrayBuffer());
      const outBytes = await convertImage(srcBytes, selectedType);
      const outView = new Uint8Array(outBytes);
      const outBlob = new Blob([outView], { type: outputMime });

      filesStore.insert({
        id: crypto.randomUUID(),
        name: file.name.split(".").slice(0, -1).join(".") + `.${selectedType}`,
        size: outBlob.size,
        type: outputMime,
        lastModified: Date.now(),
        data: outBlob,
      });

      const url = URL.createObjectURL(outBlob);
      setPreviewUrl(url);
      queryClient.invalidateQueries({ queryKey: ["files", "indexeds"] });

      return {
        url,
        blob: outBlob,
      };
    },
    onSuccess: () => {
      toast.success("Image converted successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to convert image";
      toast.error(message);
    },
  });

  const { mutate: downloadHandler, isPending: isDownloading } = useMutation({
    mutationKey: ["download-image", file.id],
    mutationFn: async (blob: Blob) =>
      await downloadFile(blob, file.name.split(".").slice(0, -1).join(".") + `.${selectedType}`),
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to download image";
      toast.error(message);
    },
  });

  return (
    <div className="w-full rounded-md border border-border p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={data?.url ?? file.url}
            alt={file.name}
            className="h-20 w-20 shrink-0 rounded-xs object-cover sm:h-28 sm:w-28"
          />

          <div className="min-w-0 flex-1 text-[13px] font-medium">
            <div className="min-w-0 break-words [overflow-wrap:anywhere]">
              {formatFileName(file.name)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{formattedSize(file.size)}</p>

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as IMAGE_TYPES)}
                >
                  <SelectTrigger className="w-full sm:w-24">
                    {selectedType.toUpperCase()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {IMAGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Button
                  className="w-full sm:w-28"
                  onClick={() => mutate()}
                  disabled={isPending}
                  variant="outline"
                >
                  <RotateCw className="size-4" data-icon="inline-start" />
                  Convert
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => data && downloadHandler(data.blob)}
                disabled={isDownloading || !data}
                variant="outline"
              >
                <DownloadIcon className="size-4" data-icon="inline-start" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => removeFile(file.id)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
