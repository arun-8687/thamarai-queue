import { cn } from "@/lib/utils";

export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#fffaf3" />
      <path d="M32 50c8-7 18-16 18-26 0-7-5-12-10-12-4 0-6 3-8 6-2-3-4-6-8-6-5 0-10 5-10 12 0 10 10 19 18 26z" fill="#c2410c" />
      <path d="M32 50c4-10 6-20 0-30-6 10-4 20 0 30z" fill="#e05d14" />
      <circle cx="32" cy="22" r="3.2" fill="#1c1410" />
    </svg>
  );
}

export function Wordmark({
  compact,
  invert,
}: {
  compact?: boolean;
  invert?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <LotusMark className={compact ? "size-8" : "size-10"} />
      <div className="leading-tight">
        <div
          className={cn(
            "font-display font-semibold tracking-tight",
            compact ? "text-base" : "text-lg",
            invert ? "text-cream" : "text-fg",
          )}
        >
          Thamarai
        </div>
        {!compact && (
          <div className={cn("text-[11px] uppercase tracking-[0.18em]", invert ? "text-cream/70" : "text-muted")}>
            Veg · Queue
          </div>
        )}
      </div>
    </div>
  );
}
