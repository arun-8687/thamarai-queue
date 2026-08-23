import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Check, LayoutGrid, ListOrdered, PieChart, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cancelToken, completeToken, getBoard, getReports, notifyToken, reserveSeat, seatToken } from "@/lib/queue/api";
import { BRANCHES } from "@/lib/queue/branches";
import { formatISTTime } from "@/lib/queue/clock";
import type { QueueToken, SeatRow } from "@/lib/queue/types";
import { cn } from "@/lib/utils";

type Search = { branchId?: string };
type Tab = "queue" | "floor" | "seated" | "reports";

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    branchId: typeof s.branchId === "string" ? s.branchId : "ashoknagar",
  }),
  loaderDeps: ({ search }) => ({ branchId: search.branchId ?? "ashoknagar" }),
  loader: ({ deps }) => getBoard({ data: { branchId: deps.branchId } }),
  component: AdminPage,
});

function AdminPage() {
  const { branchId } = Route.useSearch();
  const navigate = useNavigate();
  const id = branchId ?? "ashoknagar";
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("queue");
  const [q, setQ] = useState("");
  const [seatFor, setSeatFor] = useState<QueueToken | null>(null);
  const boardQ = useQuery({
    queryKey: ["board", id],
    queryFn: () => getBoard({ data: { branchId: id } }),
    refetchInterval: 2500,
    initialData: Route.useLoaderData(),
  });
  const reportsQ = useQuery({
    queryKey: ["reports", id],
    queryFn: () => getReports({ data: { branchId: id } }),
    enabled: tab === "reports",
    refetchInterval: 8000,
  });
  const board = boardQ.data;
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["board", id] });
    void qc.invalidateQueries({ queryKey: ["reports", id] });
    void qc.invalidateQueries({ queryKey: ["branches"] });
  };
  const notifyM = useMutation({ mutationFn: (tokenId: string) => notifyToken({ data: { tokenId } }), onSuccess: () => { toast.success("Guest notified"); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const cancelM = useMutation({ mutationFn: (tokenId: string) => cancelToken({ data: { tokenId } }), onSuccess: () => { toast.success("Removed from queue"); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const completeM = useMutation({ mutationFn: (tokenId: string) => completeToken({ data: { tokenId } }), onSuccess: () => { toast.success("Table freed"); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const reserveM = useMutation({ mutationFn: (p: { seatId: string; reserved: boolean }) => reserveSeat({ data: p }), onSuccess: invalidate });
  const filteredQueue = useMemo(() => {
    const list = board?.queue ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((t) => t.guestLabel.toLowerCase().includes(s) || t.tokenNo.includes(s));
  }, [board?.queue, q]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/"><Wordmark compact /></Link>
          <select className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm sm:max-w-xs" value={id} onChange={(e) => { void navigate({ to: "/admin", search: { branchId: e.target.value } }); }}>
            {BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <Link to="/display" search={{ branchId: id }} className="hidden text-sm text-muted hover:text-fg sm:inline">TV board</Link>
        </div>
        {board && (
          <div className="mx-auto grid max-w-6xl grid-cols-4 gap-px border-t border-border bg-border">
            <Stat label="Waiting" value={board.stats.waiting} />
            <Stat label="Seated" value={board.stats.seated} />
            <Stat label="Done today" value={board.stats.completed} />
            <Stat label="Occupancy" value={`${board.stats.occupancy}/${board.stats.capacity}`} />
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24">
        {tab === "queue" && <QueueTab items={filteredQueue} query={q} onQuery={setQ} onSeat={setSeatFor} onNotify={(id) => notifyM.mutate(id)} onCancel={(id) => cancelM.mutate(id)} loading={!board} />}
        {tab === "floor" && board && <FloorTab seats={board.seats} onReserve={(seatId, reserved) => reserveM.mutate({ seatId, reserved })} />}
        {tab === "seated" && <SeatedTab items={board?.seated ?? []} onComplete={(id) => completeM.mutate(id)} />}
        {tab === "reports" && reportsQ.data && <ReportsTab data={reportsQ.data} />}
        {tab === "reports" && reportsQ.isLoading && <p className="text-sm text-muted">Loading reports…</p>}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-4">
          <TabBtn id="queue" tab={tab} onClick={setTab} icon={<ListOrdered />} label="Queue" />
          <TabBtn id="floor" tab={tab} onClick={setTab} icon={<LayoutGrid />} label="Floor" />
          <TabBtn id="seated" tab={tab} onClick={setTab} icon={<Users />} label="Seated" />
          <TabBtn id="reports" tab={tab} onClick={setTab} icon={<PieChart />} label="Reports" />
        </div>
      </nav>
      <SeatDialog token={seatFor} seats={board?.seats ?? []} onClose={() => setSeatFor(null)} onDone={() => { setSeatFor(null); invalidate(); }} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-surface px-3 py-2"><div className="text-[10px] uppercase tracking-wider text-muted">{label}</div><div className="font-display text-xl tabular-nums">{value}</div></div>;
}
function TabBtn({ id, tab, onClick, icon, label }: { id: Tab; tab: Tab; onClick: (t: Tab) => void; icon: ReactNode; label: string }) {
  const active = tab === id;
  return (
    <button type="button" onClick={() => onClick(id)} className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]", active ? "text-primary" : "text-muted")}>
      <span className="[&_svg]:size-5">{icon}</span>{label}
    </button>
  );
}
function QueueTab({ items, query, onQuery, onSeat, onNotify, onCancel, loading }: { items: QueueToken[]; query: string; onQuery: (v: string) => void; onSeat: (t: QueueToken) => void; onNotify: (id: string) => void; onCancel: (id: string) => void; loading: boolean }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3"><h1 className="font-display text-2xl">Waiting queue</h1><span className="text-sm text-muted">{items.length} parties</span></div>
      <div className="relative mb-3"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Search name or token…" value={query} onChange={(e) => onQuery(e.target.value)} /></div>
      {loading && <p className="text-sm text-muted">Loading queue data…</p>}
      {!loading && items.length === 0 && <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted">No customers waiting</p>}
      <ul className="space-y-2">
        {items.map((tk, i) => (
          <li key={tk.id} className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl tabular-nums">{tk.tokenNo}</span>
                  {tk.status === "notified" && <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-medium text-warn">Called</span>}
                  {i === 0 && tk.status === "waiting" && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Next</span>}
                </div>
                <div className="font-medium">{tk.guestLabel}</div>
                <div className="text-xs text-muted">{tk.guests} guests · {tk.phoneLast4 ? `•••• ${tk.phoneLast4}` : ""} · {formatISTTime(tk.createdAt)}{tk.notes ? ` · ${tk.notes}` : ""}{tk.allowSplit ? " · split ok" : ""}</div>
              </div>
              <div className="text-right text-xs text-muted tabular-nums">{tk.estimatedWaitMin}m</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onSeat(tk)}>Seat now</Button>
              <Button size="sm" variant="outline" onClick={() => onNotify(tk.id)}><Bell /> Notify</Button>
              <Button size="sm" variant="ghost" onClick={() => onCancel(tk.id)}>Remove</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
function FloorTab({ seats, onReserve }: { seats: SeatRow[]; onReserve: (id: string, reserved: boolean) => void }) {
  return (
    <div className="space-y-6">
      {["Hall A", "Hall B"].map((hall) => {
        const list = seats.filter((s) => s.hall === hall);
        return (
          <section key={hall}>
            <h2 className="mb-2 font-display text-xl">{hall}</h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {list.map((s) => {
                const full = s.occupancy >= s.capacity;
                const used = s.occupancy > 0;
                return (
                  <button key={s.id} type="button" onClick={() => onReserve(s.id, !s.reserved)} className={cn("rounded-md border px-1.5 py-2 text-left", s.reserved ? "border-muted bg-bg text-muted" : full ? "border-leaf/30 bg-leaf text-leaf-fg" : used ? "border-warn/30 bg-warn/15" : "border-border bg-surface")} title={s.tokenNos.join(", ") || s.label}>
                    <div className="text-[10px] opacity-70">{s.seatCode.slice(1)}</div>
                    <div className="font-display text-sm tabular-nums">{s.occupancy}/{s.capacity}</div>
                    {s.tokenNos[0] && <div className="truncate text-[10px]">#{s.tokenNos[0]}</div>}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-muted">Tap a free table to mark it reserved. Occupied tables show token numbers.</p>
    </div>
  );
}
function SeatedTab({ items, onComplete }: { items: QueueToken[]; onComplete: (id: string) => void }) {
  return (
    <div>
      <h1 className="mb-3 font-display text-2xl">Seated guests</h1>
      {items.length === 0 && <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted">Seat guests from the Queue tab to see them here</p>}
      <ul className="space-y-2">
        {items.map((tk) => (
          <li key={tk.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
            <div>
              <div className="font-display text-xl tabular-nums">{tk.tokenNo}</div>
              <div className="text-sm">{tk.guestLabel} · {tk.guests}</div>
              <div className="text-xs text-leaf">{tk.tables.map((tb) => tb.label).join(" · ")}</div>
            </div>
            <Button size="sm" variant="leaf" onClick={() => onComplete(tk.id)}><Check /> Complete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
function ReportsTab({ data }: { data: { date: string; total: number; waiting: number; seated: number; completed: number; avgParty: number; avgWaitMin: number; avgTableMin: number; hours: { hour: string; tokens: number }[]; recent: { tokenNo: string; guestLabel: string; guests: number; status: string; createdAt: string }[] } }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Today · {data.date}</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Mini label="Tokens" value={data.total} /><Mini label="Avg party" value={data.avgParty} /><Mini label="Avg wait" value={`${data.avgWaitMin}m`} /><Mini label="Table time" value={`${data.avgTableMin}m`} />
      </div>
      <div className="h-56 rounded-xl border border-border bg-surface p-3">
        <div className="mb-2 text-sm text-muted">Tokens by hour</div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data.hours.length ? data.hours : [{ hour: "—", tokens: 0 }]}>
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#6e5a4e" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#6e5a4e" width={28} />
            <Tooltip />
            <Bar dataKey="tokens" fill="#c2410c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-medium text-muted">Recent tokens</h2>
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {data.recent.map((r) => (
            <li key={r.tokenNo + r.createdAt} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="font-mono tabular-nums">{r.tokenNo}</span>
              <span className="flex-1 px-3 truncate">{r.guestLabel}</span>
              <span className="text-muted">{r.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-border bg-surface px-3 py-3"><div className="text-[10px] uppercase tracking-wider text-muted">{label}</div><div className="font-display text-2xl tabular-nums">{value}</div></div>;
}
function SeatDialog({ token, seats, onClose, onDone }: { token: QueueToken | null; seats: SeatRow[]; onClose: () => void; onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [squeeze, setSqueeze] = useState(false);
  const [filter, setFilter] = useState("");
  useEffect(() => { setPicked(null); setSqueeze(false); setFilter(""); }, [token?.id]);
  const options = useMemo(() => {
    if (!token) return [];
    const s = filter.trim().toLowerCase();
    return seats.filter((seat) => {
      if (seat.reserved) return false;
      if (s && !seat.label.toLowerCase().includes(s) && !seat.seatCode.toLowerCase().includes(s)) return false;
      return true;
    }).sort((a, b) => {
      const fa = a.capacity - a.occupancy - token.guests;
      const fb = b.capacity - b.occupancy - token.guests;
      const aFit = fa >= 0 ? 0 : 1;
      const bFit = fb >= 0 ? 0 : 1;
      if (aFit !== bFit) return aFit - bFit;
      if (aFit === 0) return fa - fb;
      return a.seatCode.localeCompare(b.seatCode);
    });
  }, [seats, filter, token]);
  useEffect(() => {
    if (!token || picked) return;
    const best = options.find((s) => s.capacity - s.occupancy >= token.guests);
    if (best) setPicked(best.id);
  }, [token, options, picked]);
  const seatM = useMutation({
    mutationFn: async () => {
      if (!token || !picked) throw new Error("Pick a table");
      return seatToken({ data: { tokenId: token.id, seatIds: [picked], squeeze } });
    },
    onSuccess: (res) => { toast.success(`Seated at ${res.tableLabel}`); setPicked(null); setSqueeze(false); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={Boolean(token)} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent title={token ? `Seat token ${token.tokenNo}` : "Seat"} className="max-h-[85dvh] overflow-auto">
        {token && (
          <div className="space-y-3">
            <p className="text-sm text-muted">{token.guestLabel} · {token.guests} guests{token.allowSplit ? " · split allowed" : ""}</p>
            <Input placeholder="Search table…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={squeeze} onChange={(e) => setSqueeze(e.target.checked)} /> Squeeze onto a smaller table</label>
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-auto">
              {options.map((s) => {
                const free = s.capacity - s.occupancy;
                const fits = squeeze ? free > 0 : free >= token.guests;
                return (
                  <button key={s.id} type="button" disabled={!fits} onClick={() => setPicked(s.id)} className={cn("rounded-md border px-2 py-2 text-left text-xs", picked === s.id ? "border-primary bg-primary/10" : fits ? "border-border bg-bg" : "border-border bg-bg opacity-40")}>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-muted">{s.hall} · {free}/{s.capacity} free</div>
                  </button>
                );
              })}
            </div>
            <Button className="w-full" disabled={!picked || seatM.isPending} onClick={() => seatM.mutate()}>Allocate table</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
