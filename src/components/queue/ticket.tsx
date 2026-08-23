import { t, type Lang } from "@/lib/queue/i18n";
import type { TokenStatus } from "@/lib/queue/types";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<TokenStatus, { en: string; className: string }> = {
  waiting: { en: "Waiting", className: "bg-primary/10 text-primary" },
  notified: { en: "Please come in", className: "bg-warn/15 text-warn" },
  seated: { en: "Seated", className: "bg-leaf/12 text-leaf" },
  completed: { en: "Completed", className: "bg-bg text-muted" },
  cancelled: { en: "Cancelled", className: "bg-danger/10 text-danger" },
};

export function TokenTicket({
  tokenNo,
  guestLabel,
  guests,
  status,
  position,
  waitMin,
  tables,
  lang,
}: {
  tokenNo: string;
  guestLabel: string;
  guests: number;
  status: TokenStatus;
  position: number | null;
  waitMin: number;
  tables: { label: string }[];
  lang: Lang;
}) {
  const st = STATUS_COPY[status];
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-ticket">
      <div className="flex items-stretch">
        <div className="flex min-w-[42%] flex-col items-center justify-center bg-primary px-4 py-6 text-primary-fg">
          <div className="text-[10px] uppercase tracking-[0.22em] opacity-80">{t(lang, "yourToken")}</div>
          <div className="font-display text-6xl font-semibold leading-none tabular-nums">{tokenNo}</div>
        </div>
        <div className="ticket-perforation w-3 shrink-0" />
        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div>
            <div className="font-display text-lg font-semibold">{guestLabel}</div>
            <div className="text-sm text-muted">
              {guests} {guests === 1 ? "guest" : "guests"}
            </div>
          </div>
          <span className={cn("inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium", st.className)}>
            {t(lang, status === "notified" ? "notified" : status)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
        <div className="bg-surface px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted">{t(lang, "position")}</div>
          <div className="font-display text-2xl tabular-nums">
            {position == null ? "—" : position <= 1 ? "Next" : Math.max(0, position - 1)}
          </div>
        </div>
        <div className="bg-surface px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted">{t(lang, "wait")}</div>
          <div className="font-display text-2xl tabular-nums">{status === "waiting" || status === "notified" ? `${waitMin}m` : "—"}</div>
        </div>
      </div>
      {tables.length > 0 && (
        <div className="border-t border-border bg-leaf/8 px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-leaf">{t(lang, "tableAssign")}</div>
          <div className="mt-1 font-medium text-leaf">
            {tables.map((tb) => tb.label).join(" · ")}
          </div>
          {tables.length > 1 && (
            <div className="mt-1 text-xs text-muted">{t(lang, "splitAcross")}</div>
          )}
        </div>
      )}
    </article>
  );
}
