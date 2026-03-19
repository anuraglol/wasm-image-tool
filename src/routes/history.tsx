import { FileItem } from "@/components/file-history";
import { filesStore } from "@/db-collections";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["files", "indexed"],
    queryFn: () => filesStore.getAll(),
  });

  return isLoading ? (
    <p className="text-muted-foreground">Loading...</p>
  ) : data && data.length > 0 ? (
    <div className="flex w-full max-w-lg flex-col gap-2 xl:max-w-xl">
      {data.map((file) => (
        <FileItem key={file.id} file={file} url={URL.createObjectURL(file.data)} />
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground text-sm sm:text-base">
      uh oh! you haven't converted any files yet.
    </p>
  );
}
