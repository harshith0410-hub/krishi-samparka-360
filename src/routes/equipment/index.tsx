import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search, Tractor, Star, Truck, User } from "lucide-react";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { useAuth } from "@/hooks/useAuth";
import { LocationPicker } from "@/components/LocationPicker";
import { EmptyState, PageHeader } from "@/components/Chrome";
import { MapPanel, type MapPoint } from "@/components/MapPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { equipmentCategories, categoryLabel, haversineKm } from "@/lib/equipment";
import { useEquipmentRealtime, useListings, type Listing } from "@/lib/equipmentQueries";

export const Route = createFileRoute("/equipment/")({
  head: () => ({
    meta: [
      { title: "Farm Equipment Rental Marketplace — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Rent tractors, rotavators, harvesters and sprayers from farmers near you — or list your own machinery and earn from it. One shared marketplace.",
      },
      { property: "og:title", content: "Equipment Rental — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Two-sided farm equipment rental: find machinery nearby or rent out your own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EquipmentPage,
});

function EquipmentPage() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const { userId } = useAuth();
  useEquipmentRealtime();

  const { data: listings, isLoading } = useListings();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [maxDistance, setMaxDistance] = useState(150);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [compare, setCompare] = useState<string[]>([]);

  const origin = loc.location;

  const rows = useMemo(() => {
    const list = (listings ?? []).map((l) => ({
      l,
      km: haversineKm(origin, { lat: l.latitude, lng: l.longitude }),
    }));
    const term = q.trim().toLowerCase();
    return list
      .filter(({ l, km }) => {
        if (category !== "all" && l.category !== category) return false;
        if (km > maxDistance) return false;
        if (Number(l.price_per_hour) > maxPrice) return false;
        if ((l.owner?.rating ?? 5) < minRating) return false;
        if (onlyAvailable && l.status !== "ACTIVE") return false;
        if (!term) return true;
        const hay = [
          l.name,
          l.brand ?? "",
          l.model ?? "",
          l.district,
          pick(categoryLabel(l.category)),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => a.km - b.km);
  }, [listings, origin, q, category, maxDistance, maxPrice, minRating, onlyAvailable, pick]);

  const points: MapPoint[] = rows.map(({ l, km }) => ({
    id: l.id,
    type: "equipment",
    lat: l.latitude,
    lng: l.longitude,
    title: l.name,
    subtitle: `${km} ${t("common.km")} · ${formatCurrency(Number(l.price_per_hour), locale)}/${t("common.perKg").replace("/", "")}`,
  }));

  const compared = rows.filter(({ l }) => compare.includes(l.id));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("eq.title")} subtitle={t("eq.subtitle")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-primary/40 bg-secondary/40">
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="text-2xl" aria-hidden>
              🚜
            </span>
            <div>
              <h2 className="font-semibold">{t("eq.rent")}</h2>
              <p className="text-sm text-muted-foreground">{t("eq.searchPlaceholder")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="text-2xl" aria-hidden>
              🏷️
            </span>
            <div className="flex-1">
              <h2 className="font-semibold">{t("eq.rentOut")}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/equipment/new">{t("eq.listNew")}</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to="/my-equipment">{t("eq.myEquipment")}</Link>
                </Button>
                {userId && (
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/my-rentals">{t("eq.myRentals")}</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <LocationPicker loc={loc} compact />

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="eq-search">{t("common.search")}</Label>
            <div className="relative">
              <Search
                className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="eq-search"
                className="ps-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("eq.searchPlaceholder")}
                maxLength={80}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("eq.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {equipmentCategories.map((g) => (
                  <SelectGroup key={g.id}>
                    <SelectLabel>{pick(g.label)}</SelectLabel>
                    {g.items.map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {pick(it.label)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>
              {t("eq.maxDistance")}: {maxDistance} {t("common.km")}
            </Label>
            <Slider
              value={[maxDistance]}
              min={5}
              max={300}
              step={5}
              onValueChange={(v) => setMaxDistance(v[0] ?? 150)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              {t("eq.maxPrice")}: {formatCurrency(maxPrice, locale)}
            </Label>
            <Slider
              value={[maxPrice]}
              min={100}
              max={5000}
              step={50}
              onValueChange={(v) => setMaxPrice(v[0] ?? 5000)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              {t("eq.minRating")}: {minRating.toFixed(1)}
            </Label>
            <Slider
              value={[minRating]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={(v) => setMinRating(v[0] ?? 0)}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch id="only-avail" checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
            <Label htmlFor="only-avail">{t("eq.onlyAvailable")}</Label>
          </div>
        </CardContent>
      </Card>

      {points.length > 0 && <MapPanel center={origin} points={points} height={360} />}

      {compared.length > 1 && (
        <Card>
          <CardContent className="space-y-3 overflow-x-auto pt-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{t("eq.comparison")}</h2>
              <Button size="sm" variant="ghost" onClick={() => setCompare([])}>
                {t("eq.clearCompare")}
              </Button>
            </div>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-start text-muted-foreground">
                  <th className="p-2 text-start" />
                  {compared.map(({ l }) => (
                    <th key={l.id} className="p-2 text-start font-semibold text-foreground">
                      {l.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    [t("common.distance"), ({ km }: { km: number }) => `${km} ${t("common.km")}`],
                    [
                      t("eq.pricePerHour"),
                      ({ l }: { l: Listing }) => formatCurrency(Number(l.price_per_hour), locale),
                    ],
                    [t("services.rating"), ({ l }: { l: Listing }) => (l.owner?.rating ?? 5).toFixed(1)],
                    [
                      t("eq.deliveryAvailable"),
                      ({ l }: { l: Listing }) => (l.delivery_available ? "✓" : "—"),
                    ],
                    [
                      t("eq.operatorAvailable"),
                      ({ l }: { l: Listing }) => (l.operator_available ? "✓" : "—"),
                    ],
                    [
                      t("eq.condition"),
                      ({ l }: { l: Listing }) => t(`eq.cond.${l.condition}` as "eq.cond.GOOD"),
                    ],
                  ] as const
                ).map(([label, render]) => (
                  <tr key={label} className="border-t border-border">
                    <td className="p-2 text-muted-foreground">{label}</td>
                    {compared.map((row) => (
                      <td key={row.l.id} className="p-2 font-medium">
                        {render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState message={t("eq.noListings")} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ l, km }) => (
            <ListingCard
              key={l.id}
              listing={l}
              km={km}
              selected={compare.includes(l.id)}
              onCompare={() =>
                setCompare((s) =>
                  s.includes(l.id) ? s.filter((x) => x !== l.id) : [...s, l.id].slice(-3),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({
  listing,
  km,
  selected,
  onCompare,
}: {
  listing: Listing;
  km: number;
  selected: boolean;
  onCompare: () => void;
}) {
  const { t, pick, locale } = useI18n();
  const cover = listing.images[0]?.url;
  return (
    <Card className="overflow-hidden">
      {cover ? (
        <img
          src={cover}
          alt={`${listing.name} — ${listing.district}`}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-muted">
          <Tractor className="size-10 text-muted-foreground" aria-hidden />
        </div>
      )}
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{listing.name}</h3>
            <p className="text-xs text-muted-foreground">
              {pick(categoryLabel(listing.category))}
              {listing.brand ? ` · ${listing.brand}` : ""}
            </p>
          </div>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
            {t("eq.slot.AVAILABLE")}
          </span>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden /> {listing.district} · {km} {t("common.km")}
        </p>
        <p className="text-lg font-bold">
          {formatCurrency(Number(listing.price_per_hour), locale)}
          <span className="text-sm font-normal text-muted-foreground"> / {t("common.perKg").replace("/", "")}</span>
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-sun text-sun" aria-hidden />
            {(listing.owner?.rating ?? 5).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <User className="size-3.5" aria-hidden />
            {listing.owner?.full_name || t("eq.owner")}
          </span>
          {listing.delivery_available && (
            <span className="flex items-center gap-1">
              <Truck className="size-3.5" aria-hidden />
              {t("eq.delivery")}
            </span>
          )}
          <span>{t(`eq.cond.${listing.condition}` as "eq.cond.GOOD")}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm">
            <Link to="/equipment/$id" params={{ id: listing.id }}>
              {t("common.details")}
            </Link>
          </Button>
          <Button size="sm" variant={selected ? "secondary" : "outline"} onClick={onCompare}>
            {t("eq.compare")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
