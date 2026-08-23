import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clapperboard, MapPin, QrCode, Users } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { listBranches } from "@/lib/queue/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => listBranches(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  const q = useQuery({
    queryKey: ["branches"],
    queryFn: () => listBranches(),
    initialData: initial,
  });
  const branches = q.data ?? [];

  return (
    <div className="kolam-bg min-h-dvh">
      <header className="border-b border-border/80 bg-surface/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Wordmark />
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/status" className="hidden rounded-md px-3 py-2 text-muted hover:text-fg sm:inline">
              Track token
            </Link>
            <Link
              to="/admin"
              search={{ branchId: "ashoknagar" }}
              className="rounded-md px-3 py-2 text-muted hover:text-fg"
            >
              Staff
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Chennai · South Indian vegetarian</p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
          Skip the hall queue. Take a token.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
          Scan the entrance QR, get a three-digit token, and wait at your own pace. Staff seat you from the floor board — the same flow used in busy Chennai veg halls.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted">
          <span className="rounded-full border border-border bg-surface px-3 py-1">QR walk-in</span>
          <span className="rounded-full border border-border bg-surface px-3 py-1">Live TV board</span>
          <span className="rounded-full border border-border bg-surface px-3 py-1">Table seating</span>
          <span className="rounded-full border border-border bg-surface px-3 py-1">EN · தமிழ் · हिन्दी</span>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">Select a hall</h2>
          {q.isLoading && <span className="text-sm text-muted">Loading branches…</span>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <article
              key={b.id}
              className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">{b.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <MapPin className="size-3.5" />
                    {b.area}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                    b.waiting > 0 ? "bg-primary/10 text-primary" : "bg-leaf/10 text-leaf",
                  )}
                >
                  {b.waiting} waiting
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{b.address}</p>
              <p className="mt-1 text-xs text-muted">{b.hours} · {b.capacity} seats</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild size="sm">
                  <Link to="/request" search={{ branchId: b.id }}>
                    <QrCode /> Join
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/status" search={{ branchId: b.id }}>
                    Track
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin" search={{ branchId: b.id }}>
                    <Users /> Staff
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/display" search={{ branchId: b.id }}>
                    <Clapperboard /> TV
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-1 text-sm text-muted">
          Demo floor is preloaded at Ashok Nagar
          <ArrowRight className="size-3.5" />
          open Staff or TV to see it live
        </p>
      </section>
    </div>
  );
}
