import { LANGS, type Lang } from "@/lib/queue/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onChange(l.id)}
          className={cn(
            "min-w-9 rounded-sm px-2 py-1 text-xs font-medium",
            value === l.id ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
