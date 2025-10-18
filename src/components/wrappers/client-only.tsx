import { Spinner } from "@/components/ui/loading/spinner";
import { useIsClient } from "@/hooks/use-is-client";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();

  return isClient ? <>{children}</> : <Spinner />;
}
