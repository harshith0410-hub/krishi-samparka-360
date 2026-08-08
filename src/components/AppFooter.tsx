import { useI18n } from "@/i18n/I18nProvider";
import { Sprout } from "lucide-react";

export function AppFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-[auto_1fr]">
        <span className="flex size-11 items-center justify-center rounded-xl bg-hero-gradient text-primary-foreground">
          <Sprout className="size-5" aria-hidden />
        </span>
        <div className="space-y-2">
          <p className="text-lg font-bold">{t("brand.name")}</p>
          <p className="text-sm text-muted-foreground">{t("brand.tagline")}</p>
          <p className="max-w-3xl text-sm text-muted-foreground">{t("brand.value")}</p>
          <p className="pt-2 text-xs text-muted-foreground">{t("footer.rights")}</p>
          <p className="text-xs text-muted-foreground">{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
