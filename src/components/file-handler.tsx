import * as React from "react";

import { useMutation } from "@tanstack/react-query";
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
import { IMAGE_TYPES } from "@/lib/utils";

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

  const { mutate, isPending, data } = useMutation({
    mutationKey: ["convert-image", file.id],
    mutationFn: async () => {
      const srcBytes = new Uint8Array(await file.file.arrayBuffer());
      const outBytes = await convertImage(srcBytes, selectedType);
      const outView = new Uint8Array(outBytes);
      const outBlob = new Blob([outView], { type: outputMime });
      return URL.createObjectURL(outBlob);
    },
    onSuccess: () => {
      toast.success("Image converted successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to convert image";
      toast.error(message);
    },
  });

  React.useEffect(() => {
    return () => {
      if (data) URL.revokeObjectURL(data);
    };
  }, [data]);

  const { mutate: downloadHandler, isPending: isDownloading } = useMutation({
    mutationKey: ["download-image", file.id],
    mutationFn: async (href: string) => {
      if (!href) {
        toast.error("No data to download");
        return;
      }
      const link = document.createElement("a");
      link.href = href;
      link.download = file.name.split(".").slice(0, -1).join(".") + `.${selectedType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });

  return (
    <div className="w-full p-3 rounded-md border-border border flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img src={file.url} alt={file.name} className="size-36 rounded-xs object-cover" />

        <div className="text-[13px] font-medium flex flex-col gap-2">
          {file.name.length > 30 ? file.name.slice(0, 27) + "..." : file.name}
          <p className="text-[11px] text-muted-foreground">{formattedSize(file.size)}</p>
          <div className="flex items-center gap-2">
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as IMAGE_TYPES)}
            >
              <SelectTrigger className="w-24">{selectedType.toUpperCase()}</SelectTrigger>
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
              className="w-28"
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
            onClick={() => downloadHandler(data!)}
            disabled={isDownloading || !data}
            variant="outline"
          >
            <DownloadIcon className="size-4" data-icon="inline-start" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-7" onClick={() => removeFile(file.id)}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
