import { Skeleton } from "@/components/ui/skeleton";

export default function Carregando() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <span className="sr-only">Carregando…</span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-full max-w-md" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
