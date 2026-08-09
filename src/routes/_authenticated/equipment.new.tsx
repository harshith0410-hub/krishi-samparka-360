import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHeader } from "@/components/Chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PHOTO_LABELS, equipmentCategories, type EquipmentCondition } from "@/lib/equipment";

export const Route = createFileRoute("/_authenticated/equipment/new")({
  head: () => ({
    meta: [
      { title: "List your equipment for rent — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Publish your tractor, rotavator or harvester to the shared marketplace, set your own price and availability, and earn from idle machinery.",
      },
      { property: "og:title", content: "Rent out my equipment — Krishi Samparka 360" },
      { property: "og:description", content: "Publish your machinery and start earning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewEquipmentPage,
});

const CONDITIONS: EquipmentCondition[] = ["EXCELLENT", "GOOD", "AVERAGE", "NEEDS_MAINTENANCE"];

function NewEquipmentPage() {
  const { t, pick } = useI18n();
  const { userId } = useAuth();
  const loc = useFarmLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    taluk: "",
    village: "",
    pin: "",
    category: "tractor",
    name: "",
    brand: "",
    model: "",
    year: "",
    condition: "GOOD" as EquipmentCondition,
    description: "",
    hour: "",
    day: "",
    half: "",
    deposit: "",
    deliveryFee: "",
    operatorFee: "",
  });
  const [flags, setFlags] = useState({
    operator: false,
    fuel: false,
    delivery: false,
    pickup: true,
    maintenance: false,
  });
  const [coords, setCoords] = useState({ lat: loc.location.lat, lng: loc.location.lng });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  function useGps() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error(t("eq.gpsDenied"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success(t("home.locationFound"));
      },
      () => toast.error(t("eq.gpsDenied")),
    );
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    try {
      await supabase
        .from("profiles")
        .update({
          full_name: form.fullName,
          phone: form.phone,
          email: form.email || null,
          district: form.district,
          taluk: form.taluk,
          village: form.village,
          pin_code: form.pin,
        })
        .eq("id", userId);

      const { data: created, error } = await supabase
        .from("equipment")
        .insert({
          owner_id: userId,
          category: form.category,
          name: form.name,
          brand: form.brand || null,
          model: form.model || null,
          manufacturing_year: form.year ? Number(form.year) : null,
          condition: form.condition,
          description: form.description || null,
          latitude: coords.lat,
          longitude: coords.lng,
          district: form.district,
          taluk: form.taluk || null,
          village: form.village || null,
          pin_code: form.pin || null,
          price_per_hour: Number(form.hour || 0),
          price_per_day: Number(form.day || 0),
          half_day_price: Number(form.half || 0),
          security_deposit: Number(form.deposit || 0),
          delivery_available: flags.delivery,
          delivery_fee: Number(form.deliveryFee || 0),
          operator_available: flags.operator,
          operator_fee: Number(form.operatorFee || 0),
          fuel_included: flags.fuel,
          pickup_available: flags.pickup,
          maintenance_included: flags.maintenance,
          status: "ACTIVE",
        })
        .select("id")
        .single();
      if (error) throw error;

      let sort = 0;
      for (const meta of PHOTO_LABELS) {
        const file = files[meta.id];
        if (!file) continue;
        const path = `${userId}/${created.id}/${meta.id}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from("equipment-photos")
          .upload(path, file, { upsert: true });
        if (upErr) continue;
        const { data: signed } = await supabase.storage
          .from("equipment-photos")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (!signed?.signedUrl) continue;
        await supabase.from("equipment_images").insert({
          equipment_id: created.id,
          url: signed.signedUrl,
          label: meta.id,
          sort_order: sort++,
        });
      }

      toast.success(t("eq.published"));
      navigate({ to: "/my-equipment" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mx-auto max-w-3xl space-y-5 px-4 py-10" onSubmit={publish}>
      <PageHeader title={t("eq.rentOut")} subtitle={t("eq.subtitle")} />

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">{t("eq.ownerInfo")}</h2>
          <Field label={t("eq.ownName")} value={form.fullName} onChange={(v) => set("fullName", v)} required />
          <Field label={t("eq.mobile")} value={form.phone} onChange={(v) => set("phone", v)} required />
          <Field label={t("eq.emailOptional")} value={form.email} onChange={(v) => set("email", v)} />
          <Field label={t("common.district")} value={form.district} onChange={(v) => set("district", v)} required />
          <Field label={t("eq.taluk")} value={form.taluk} onChange={(v) => set("taluk", v)} />
          <Field label={t("eq.village")} value={form.village} onChange={(v) => set("village", v)} />
          <Field label={t("eq.pin")} value={form.pin} onChange={(v) => set("pin", v)} />
          <div className="sm:col-span-2">
            <Button type="button" variant="secondary" onClick={useGps}>
              {t("eq.useGps")}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">{t("eq.category")}</h2>
          <div className="space-y-1.5">
            <Label>{t("eq.category")}</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          <Field label={t("eq.name")} value={form.name} onChange={(v) => set("name", v)} required />
          <Field label={t("eq.brand")} value={form.brand} onChange={(v) => set("brand", v)} />
          <Field label={t("eq.model")} value={form.model} onChange={(v) => set("model", v)} />
          <Field label={t("eq.year")} value={form.year} onChange={(v) => set("year", v)} type="number" />
          <div className="space-y-1.5">
            <Label>{t("eq.condition")}</Label>
            <Select
              value={form.condition}
              onValueChange={(v) => setForm((s) => ({ ...s, condition: v as EquipmentCondition }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`eq.cond.${c}` as "eq.cond.GOOD")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="desc">{t("eq.description")}</Label>
            <Textarea
              id="desc"
              value={form.description}
              maxLength={800}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("eq.photos")}</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {PHOTO_LABELS.map((p) => (
                <div key={p.id} className="space-y-1">
                  <span className="text-xs text-muted-foreground">{pick(p.label)}</span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFiles((s) => ({ ...s, [p.id]: e.target.files?.[0] ?? null }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">{t("eq.pricing")}</h2>
          <Field label={t("eq.pricePerHour")} value={form.hour} onChange={(v) => set("hour", v)} type="number" required />
          <Field label={t("eq.pricePerDay")} value={form.day} onChange={(v) => set("day", v)} type="number" />
          <Field label={t("eq.halfDay")} value={form.half} onChange={(v) => set("half", v)} type="number" />
          <Field label={t("eq.deposit")} value={form.deposit} onChange={(v) => set("deposit", v)} type="number" />
          <Field
            label={t("eq.deliveryCharge")}
            value={form.deliveryFee}
            onChange={(v) => set("deliveryFee", v)}
            type="number"
          />
          <Field
            label={t("eq.operatorCharge")}
            value={form.operatorFee}
            onChange={(v) => set("operatorFee", v)}
            type="number"
          />
          <h2 className="font-semibold sm:col-span-2">{t("eq.serviceOptions")}</h2>
          {(
            [
              ["operator", t("eq.operatorAvailable")],
              ["fuel", t("eq.fuelIncluded")],
              ["delivery", t("eq.deliveryAvailable")],
              ["pickup", t("eq.pickupAvailable")],
              ["maintenance", t("eq.maintenanceIncluded")],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Switch
                id={key}
                checked={flags[key]}
                onCheckedChange={(v) => setFlags((s) => ({ ...s, [key]: v }))}
              />
              <Label htmlFor={key}>{label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? t("eq.publishing") : t("eq.publish")}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        required={required}
        maxLength={120}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
