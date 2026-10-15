import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navigation, Search, Store } from "lucide-react";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { LocationPicker } from "@/components/LocationPicker";
import { EmptyState, PageHeader } from "@/components/Chrome";
import { MapPanel, type MapPoint } from "@/components/MapPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crops, type PoiType } from "@/data/agri";
import { providers } from "@/data/providers";
import { calculateBestMarket, type MarketOption } from "@/services/agriService";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Nearby Markets & Best Net Price — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Compare Karnataka APMC markets by price, distance, transport cost and estimated net revenue for your crop and quantity.",
      },
      { property: "og:title", content: "Nearby Markets — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Find the market with the best estimated net revenue for your crop.",
      },
    ],
  }),
  component: MarketsPage,
});

const LAYERS: { type: PoiType; key: "markets.layer.market" }[] = [];
void LAYERS;

function MarketsPage() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const [cropId, setCropId] = useState("tomato");
  const [quantity, setQuantity] = useState("500");
  const [sort, setSort] = useState<"net" | "price" | "distance">("net");
  const [submitted, setSubmitted] = useState(true);
  const [layers, setLayers] = useState<Record<PoiType, boolean>>({
    market: true,
    warehouse: true,
    coldStorage: true,
    equipment: false,
    labor: false,
    transport: false,
    buyer: true,
    office: false,
  });

  const qty = Math.max(1, Number(quantity) || 0);
  const result = useMemo(
    () => calculateBestMarket({ cropId, quantityKg: qty, origin: loc.location }),
    [cropId, qty, loc.location],
  );

  const sorted = useMemo(() => {
    const list = [...result.all];
    if (sort === "price") list.sort((a, b) => b.price - a.price);
    if (sort === "distance") list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }, [result.all, sort]);

  const points: MapPoint[] = useMemo(() => {
    const pts: MapPoint[] = [];
    if (layers.market)
      for (const o of result.all)
        pts.push({
          id: `m-${o.market.id}`,
          type: "market",
          lat: o.market.lat,
          lng: o.market.lng,
          title: pick(o.market.name),
          subtitle: `${formatCurrency(o.price, locale)}${t("common.perKg")} · ${o.distanceKm} ${t("common.km")}`,
        });
    for (const p of providers) {
      if (!layers[p.type]) continue;
      pts.push({
        id: `p-${p.id}`,
        type: p.type,
        lat: p.lat,
        lng: p.lng,
        title: pick(p.name),
        subtitle: pick(p.detail),
      });
    }
    return pts;
  }, [layers, result.all, pick, locale, t]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("markets.title")} subtitle={t("markets.subtitle")} />
      

      <Card>
        <CardContent className="space-y-4 pt-6">
          <LocationPicker loc={loc} compact />
          <form
            className="grid gap-4 sm:grid-cols-[2fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="crop">{t("markets.selectCrop")}</Label>
              <Select value={cropId} onValueChange={setCropId}>
                <SelectTrigger id="crop">
                  <SelectValue placeholder={t("markets.cropPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {crops.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {pick(c.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty">{t("markets.quantityKg")}</Label>
              <Input
                id="qty"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="lg" className="w-full">
                <Search className="size-4" aria-hidden /> {t("markets.findBtn")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!submitted || !result.recommended ? (
        <EmptyState message={t("common.empty")} />
      ) : (
        <>
          <Card className="border-primary/40 bg-card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-5 text-primary" aria-hidden /> {t("markets.recommended")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarketDetail option={result.recommended} highlight />
              <p className="mt-3 text-sm text-muted-foreground">
                <strong>{t("markets.reason")}: </strong>
                {t("markets.reasonText")}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="list">
            <div className="flex flex-wrap items-center gap-3">
              <TabsList>
                <TabsTrigger value="list">{t("markets.listView")}</TabsTrigger>
                <TabsTrigger value="map">{t("markets.mapView")}</TabsTrigger>
              </TabsList>
              <div className="ms-auto flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm text-muted-foreground">
                  {t("markets.sortBy")}
                </Label>
                <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <SelectTrigger id="sort" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net">{t("markets.sort.net")}</SelectItem>
                    <SelectItem value="price">{t("markets.sort.price")}</SelectItem>
                    <SelectItem value="distance">{t("markets.sort.distance")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="list" className="mt-4 space-y-3">
              <h2 className="text-lg font-semibold">{t("markets.alternatives")}</h2>
              {sorted.map((o) => (
                <Card key={o.market.id}>
                  <CardContent className="pt-6">
                    <MarketDetail option={o} />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="map" className="mt-4 space-y-4">
              <fieldset className="rounded-2xl border border-border p-4">
                <legend className="px-2 text-sm font-semibold">{t("markets.filters")}</legend>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {(
                    [
                      ["market", "markets.layer.market"],
                      ["warehouse", "markets.layer.warehouse"],
                      ["coldStorage", "markets.layer.coldStorage"],
                      ["equipment", "markets.layer.equipment"],
                      ["transport", "markets.layer.transport"],
                      ["buyer", "markets.layer.buyer"],
                      ["office", "markets.layer.office"],
                    ] as const
                  ).map(([type, key]) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={layers[type]}
                        onCheckedChange={(v) =>
                          setLayers((s) => ({ ...s, [type]: v === true }))
                        }
                      />
                      {t(key)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <MapPanel center={loc.location} points={points} height={480} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function MarketDetail({ option, highlight }: { option: MarketOption; highlight?: boolean }) {
  const { t, pick, locale } = useI18n();
  const demandLabel =
    option.demand === "high"
      ? t("common.high")
      : option.demand === "medium"
        ? t("common.medium")
        : t("common.low");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className={highlight ? "text-2xl font-bold" : "text-lg font-semibold"}>
          {pick(option.market.name)}
        </h3>
        <span className="text-sm text-muted-foreground">{pick(option.market.district)}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {t("common.demand")}: {demandLabel}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={t("common.price")} value={`${formatCurrency(option.price, locale)}${t("common.perKg")}`} />
        <Stat label={t("common.distance")} value={`${option.distanceKm} ${t("common.km")}`} />
        <Stat label={t("markets.travelTime")} value={`${option.travelMin} min`} />
        <Stat label={t("markets.gross")} value={formatCurrency(option.gross, locale)} />
        <Stat
          label={t("markets.transport")}
          value={`− ${formatCurrency(option.transport, locale)}`}
        />
        <Stat
          label={t("markets.net")}
          value={formatCurrency(option.net, locale)}
          strong
        />
      </dl>
      <Button asChild variant="secondary" size="sm">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${option.market.lat},${option.market.lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation className="size-4" aria-hidden /> {t("common.directions")}
        </a>
      </Button>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={strong ? "text-lg font-bold text-primary" : "font-semibold"}>{value}</dd>
    </div>
  );
}
