import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GuestFrame } from "@/components/queue/guest-frame";
import { TokenTicket } from "@/components/queue/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issueRegistration, registerToken, verifyRegistration } from "@/lib/queue/api";
import { t, type Lang } from "@/lib/queue/i18n";
import { rememberToken } from "@/lib/queue/saved-tokens";
import type { Branch } from "@/lib/queue/types";

type Search = { rt?: string; branchId?: string };

export const Route = createFileRoute("/request")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    rt: typeof s.rt === "string" ? s.rt : undefined,
    branchId: typeof s.branchId === "string" ? s.branchId : undefined,
  }),
  component: RequestPage,
});

function RequestPage() {
  const { rt, branchId } = Route.useSearch();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("en");
  const [phase, setPhase] = useState<"checking" | "need-qr" | "invalid" | "form" | "done">(
    rt ? "checking" : "need-qr",
  );
  const [branch, setBranch] = useState<Branch | null>(null);
  const [activeRt, setActiveRt] = useState(rt ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");
  const [allowSplit, setAllowSplit] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const [issued, setIssued] = useState<{
    tokenNo: string; guestLabel: string; guests: number; position: number;
    estimatedWaitMin: number; last4: string; branchId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!rt) { setPhase("need-qr"); return; }
    setPhase("checking");
    verifyRegistration({ data: { rt, branchId } })
      .then((res) => {
        if (cancelled) return;
        setBranch(res.branch);
        setActiveRt(rt);
        setPhase("form");
      })
      .catch(() => { if (!cancelled) setPhase("invalid"); });
    return () => { cancelled = true; };
  }, [rt, branchId]);

  const kiosk = useMutation({
    mutationFn: async () => issueRegistration({ data: { branchId: branchId ?? "ashoknagar" } }),
    onSuccess: (res) => { void navigate({ to: "/request", search: { rt: res.rt, branchId: res.branchId } }); },
  });

  const submit = useMutation({
    mutationFn: async () => registerToken({ data: { rt: activeRt, name, phone, guests, notes, allowSplit } }),
    onSuccess: (res) => {
      rememberToken({ tokenNo: res.tokenNo, branchId: res.branchId, last4: res.last4, guestLabel: res.guestLabel, createdAt: new Date().toISOString() });
      setIssued(res);
      setPhase("done");
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <GuestFrame lang={lang} onLang={setLang} eyebrow={branch?.name}>
      {phase === "checking" && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted">
          <Loader2 className="size-6 animate-spin" />
          <p>{t(lang, "validating")}</p>
        </div>
      )}
      {(phase === "need-qr" || phase === "invalid") && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-ticket">
          <h1 className="font-display text-2xl">{phase === "invalid" ? t(lang, "invalidQr") : t(lang, "qrNotScanned")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t(lang, "scanToContinue")}</p>
          <Button className="mt-6 w-full" onClick={() => kiosk.mutate()} disabled={kiosk.isPending}>
            {kiosk.isPending ? <Loader2 className="animate-spin" /> : null}
            {t(lang, "atCounter")}
          </Button>
          <Link to="/" className="mt-4 inline-block text-sm text-primary">{t(lang, "selectBranch")}</Link>
        </div>
      )}
      {phase === "form" && (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setError(null); submit.mutate(); }}>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-leaf">{t(lang, "validQr")}</p>
            <h1 className="mt-1 font-display text-3xl">{t(lang, "requestTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{branch?.name} · {t(lang, "completeDetails")}</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t(lang, "fullName")}</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, "namePh")} required autoComplete="name" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t(lang, "phone")}</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t(lang, "phonePh")} inputMode="numeric" required autoComplete="tel" />
            <span className="text-xs text-muted">Only the last 4 digits are stored for lookup.</span>
          </label>
          <div className="space-y-1.5">
            <span className="text-sm font-medium">{t(lang, "guests")}</span>
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface p-1">
              <button type="button" className="flex size-11 items-center justify-center rounded-sm hover:bg-bg" aria-label="Decrease guests" onClick={() => setGuests((g) => Math.max(1, g - 1))}><Minus className="size-4" /></button>
              <div className="flex-1 text-center font-display text-2xl tabular-nums">{guests}</div>
              <button type="button" className="flex size-11 items-center justify-center rounded-sm hover:bg-bg" aria-label="Increase guests" onClick={() => setGuests((g) => Math.min(20, g + 1))}><Plus className="size-4" /></button>
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t(lang, "notes")}</span>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t(lang, "notesPh")} maxLength={80} />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-4 accent-primary" checked={allowSplit} onChange={(e) => setAllowSplit(e.target.checked)} />
            <span>{t(lang, "allowSplit")}</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-4 accent-primary" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
            <span>{t(lang, "whatsapp")}</span>
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={submit.isPending}>
            {submit.isPending ? <Loader2 className="animate-spin" /> : null}
            {submit.isPending ? t(lang, "processing") : t(lang, "getToken")}
          </Button>
        </form>
      )}
      {phase === "done" && issued && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-leaf">{t(lang, "success")}</p>
            <h1 className="mt-1 font-display text-3xl">{t(lang, "yourToken")}</h1>
          </div>
          <TokenTicket tokenNo={issued.tokenNo} guestLabel={issued.guestLabel} guests={issued.guests} status="waiting" position={issued.position} waitMin={issued.estimatedWaitMin} tables={[]} lang={lang} />
          <Button asChild className="w-full" size="lg">
            <Link to="/status" search={{ branchId: issued.branchId, tokenNo: issued.tokenNo, last4: issued.last4 }}>{t(lang, "track")}</Link>
          </Button>
        </div>
      )}
    </GuestFrame>
  );
}
