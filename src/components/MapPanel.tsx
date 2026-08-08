import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapPoint } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

export function MapPanel({
  center,
  points,
  height = 420,
}: {
  center: { lat: number; lng: number };
  points: MapPoint[];
  height?: number;
}) {
  const fallback = <Skeleton className="w-full rounded-2xl" style={{ height }} />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <LeafletMap center={center} points={points} height={height} />
      </Suspense>
    </ClientOnly>
  );
}

export type { MapPoint };
