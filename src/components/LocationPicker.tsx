import { MapPin, LocateFixed } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { districts } from "@/data/agri";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useFarmLocation } from "@/hooks/useFarmLocation";

type Loc = ReturnType<typeof useFarmLocation>;

export function LocationPicker({ loc, compact = false }: { loc: Loc; compact?: boolean }) {
  const { t, pick } = useI18n();
  const current = districts.find((d) => d.id === loc.location.districtId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size={compact ? "default" : "lg"}
        variant="secondary"
        onClick={loc.requestGps}
        disabled={loc.status === "locating"}
      >
        <LocateFixed className="size-4" aria-hidden />
        {loc.status === "locating" ? t("home.locating") : t("home.useLocation")}
      </Button>

      <Select value={loc.location.districtId} onValueChange={loc.setDistrict}>
        <SelectTrigger className="min-w-52" aria-label={t("home.chooseDistrict")}>
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          <SelectValue placeholder={t("home.chooseDistrict")} />
        </SelectTrigger>
        <SelectContent>
          {districts.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {pick(d.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loc.status === "granted" && (
        <span className="text-sm font-medium text-success">
          {t("home.locationFound")}
          {current ? ` — ${pick(current.name)}` : ""}
        </span>
      )}
      {loc.status === "denied" && (
        <span className="text-sm text-muted-foreground">{t("home.locationDenied")}</span>
      )}
    </div>
  );
}
