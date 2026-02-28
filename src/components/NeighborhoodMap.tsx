"use client";

import { useEffect, useRef, useState } from "react";

type GeoPoint = {
  area_name: string;
  median_rent: number;
  lat: number;
  lng: number;
  listing_count: string;
};

type Props = {
  data: GeoPoint[];
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function rentColor(rent: number): string {
  if (rent < 2000) return "#22c55e";
  if (rent < 2500) return "#4ade80";
  if (rent < 3000) return "#86efac";
  if (rent < 3500) return "#fbbf24";
  if (rent < 4000) return "#f97316";
  if (rent < 5000) return "#ef4444";
  return "#dc2626";
}

function rentRadius(count: string): number {
  const c = parseInt(count);
  if (c > 400) return 20;
  if (c > 200) return 16;
  if (c > 100) return 13;
  if (c > 50) return 10;
  return 8;
}

export function NeighborhoodMap({ data }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!mapContainer.current) return;

    let map: any;
    let cancelled = false;

    (async () => {
      try {
        const mapboxModule = await import("mapbox-gl");
        const mapboxgl = mapboxModule.default || mapboxModule;

        if (cancelled) return;

        (mapboxgl as any).accessToken = MAPBOX_TOKEN;

        map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [-73.97, 40.72],
          zoom: 11,
          attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
          if (cancelled) return;
          setStatus("ready");

          const geojson = {
            type: "FeatureCollection" as const,
            features: data.map((d) => ({
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [d.lng, d.lat],
              },
              properties: {
                name: d.area_name,
                rent: Math.round(d.median_rent),
                count: d.listing_count,
                color: rentColor(d.median_rent),
                radius: rentRadius(d.listing_count),
              },
            })),
          };

          map.addSource("neighborhoods", { type: "geojson", data: geojson });

          map.addLayer({
            id: "neighborhood-circles",
            type: "circle",
            source: "neighborhoods",
            paint: {
              "circle-radius": ["get", "radius"],
              "circle-color": ["get", "color"],
              "circle-opacity": 0.7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "white",
            },
          });

          map.addLayer({
            id: "neighborhood-labels",
            type: "symbol",
            source: "neighborhoods",
            layout: {
              "text-field": ["concat", ["get", "name"], "\n$", ["to-string", ["get", "rent"]]],
              "text-size": 11,
              "text-offset": [0, -2],
              "text-anchor": "bottom",
              "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
            },
            paint: {
              "text-color": "#121111",
              "text-halo-color": "white",
              "text-halo-width": 1.5,
            },
            minzoom: 11.5,
          });

          map.on("click", "neighborhood-circles", (e: any) => {
            const f = e.features[0];
            new mapboxgl.Popup({ closeButton: false, offset: 15 })
              .setLngLat(e.lngLat)
              .setHTML(
                `<div style="font-family:system-ui;padding:4px">
                  <strong style="font-size:14px">${f.properties.name}</strong><br/>
                  <span style="color:#00a67e;font-weight:700;font-size:18px">$${f.properties.rent.toLocaleString()}</span><br/>
                  <span style="color:#888;font-size:12px">${f.properties.count} listings</span>
                </div>`
              )
              .addTo(map);
          });

          map.on("mouseenter", "neighborhood-circles", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "neighborhood-circles", () => {
            map.getCanvas().style.cursor = "";
          });
        });

        map.on("error", (e: any) => {
          console.error("Mapbox error:", e);
          if (!cancelled) setStatus("error");
        });
      } catch (err) {
        console.error("Failed to load mapbox-gl:", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [data]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css"
        rel="stylesheet"
      />
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {status === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            fontSize: 14,
            background: "var(--light-gray, #f2efeb)",
            borderRadius: 16,
          }}
        >
          Loading map...
        </div>
      )}
      {status === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            fontSize: 14,
            background: "var(--light-gray, #f2efeb)",
            borderRadius: 16,
          }}
        >
          Map failed to load. Try refreshing.
        </div>
      )}
    </div>
  );
}
