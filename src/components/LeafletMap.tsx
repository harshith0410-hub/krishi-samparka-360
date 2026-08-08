import { useEffect, useMemo, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/i18n/I18nProvider";
import type { PoiType } from "@/data/agri";

export type MapPoint = {
  id: string;
  type: PoiType;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
};

const COLORS: Record<PoiType, string> = {
  market: "#1f7a43",
  warehouse: "#2563eb",
  coldStorage: "#0891b2",
  equipment: "#ea8317",
  transport: "#7c3aed",
  buyer: "#be185d",
  office: "#475569",
};

export default function LeafletMap({
  center,
  points,
  height = 420,
}: {
  center: { lat: number; lng: number };
  points: MapPoint[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const { t, lang } = useI18n();

  const key = useMemo(() => points.map((p) => p.id).join(","), [points]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        [center.lat, center.lng],
        9,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      // force a resize pass after mount
      setTimeout(() => map.invalidateSize(), 200);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      const map = mapRef.current;
      const layer = layerRef.current;
      if (cancelled || !map || !layer) return;
      layer.clearLayers();

      L.circleMarker([center.lat, center.lng], {
        radius: 9,
        color: "#166534",
        fillColor: "#22c55e",
        fillOpacity: 1,
        weight: 3,
      })
        .bindPopup(`<strong>${t("common.location")}</strong>`)
        .addTo(layer);

      for (const p of points) {
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${COLORS[p.type]};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const directions = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
        L.marker([p.lat, p.lng], { icon })
          .bindPopup(
            `<div style="min-width:170px"><strong>${escapeHtml(p.title)}</strong><br/>${
              p.subtitle ? `<span>${escapeHtml(p.subtitle)}</span><br/>` : ""
            }<a href="${directions}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              t("common.directions"),
            )}</a></div>`,
          )
          .addTo(layer);
      }

      map.setView([center.lat, center.lng], map.getZoom() ?? 9);
    })();
    return () => {
      cancelled = true;
    };
  }, [key, center.lat, center.lng, lang, points, t]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={t("markets.mapView")}
      className="w-full overflow-hidden rounded-2xl border border-border shadow-soft"
      style={{ height }}
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (ch) =>
      (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as Record<
        string,
        string
      >)[ch]!,
  );
}
