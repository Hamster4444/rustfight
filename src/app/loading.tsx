import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  );
}
