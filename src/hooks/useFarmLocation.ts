import { useCallback, useEffect, useState } from "react";
import { districts } from "@/data/agri";

export type FarmLocation = {
  lat: number;
  lng: number;
  source: "gps" | "manual";
  districtId: string;
};

const STORAGE_KEY = "ks360.location";
const DEFAULT: FarmLocation = {
  lat: 12.5223,
  lng: 76.8977,
  source: "manual",
  districtId: "mandya",
};

export function useFarmLocation() {
  const [location, setLocation] = useState<FarmLocation>(DEFAULT);
  const [status, setStatus] = useState<"idle" | "locating" | "granted" | "denied">("idle");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLocation(JSON.parse(raw) as FarmLocation);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: FarmLocation) => {
    setLocation(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const nearestDistrictId = useCallback((lat: number, lng: number) => {
    let bestId = DEFAULT.districtId;
    let bestD = Infinity;
    for (const d of districts) {
      const dd = (d.lat - lat) ** 2 + (d.lng - lng) ** 2;
      if (dd < bestD) {
        bestD = dd;
        bestId = d.id;
      }
    }
    return bestId;
  }, []);

  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        persist({
          lat: latitude,
          lng: longitude,
          source: "gps",
          districtId: nearestDistrictId(latitude, longitude),
        });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, [nearestDistrictId, persist]);

  const setDistrict = useCallback(
    (districtId: string) => {
      const d = districts.find((x) => x.id === districtId);
      if (!d) return;
      persist({ lat: d.lat, lng: d.lng, source: "manual", districtId });
    },
    [persist],
  );

  return { location, status, requestGps, setDistrict };
}
