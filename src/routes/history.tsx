import { FileItem } from "@/components/file-history";
import { filesStore } from "@/db-collections";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["files", "indexed"],
    queryFn: () => filesStore.getAll(),
  });

  return (
    <div className="flex flex-col gap-3 min-h-svh p-6 items-center justify-center">
      <Link
        to="/"
        className="underline text-muted-foreground hover:text-white transition-all duration-75"
      >
        /index
      </Link>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : data && data.length > 0 ? (
        <div className="flex flex-col gap-2 w-full max-w-xl">
          {data.map((file) => (
            <FileItem key={file.id} file={file} url={URL.createObjectURL(file.data)} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">uh oh! you've no files uploaded</p>
      )}
    </div>
  );
}
