import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { LocationPicker } from "@/components/LocationPicker";
import { DemoBadge, EmptyState, PageHeader } from "@/components/Chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { providers, type Provider } from "@/data/providers";
import { haversineKm, roadKm } from "@/services/agriService";
import type { PoiType } from "@/data/agri";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Equipment, Labour, Transport & Storage — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Book tractors and equipment, hire farm labour, arrange transport, find cold storage and connect with buyers near your village.",
      },
      { property: "og:title", content: "Farm Services — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Farm services and buyers near you, with rates, ratings and availability.",
      },
    ],
  }),
  component: ServicesPage,
});

const TABS: { type: PoiType; key: "services.equipment" }[] = [
  { type: "equipment", key: "services.equipment" },
  { type: "labor", key: "services.labor" as "services.equipment" },
  { type: "transport", key: "services.transport" as "services.equipment" },
  { type: "coldStorage", key: "services.storage" as "services.equipment" },
  { type: "buyer", key: "services.buyers" as "services.equipment" },
];

function ServicesPage() {
  const { t } = useI18n();
  const loc = useFarmLocation();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("services.title")} subtitle={t("services.subtitle")} />
      <DemoBadge />
      <LocationPicker loc={loc} compact />

      <Tabs defaultValue="equipment">
        <TabsList className="flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.type} value={tab.type}>
              {t(tab.key)}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.type} value={tab.type} className="mt-4">
            <ProviderList type={tab.type} origin={loc.location} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ProviderList({ type, origin }: { type: PoiType; origin: { lat: number; lng: number } }) {
  const { t, pick, locale } = useI18n();
  const [booked, setBooked] = useState<Record<string, boolean>>({});

  const list = useMemo(
    () =>
      providers
        .filter((p) => p.type === type)
        .map((p) => ({ p, km: roadKm(haversineKm(origin, p)) }))
        .sort((a, b) => a.km - b.km),
    [type, origin],
  );

  if (list.length === 0) return <EmptyState message={t("common.empty")} />;

  const unit = (p: Provider) =>
    p.rateUnit === "hour"
      ? t("services.perHour")
      : p.rateUnit === "day"
        ? t("services.perDay")
        : p.rateUnit === "tonne"
          ? t("services.perTonne")
          : t("common.perKg");

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {list.map(({ p, km }) => (
        <Card key={p.id}>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{pick(p.name)}</h3>
                <p className="text-sm text-muted-foreground">
                  {pick(p.place)} · {km} {t("common.km")}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.available
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {p.available ? t("services.available") : t("services.busy")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{pick(p.detail)}</p>
            <p className="text-lg font-bold">
              {formatCurrency(p.rate, locale)}{" "}
              <span className="text-sm font-normal text-muted-foreground">{unit(p)}</span>
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-sun text-sun" aria-hidden /> {t("services.rating")}:{" "}
              {p.rating.toFixed(1)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!p.available || booked[p.id]}
                onClick={() => {
                  setBooked((s) => ({ ...s, [p.id]: true }));
                  toast.success(t("services.bookingSent"));
                }}
              >
                {t("services.book")}
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href={`tel:${p.phone}`}>
                  <Phone className="size-4" aria-hidden /> {t("services.contact")}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
