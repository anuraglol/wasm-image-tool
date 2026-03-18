import { DownloadIcon, X } from "lucide-react";
import * as React from "react";

import { filesStore, type FileItem as FileItemType } from "@/db-collections";
import { downloadFile, formatFileName } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function FileItem({ file, url }: { file: FileItemType; url: string }) {
  const queryClient = useQueryClient();
  const formattedSize = React.useCallback((size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }, []);

  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file.data]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => await downloadFile(file.data, file.name),
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
            src={url ?? ""}
            alt={file.name}
            className="h-20 w-20 shrink-0 rounded-xs object-cover sm:h-28 sm:w-28"
          />

          <div className="min-w-0 flex-1 text-[13px] font-medium">
            <div className="min-w-0 break-words [overflow-wrap:anywhere]">
              {formatFileName(file.name)}
            </div>

            <p className="mt-1 text-[11px] text-muted-foreground">
              {formattedSize(file.size)}, {file.type.split("/")[1]?.toUpperCase()}
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Date(file.lastModified).getDate()}{" "}
              {new Date(file.lastModified).toLocaleString("default", {
                month: "short",
              })}{" "}
              {new Date(file.lastModified).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <Button
              className="mt-4 w-full sm:w-36"
              variant="outline"
              onClick={() => mutate()}
              disabled={isPending}
            >
              <DownloadIcon className="size-4" data-icon="inline-start" />
              Download
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              filesStore.delete(file.id);
              queryClient.invalidateQueries({ queryKey: ["files", "indexed"] });
              toast.success("File deleted successfully");
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
