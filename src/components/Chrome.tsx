import { useI18n } from "@/i18n/I18nProvider";
import { dataTimestamp } from "@/services/agriService";
import { Info } from "lucide-react";

export function DemoBadge({ className = "" }: { className?: string }) {
  const { t, locale } = useI18n();
  const ts = dataTimestamp();
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground ${className}`}
    >
      <Info className="size-3.5 shrink-0" aria-hidden />
      <span className="rounded-full bg-sun px-2 py-0.5 font-semibold text-sun-foreground">
        {t("demo.badge")}
      </span>
      <span>{t("demo.note")}</span>
      <span className="ms-auto">
        {t("common.lastUpdated")}:{" "}
        {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(ts)}
      </span>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && <p className="max-w-3xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
      {message}
    </div>
  );
}
