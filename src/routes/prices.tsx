import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { DemoBadge, EmptyState, PageHeader } from "@/components/Chrome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crops, markets, type CropCategory } from "@/data/agri";
import { priceFor, priceHistory, arrivalsFor } from "@/services/agriService";

export const Route = createFileRoute("/prices")({
  head: () => ({
    meta: [
      { title: "Crop Prices Across Karnataka Markets — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Track modal prices for vegetables, fruits, flowers, grains, pulses and plantation crops across Karnataka APMC markets.",
      },
      { property: "og:title", content: "Crop Prices — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Daily and weekly price movement by crop, category and market.",
      },
    ],
  }),
  component: PricesPage,
});

const CATEGORIES: { id: CropCategory | "all"; key: "cat.vegetables" }[] = [];
void CATEGORIES;

function PricesPage() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CropCategory | "all">("all");
  const [marketId, setMarketId] = useState(loc.location.districtId);
  const [selected, setSelected] = useState("tomato");

  const list = useMemo(
    () =>
      crops
        .filter((c) => (category === "all" ? true : c.category === category))
        .filter((c) =>
          query.trim()
            ? `${c.name.en} ${c.name.kn}`.toLowerCase().includes(query.trim().toLowerCase())
            : true,
        )
        .map((c) => {
          const today = priceFor(c.id, marketId) ?? c.basePrice;
          const yesterday = priceFor(c.id, marketId, -1) ?? today;
          const lastWeek = priceFor(c.id, marketId, -7) ?? today;
          return {
            crop: c,
            today,
            dayChange: ((today - yesterday) / yesterday) * 100,
            weekChange: ((today - lastWeek) / lastWeek) * 100,
          };
        }),
    [category, query, marketId],
  );

  const detailCrop = crops.find((c) => c.id === selected) ?? crops[0]!;
  const history = useMemo(
    () =>
      priceHistory(detailCrop.id, marketId, 30).map((h) => ({
        date: h.date.slice(5),
        price: h.price,
      })),
    [detailCrop.id, marketId],
  );
  const marketWise = useMemo(
    () =>
      markets
        .map((m) => ({ market: m, price: priceFor(detailCrop.id, m.id) ?? 0 }))
        .sort((a, b) => b.price - a.price)
        .slice(0, 8),
    [detailCrop.id],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("prices.title")} subtitle={t("prices.subtitle")} />
      <DemoBadge />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="q">{t("common.search")}</Label>
          <Input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("prices.searchPlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat">{t("prices.category")}</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as CropCategory | "all")}>
            <SelectTrigger id="cat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="vegetables">{t("cat.vegetables")}</SelectItem>
              <SelectItem value="fruits">{t("cat.fruits")}</SelectItem>
              <SelectItem value="flowers">{t("cat.flowers")}</SelectItem>
              <SelectItem value="grains">{t("cat.grains")}</SelectItem>
              <SelectItem value="pulses">{t("cat.pulses")}</SelectItem>
              <SelectItem value="commercial">{t("cat.commercial")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mkt">{t("common.market")}</Label>
          <Select value={marketId} onValueChange={setMarketId}>
            <SelectTrigger id="mkt">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {markets.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {pick(m.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState message={t("common.empty")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ crop, today, dayChange, weekChange }) => {
            const Icon = dayChange > 0.5 ? TrendingUp : dayChange < -0.5 ? TrendingDown : Minus;
            const tone =
              dayChange > 0.5 ? "text-success" : dayChange < -0.5 ? "text-destructive" : "text-muted-foreground";
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelected(crop.id)}
                aria-pressed={selected === crop.id}
                className={`rounded-2xl border p-4 text-start shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lift ${
                  selected === crop.id ? "border-primary bg-secondary" : "border-border bg-card"
                }`}
              >
                <p className="font-semibold">{pick(crop.name)}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(today, locale)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("common.perKg")}
                  </span>
                </p>
                <p className={`mt-1 flex items-center gap-1 text-sm ${tone}`}>
                  <Icon className="size-4" aria-hidden />
                  {t("prices.change24h")}: {dayChange.toFixed(1)}% · {t("prices.changeWeek")}:{" "}
                  {weekChange.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("prices.arrivals")}: {arrivalsFor(crop.id, marketId)} {t("common.quintal")}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {pick(detailCrop.name)} — {t("prices.trend30")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={45} />
                <RTooltip
                  formatter={(v: number) => [formatCurrency(v, locale), t("common.price")]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  name={t("common.price")}
                  stroke="var(--color-chart-1)"
                  fill="url(#pg)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("prices.marketWise")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {marketWise.map(({ market, price }) => (
              <div
                key={market.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <span>{pick(market.name)}</span>
                <span className="font-semibold">
                  {formatCurrency(price, locale)}
                  {t("common.perKg")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
