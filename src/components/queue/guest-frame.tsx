import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { LangSwitch } from "@/components/queue/lang-switch";
import type { Lang } from "@/lib/queue/i18n";

export function GuestFrame({
  lang,
  onLang,
  children,
  eyebrow,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="kolam-bg min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link to="/" className="min-h-11">
            <Wordmark compact />
          </Link>
          <div className="flex items-center gap-2">
            {eyebrow ? <span className="hidden text-xs text-muted sm:inline">{eyebrow}</span> : null}
            <LangSwitch value={lang} onChange={onLang} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg px-4 py-6 pb-16">{children}</main>
    </div>
  );
}
