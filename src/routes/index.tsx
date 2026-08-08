import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CloudSun,
  Landmark,
  LineChart,
  MapPin,
  Sprout,
  Store,
  Truck,
  Warehouse,
  Users,
} from "lucide-react";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { LocationPicker } from "@/components/LocationPicker";
import { DemoBadge } from "@/components/Chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crops } from "@/data/agri";
import { calculateBestMarket, getWeather, priceFor } from "@/services/agriService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krishi Samparka 360 — Smart Decisions for Your Farming" },
      {
        name: "description",
        content:
          "Compare Karnataka APMC markets on net revenue, track crop prices, forecast prices, check farm weather and book services — in Kannada or English.",
      },
      { property: "og:title", content: "Krishi Samparka 360 — From Farm to Market" },
      {
        property: "og:description",
        content:
          "Markets, prices, weather, transport, storage and agricultural services for Karnataka farmers, all in one platform.",
      },
    ],
  }),
  component: Home,
});

const QUICK = [
  { to: "/markets", icon: Store, key: "nav.markets" },
  { to: "/prices", icon: BarChart3, key: "nav.prices" },
  { to: "/prediction", icon: LineChart, key: "nav.prediction" },
  { to: "/weather", icon: CloudSun, key: "nav.weather" },
  { to: "/services", icon: Truck, key: "services.transport" },
  { to: "/services", icon: Warehouse, key: "services.storage" },
  { to: "/services", icon: Users, key: "services.labor" },
  { to: "/schemes", icon: Landmark, key: "nav.schemes" },
] as const;

function Home() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const origin = loc.location;

  const topPrices = useMemo(
    () =>
      ["tomato", "onion", "ragi", "banana", "potato", "maize"].map((id) => {
        const crop = crops.find((c) => c.id === id)!;
        return { crop, price: priceFor(id, origin.districtId) ?? crop.basePrice };
      }),
    [origin.districtId],
  );

  const weather = useMemo(() => getWeather(origin), [origin]);
  const tip = useMemo(
    () => calculateBestMarket({ cropId: "tomato", quantityKg: 500, origin }).recommended,
    [origin],
  );

  return (
    <div>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
            <Sprout className="size-4" aria-hidden /> {t("brand.tagline")}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">{t("home.heroSub")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-sun text-sun-foreground hover:bg-sun/90">
              <Link to="/markets">
                <MapPin className="size-5" aria-hidden /> {t("home.ctaMarkets")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
            >
              <Link to="/assistant">
                <Bot className="size-5" aria-hidden /> {t("home.ctaAdvice")}
              </Link>
            </Button>
          </div>

          <div className="mt-8 rounded-2xl bg-background/95 p-4 text-foreground shadow-lift">
            <LocationPicker loc={loc} compact />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12">
        <DemoBadge />

        <section aria-labelledby="quick">
          <h2 id="quick" className="mb-4 text-2xl font-bold">
            {t("home.quickActions")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK.map((q, i) => (
              <Link
                key={`${q.to}-${i}`}
                to={q.to}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card-gradient p-4 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <q.icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold">{t(q.key)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t("home.todayPrices")}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/prices">
                  {t("common.viewAll")} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {topPrices.map(({ crop, price }) => (
                <div key={crop.id} className="rounded-xl border border-border p-3">
                  <p className="text-sm text-muted-foreground">{pick(crop.name)}</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(price, locale)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {t("common.perKg")}
                    </span>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("home.weatherNow")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl font-bold">{weather.tempC}°C</p>
              <p className="text-sm text-muted-foreground">
                {t("weather.humidity")}: {weather.humidity}% · {t("weather.rainChance")}:{" "}
                {weather.rainChance}%
              </p>
              <Button asChild variant="secondary" size="sm">
                <Link to="/weather">{t("nav.weather")}</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {tip && (
          <section>
            <Card className="border-primary/30 bg-card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="size-5 text-primary" aria-hidden /> {t("home.aiRecommendation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">{pick(tip.market.name)}</p>
                <p className="text-muted-foreground">
                  {pick(crops.find((c) => c.id === "tomato")!.name)} · 500 {t("common.kg")} ·{" "}
                  {tip.distanceKm} {t("common.km")} · {t("markets.net")}:{" "}
                  <strong className="text-foreground">{formatCurrency(tip.net, locale)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">{t("markets.reasonText")}</p>
                <Button asChild size="sm">
                  <Link to="/markets">{t("home.ctaMarkets")}</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        <section aria-labelledby="how">
          <h2 id="how" className="mb-4 text-2xl font-bold">
            {t("home.howItWorks")}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {n}
                </span>
                <p className="mt-3 font-semibold">
                  {t(`home.step${n}` as "home.step1")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`home.step${n}d` as "home.step1d")}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="inn">
          <h2 id="inn" className="mb-4 text-2xl font-bold">
            {t("home.innovations")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n}>
                <CardHeader>
                  <CardTitle>{t(`home.inn${n}` as "home.inn1")}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t(`home.inn${n}d` as "home.inn1d")}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
