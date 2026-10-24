import { cn } from "@/lib/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="61" height="61" rx="18" strokeWidth="1.5" style={{ fill: "var(--color-surface)", stroke: "var(--color-line)" }} />
      <path d="M15 20h8.2L36.2 32 23.2 44H15l13-12L15 20z" style={{ fill: "var(--color-primary)" }} />
      <path d="M29 20h8.2L50.2 32 37.2 44H29l13-12L29 20z" style={{ fill: "var(--color-accent)" }} />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-fg", className)}>
      API<span className="text-primary">Nimble</span>
    </span>
  );
}
