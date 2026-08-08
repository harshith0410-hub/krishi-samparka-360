import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DemoBadge, PageHeader } from "@/components/Chrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { schemes } from "@/data/providers";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes for Farmers — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Central and Karnataka farmer schemes with eligibility, benefits, required documents and how to apply.",
      },
      { property: "og:title", content: "Government Schemes — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Scheme eligibility, benefits, documents and application steps in Kannada and English.",
      },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { t, pick } = useI18n();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <PageHeader title={t("schemes.title")} subtitle={t("schemes.subtitle")} />
      <DemoBadge />
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
        {schemes.map((s) => (
          <AccordionItem key={s.id} value={s.id}>
            <AccordionTrigger className="text-start font-semibold">{pick(s.name)}</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{pick(s.description)}</p>
              <Field label={t("schemes.eligibility")} value={pick(s.eligibility)} />
              <Field label={t("schemes.benefits")} value={pick(s.benefits)} />
              <Field label={t("schemes.documents")} value={pick(s.documents)} />
              <Field label={t("schemes.howToApply")} value={pick(s.apply)} />
              <Button asChild size="sm" variant="secondary">
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {t("schemes.official")} <ExternalLink className="size-4" aria-hidden />
                </a>
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-sm text-muted-foreground">{t("schemes.disclaimer")}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
}
