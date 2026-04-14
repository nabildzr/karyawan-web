// * This file defines route module logic for src/pages/Karyawan/routes/absensi/components/AbsensiMapSection.tsx.

import {
    Building2,
    CheckCircle2,
    Circle,
    CircleX,
    Compass,
    MapPin,
} from "lucide-react";
import {
    Map,
    MapCircle,
    MapMarker,
    MapPolyline,
    MapPopup,
    MapTileLayer,
    MapZoomControl,
} from "../../../../../components/ui/map";
import type { GeofenceWithDistance } from "../types/AbsensiTypes";
import MapRecenter from "./MapRecenter";

interface AbsensiMapSectionProps {
  currentCoordinates: [number, number];
  recenterTrigger: number;
  nearestOffices: GeofenceWithDistance[];
  nearestOffice: GeofenceWithDistance | null;
  lineCoordinates: [number, number][];
  currentLocationLabel: string;
  isInsideArea: boolean;
  onCompassClick: () => void;
}

// & This function component/helper defines AbsensiMapSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AbsensiMapSection untuk file route ini.
const AbsensiMapSection = ({
  currentCoordinates,
  recenterTrigger,
  nearestOffices,
  nearestOffice,
  lineCoordinates,
  currentLocationLabel,
  isInsideArea,
  onCompassClick,
}: AbsensiMapSectionProps) => {
  // & Process the main execution steps of AbsensiMapSection inside this function body.
  // % Memproses langkah eksekusi utama AbsensiMapSection di dalam body fungsi ini.
  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs">
      <div className="relative h-[260px]">
        <Map center={currentCoordinates} zoom={16} className="h-full w-full">
          <MapRecenter center={currentCoordinates} trigger={recenterTrigger} />
          <MapTileLayer />
          <MapZoomControl position="topright" />

          {nearestOffices.slice(0, 3).map((office) => (
            <MapCircle
              key={`circle-${office.id}`}
              center={[office.latitude, office.longitude]}
              radius={office.radius}
              pathOptions={{
                color: office.isInside ? "#16a34a" : "#3b82f6",
                fillColor: office.isInside ? "#16a34a" : "#3b82f6",
                fillOpacity: office.isInside ? 0.18 : 0.08,
                weight: office.id === nearestOffice?.id ? 2.2 : 1.4,
              }}
            />
          ))}

          {lineCoordinates.length === 2 && (
            <MapPolyline
              positions={lineCoordinates}
              pathOptions={{
                color: "#2563eb",
                weight: 3,
                opacity: 0.75,
                dashArray: "10 6",
              }}
            />
          )}

          <MapMarker
            position={currentCoordinates}
            icon={<Circle className="h-4 w-4 fill-success-500 text-success-500" />}
            iconAnchor={[8, 8]}
          >
            <MapPopup>
              <div className="w-44">
                <p className="text-sm font-semibold text-gray-900">{currentLocationLabel}</p>
                <p className="mt-1 text-xs text-gray-600">Lokasi perangkat Anda saat ini.</p>
              </div>
            </MapPopup>
          </MapMarker>

          {nearestOffices.slice(0, 3).map((office) => (
            <MapMarker
              key={office.id}
              position={[office.latitude, office.longitude]}
              icon={
                <Building2
                  className={`h-5 w-5 ${
                    office.id === nearestOffice?.id ? "text-brand-600" : "text-brand-400"
                  }`}
                />
              }
              iconAnchor={[10, 10]}
            >
              <MapPopup>
                <div className="w-48">
                  <p className="text-sm font-semibold text-gray-900">{office.name}</p>
                  <p className="mt-1 text-xs text-gray-600">Jarak: {office.distanceLabel}</p>
                  <p className="mt-0.5 text-xs text-gray-600">Radius: {Math.round(office.radius)} m</p>
                </div>
              </MapPopup>
            </MapMarker>
          ))}
        </Map>

        <button
          type="button"
          onClick={onCompassClick}
          className="absolute left-3 top-3 z-[1000] inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/95 px-2.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs backdrop-blur"
        >
          <Compass className="h-4 w-4 text-brand-600" />
          Kompas
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 pb-4 pt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/85">Lokasi Terkini</p>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold leading-tight text-white">
                <MapPin className="h-5 w-5 shrink-0 text-success-300" />
                <span>{currentLocationLabel}</span>
              </p>
              <p className="mt-1 text-xs text-white/80">
                {nearestOffice
                  ? `Kantor terdekat: ${nearestOffice.name} • ${nearestOffice.distanceLabel}`
                  : "Belum ada data kantor dari API geofence."}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/30 px-3 py-1.5 text-sm font-semibold leading-none text-white backdrop-blur-sm">
              {isInsideArea ? (
                <CheckCircle2 className="h-4 w-4 text-success-300" />
              ) : (
                <CircleX className="h-4 w-4 text-error-300" />
              )}
              {isInsideArea ? "Dalam Area" : "Di Luar Area"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AbsensiMapSection;
