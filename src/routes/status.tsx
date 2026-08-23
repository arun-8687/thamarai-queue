import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GuestFrame } from "@/components/queue/guest-frame";
import { TokenTicket } from "@/components/queue/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupToken } from "@/lib/queue/api";
import { BRANCHES } from "@/lib/queue/branches";
import { t, type Lang } from "@/lib/queue/i18n";
import { readSavedTokens } from "@/lib/queue/saved-tokens";

type Search = { branchId?: string; tokenNo?: string; last4?: string };

function asString(v: unknown): string | undefined {
  if (typeof v === "string" && v.length > 0) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return undefined;
}

export const Route = createFileRoute("/status")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    branchId: asString(s.branchId),
    tokenNo: asString(s.tokenNo) ?? asString(s.token),
    last4: asString(s.last4),
  }),
  component: StatusPage,
});

function StatusPage() {
  const search = Route.useSearch();
  const [lang, setLang] = useState<Lang>("en");
  const [branchId, setBranchId] = useState(search.branchId ?? "ashoknagar");
  const [tokenNo, setTokenNo] = useState(search.tokenNo ?? "");
  const [last4, setLast4] = useState(search.last4 ?? "");
  const saved = useMemo(() => (typeof window === "undefined" ? [] : readSavedTokens()), []);

  const lookup = useMutation({
    mutationFn: () =>
      lookupToken({
        data: { branchId, tokenNo: tokenNo.trim(), last4: last4.trim() },
      }),
  });

  useEffect(() => {
    if (search.tokenNo && search.last4) {
      lookup.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = useQuery({
    queryKey: ["lookup", branchId, lookup.data?.token.tokenNo, last4],
    enabled: Boolean(lookup.data),
    queryFn: () =>
      lookupToken({
        data: { branchId, tokenNo: lookup.data!.token.tokenNo, last4 },
      }),
    refetchInterval: 4000,
  });

  const result = live.data ?? lookup.data;

  return (
    <GuestFrame lang={lang} onLang={setLang}>
      <h1 className="font-display text-3xl">{t(lang, "checkStatus")}</h1>
      <p className="mt-1 text-sm text-muted">Enter your token and the last 4 digits of the phone used at the counter.</p>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          lookup.mutate();
        }}
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Hall</span>
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t(lang, "tokenNo")}</span>
          <Input value={tokenNo} onChange={(e) => setTokenNo(e.target.value)} placeholder="486" inputMode="numeric" required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t(lang, "last4")}</span>
          <Input value={last4} onChange={(e) => setLast4(e.target.value)} placeholder="4321" inputMode="numeric" maxLength={4} required />
        </label>
        {lookup.error && <p className="text-sm text-danger">{(lookup.error as Error).message}</p>}
        <Button type="submit" className="w-full" disabled={lookup.isPending}>
          {lookup.isPending ? <Loader2 className="animate-spin" /> : null}
          {t(lang, "checkStatus")}
        </Button>
      </form>

      {result && (
        <div className="mt-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{result.branch.name}</p>
          <TokenTicket
            tokenNo={result.token.tokenNo}
            guestLabel={result.token.guestLabel}
            guests={result.token.guests}
            status={result.token.status}
            position={result.token.position}
            waitMin={result.token.estimatedWaitMin}
            tables={result.token.tables}
            lang={lang}
          />
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-muted">Recent tokens on this phone</h2>
          <ul className="mt-2 space-y-2">
            {saved.map((s) => (
              <li key={s.tokenNo + s.branchId}>
                <Link
                  to="/status"
                  search={{ branchId: s.branchId, tokenNo: s.tokenNo, last4: s.last4 }}
                  className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  onClick={() => {
                    setBranchId(s.branchId);
                    setTokenNo(s.tokenNo);
                    setLast4(s.last4);
                  }}
                >
                  <span className="font-display text-lg tabular-nums">{s.tokenNo}</span>
                  <span className="text-muted">{s.guestLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GuestFrame>
  );
}
