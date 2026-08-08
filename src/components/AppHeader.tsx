import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Sprout, X, Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/en";

const NAV: { to: string; key: TranslationKey }[] = [
  { to: "/", key: "nav.home" },
  { to: "/markets", key: "nav.markets" },
  { to: "/prices", key: "nav.prices" },
  { to: "/prediction", key: "nav.prediction" },
  { to: "/weather", key: "nav.weather" },
  { to: "/services", key: "nav.services" },
  { to: "/schemes", key: "nav.schemes" },
  { to: "/assistant", key: "nav.assistant" },
];

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-hero-gradient text-primary-foreground shadow-soft">
            <Sprout className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold">{t("brand.name")}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {t("brand.tagline")}
            </span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-1 xl:flex" aria-label={t("nav.menu")}>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 xl:ms-2">
          <div
            className="flex items-center rounded-full border border-border bg-card p-0.5"
            role="group"
            aria-label={t("lang.label")}
          >
            <Globe className="mx-1.5 size-4 text-muted-foreground" aria-hidden />
            {(["kn", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-smooth",
                  lang === code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {code === "kn" ? t("lang.kn") : t("lang.en")}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="xl:hidden"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-3 xl:hidden" aria-label={t("nav.menu")}>
          <ul className="grid gap-1 sm:grid-cols-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium transition-smooth hover:bg-accent"
                  activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
