import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import { getBoard } from "@/lib/queue/api";
import { BRANCHES } from "@/lib/queue/branches";
import { cn } from "@/lib/utils";

type Search = { branchId?: string };

export const Route = createFileRoute("/display")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    branchId: typeof s.branchId === "string" ? s.branchId : "ashoknagar",
  }),
  loaderDeps: ({ search }) => ({ branchId: search.branchId ?? "ashoknagar" }),
  loader: ({ deps }) => getBoard({ data: { branchId: deps.branchId } }),
  component: DisplayPage,
});

function DisplayPage() {
  const { branchId } = Route.useSearch();
  const id = branchId ?? "ashoknagar";
  const q = useQuery({
    queryKey: ["board", id],
    queryFn: () => getBoard({ data: { branchId: id } }),
    refetchInterval: 2500,
    initialData: Route.useLoaderData(),
  });
  const board = q.data;
  const [now, setNow] = useState(() => new Date());
  const [seatedPage, setSeatedPage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const seated = board?.seated ?? [];
  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(seated.length / pageSize));
  useEffect(() => {
    const t = setInterval(() => setSeatedPage((p) => (p + 1) % pages), 5000);
    return () => clearInterval(t);
  }, [pages]);
  const seatedSlice = seated.slice((seatedPage % pages) * pageSize, (seatedPage % pages) * pageSize + pageSize);

  const callout = board?.callout ?? null;
  const lastKey = useMemo(() => (callout ? `${callout.tokenNo}-${callout.createdAt}` : ""), [callout]);
  useEffect(() => {
    if (!callout || typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(
      callout.tableLabel && callout.tableLabel !== "Please come to the desk"
        ? `Attention please. Token ${callout.tokenNo}. Please proceed to ${callout.tableLabel}.`
        : `Attention please. Token ${callout.tokenNo} is ready. Please proceed to the counter.`,
    );
    utter.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [lastKey, callout]);

  const clock = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-cream">
      <header className="flex items-center justify-between gap-4 border-b border-cream/10 px-5 py-3">
        <Wordmark invert compact />
        <div className="text-center">
          <div className="font-display text-xl sm:text-2xl">{board?.branch.name ?? "…"}</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-cream/55">
            {board?.session} · {board?.date}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg tabular-nums sm:text-2xl">{clock}</div>
          <Link to="/" className="text-[11px] text-cream/45 hover:text-cream">Thamarai Queue</Link>
        </div>
      </header>

      {callout && (
        <div className="bg-primary px-5 py-4 text-primary-fg">
          <div className="text-xs uppercase tracking-[0.2em] opacity-80">Now calling</div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="font-display text-5xl font-semibold tabular-nums leading-none sm:text-6xl">{callout.tokenNo}</div>
            <div className="text-right">
              <div className="font-display text-2xl">{callout.guestLabel}</div>
              <div className="text-sm opacity-90">{callout.tableLabel}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-cream/10 bg-cream/[0.04]">
          <header className="flex items-center justify-between border-b border-cream/10 px-4 py-3">
            <h2 className="font-display text-xl">Waiting</h2>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm tabular-nums text-primary-fg">{board?.queue.length ?? 0}</span>
          </header>
          <div className="grid auto-rows-min grid-cols-2 gap-2 overflow-auto p-3 sm:grid-cols-3">
            {(board?.queue ?? []).length === 0 && (
              <p className="col-span-full py-10 text-center text-cream/50">No guests waiting</p>
            )}
            {(board?.queue ?? []).map((tk, i) => (
              <div key={tk.id} className={cn("rounded-lg border px-3 py-3", tk.status === "notified" ? "border-warn/40 bg-warn/15" : "border-cream/10 bg-cream/[0.04]")}>
                <div className="font-display text-3xl tabular-nums leading-none">{tk.tokenNo}</div>
                <div className="mt-1 truncate text-sm">{tk.guestLabel}</div>
                <div className="text-xs text-cream/55">{tk.guests} · {i === 0 ? "next" : `${tk.estimatedWaitMin}m`}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex min-h-0 flex-col gap-4">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-leaf/30 bg-leaf/15">
            <header className="flex items-center justify-between border-b border-leaf/20 px-4 py-3">
              <h2 className="font-display text-xl">Seated</h2>
              <span className="text-sm tabular-nums text-cream/70">{board?.seated.length ?? 0} parties</span>
            </header>
            <div className="grid grid-cols-2 gap-2 overflow-auto p-3">
              {seatedSlice.length === 0 && <p className="col-span-full py-8 text-center text-cream/50">No guests seated</p>}
              {seatedSlice.map((tk) => (
                <div key={tk.id} className="rounded-lg border border-leaf/25 bg-ink/30 px-3 py-3">
                  <div className="font-display text-3xl tabular-nums leading-none">{tk.tokenNo}</div>
                  <div className="mt-1 truncate text-sm">{tk.guestLabel}</div>
                  <div className="text-xs text-cream/60">{tk.tables.map((tb) => tb.label).join(" · ") || "Table"} · {tk.guests}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-cream/10 bg-cream px-4 py-4 text-ink">
            <div className="flex items-center gap-4">
              {board?.qrDataUrl ? (
                <img src={board.qrDataUrl} alt="Scan to join the queue" className="size-28 rounded-md border border-border" />
              ) : (
                <div className="size-28 rounded-md bg-bg" />
              )}
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Skip the wait</div>
                <h3 className="font-display text-xl">Scan to join our queue</h3>
                <ol className="mt-2 space-y-1 text-sm text-muted">
                  <li>1. Scan with your phone</li>
                  <li>2. Enter your details</li>
                  <li>3. Track your token</li>
                </ol>
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className="flex items-center justify-between px-5 py-2 text-[11px] text-cream/40">
        <span>{board?.stats.occupancy}/{board?.stats.capacity} seated · {BRANCHES.find((b) => b.id === id)?.hours}</span>
        <span>Thamarai Veg</span>
      </footer>
    </div>
  );
}
