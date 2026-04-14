import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, {
  Column,
} from "../../../components/tables/DataTables/DataTable";
import { Modal } from "../../../components/ui/modal";
import { useGeofences } from "../../../hooks/useGeofences";
import type {
  CreateGeofenceInput,
  Geofence,
} from "../../../types/geofences.types";

// ── Custom Leaflet icons (avoid bundler image path issues) ────
const pinIcon = (color: string, size = 20) =>
  L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });

const defaultPin = pinIcon("#3b82f6");       // blue
const selectedPin = pinIcon("#ef4444", 24);  // red (active/edit target)
const pickerPin = pinIcon("#10b981", 22);    // green (coordinate picker)

// ── Map helpers ───────────────────────────────────────────────

/** Invalidate map size after mount (fixes sizing inside modals) */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/** Fit map view to all geofences on first load */
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] });
  }, [positions.length]); // eslint-disable-line
  return null;
}

/** Click handler inside MapContainer */
function MapClickCapture({
  onCoordChange,
}: {
  onCoordChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => onCoordChange(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

// ── Coordinate Picker (embedded inside form modal) ────────────
interface CoordPickerProps {
  lat: number;
  lng: number;
  radius: number;
  onCoordChange: (lat: number, lng: number) => void;
}

function CoordPicker({ lat, lng, radius, onCoordChange }: CoordPickerProps) {
  const JAKARTA: [number, number] = [-6.2088, 106.8456];
  const hasCoord = lat !== 0 || lng !== 0;
  const center: [number, number] = hasCoord ? [lat, lng] : JAKARTA;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={hasCoord ? 15 : 11}

        style={{ height: "260px", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />
        <MapClickCapture onCoordChange={onCoordChange} />
        {hasCoord && (
          <>
            <Marker
              position={[lat, lng]}
              icon={pickerPin}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = (e.target as L.Marker).getLatLng();
                  onCoordChange(pos.lat, pos.lng);
                },
              }}
            />
            <Circle
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color: "#10b981",
                fillColor: "#10b981",
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
          </>
        )}
      </MapContainer>
      <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500">
        Klik pada peta atau seret pin untuk memilih koordinat
      </p>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────
function GeofenceDetailModal({
  geofence,
  onClose,
  onEdit,
}: {
  geofence: Geofence | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!geofence) return null;
  const center: [number, number] = [Number(geofence.latitude), Number(geofence.longitude)];

  return (
    <Modal
      isOpen={!!geofence}
      onClose={onClose}
      className="max-w-lg p-6 sm:p-8"
    >
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
        {geofence.name}
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Detail lokasi geofence
      </p>

      {/* Info grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Latitude</p>
          <p className="mt-0.5 font-mono text-sm font-medium text-gray-700 dark:text-gray-200">
            {Number(geofence.latitude).toFixed(6)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Longitude</p>
          <p className="mt-0.5 font-mono text-sm font-medium text-gray-700 dark:text-gray-200">
            {Number(geofence.longitude).toFixed(6)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">Radius</p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">
          {geofence.radius.toLocaleString("id-ID")} meter
          </p>
        </div>
      </div>

      {/* Mini map */}
      <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "220px", width: "100%" }}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer />
          <Marker position={center} icon={defaultPin} />
          <Circle
            center={center}
            radius={geofence.radius}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        </MapContainer>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Tutup
        </button>
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Edit
        </button>
      </div>
    </Modal>
  );
}

// ── Form Modal (Create / Edit) ────────────────────────────────
interface GeofenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGeofenceInput) => Promise<void>;
  initialData?: Geofence | null;
  loading?: boolean;
  errorMessage?: string | null;
}

function GeofenceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  errorMessage,
}: GeofenceFormModalProps) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<CreateGeofenceInput>({
    name: initialData?.name ?? "",
    latitude: Number(initialData?.latitude ?? 0),
    longitude: Number(initialData?.longitude ?? 0),
    radius: Number(initialData?.radius ?? 100),
  });

  // Sync when initialData changes (e.g. switching between edit targets)
  const [lastId, setLastId] = useState<string | undefined>(initialData?.id);
  if (initialData?.id !== lastId) {
    setLastId(initialData?.id);
    setForm({
      name: initialData?.name ?? "",
      latitude: Number(initialData?.latitude ?? 0),
      longitude: Number(initialData?.longitude ?? 0),
      radius: Number(initialData?.radius ?? 100),
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        {isEdit ? "Edit Geofence" : "Tambah Geofence"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Lokasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Kantor Pusat"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
          />
        </div>

        {/* Coordinate Picker */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Koordinat <span className="text-red-500">*</span>
          </label>
          <CoordPicker
            lat={form.latitude}
            lng={form.longitude}
            radius={form.radius}
            onCoordChange={(lat, lng) =>
              setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
            }
          />
          {/* Coordinate display */}
          <div className="mt-2 flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-400 dark:text-gray-500">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.latitude || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    latitude: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="-6.2088"
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 font-mono text-xs text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300 dark:focus:border-brand-500"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-400 dark:text-gray-500">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.longitude || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    longitude: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="106.8456"
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 font-mono text-xs text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300 dark:focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Radius */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Radius
            </label>
            <span className="text-sm font-semibold text-brand-500">
              {form.radius.toLocaleString("id-ID")} m
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={2000}
            step={10}
            value={form.radius}
            onChange={(e) =>
              setForm((f) => ({ ...f, radius: Number(e.target.value) }))
            }
            className="w-full accent-brand-500"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>50 m</span>
            <span>2.000 m</span>
          </div>
          <input
            type="number"
            min={1}
            value={form.radius}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                radius: Math.max(1, Number(e.target.value)),
              }))
            }
            className="mt-2 w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
          />
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || (form.latitude === 0 && form.longitude === 0)}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {loading
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Geofences() {
  const { geofences, loading, error, create, update, remove } = useGeofences();

  const [detailTarget, setDetailTarget] = useState<Geofence | null>(null);
  const [editTarget, setEditTarget] = useState<Geofence | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Geofence | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Active pin on main map (highlighted when hovering table row)
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const INDONESIA_CENTER: [number, number] = [-2.5, 118.0];

  const positions: [number, number][] = geofences.map((g) => [
    Number(g.latitude),
    Number(g.longitude),
  ]);

  const openCreate = () => {
    setEditTarget(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (g: Geofence) => {
    setDetailTarget(null);
    setEditTarget(g);
    setFormError(null);
    setFormOpen(true);
  };

  const openDelete = (g: Geofence) => {
    setDeleteTarget(g);
    setDeleteError(null);
  };

  const handleFormSubmit = async (data: CreateGeofenceInput) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        toast.success(`Geofence "${editTarget.name}" berhasil diperbarui.`);
      } else {
        await create(data);
        toast.success(`Geofence "${data.name}" berhasil ditambahkan.`);
      }
      setFormOpen(false);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Gagal menyimpan data.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await remove(deleteTarget.id);
      toast.success(`Geofence "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Gagal menghapus data.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Geofence>[] = [
    {
      header: "Nama Lokasi",
      accessor: "name",
    },
    {
      header: "Latitude",
      width: "w-32",
      render: (row) => (
        <span className="font-mono text-xs">{Number(row.latitude).toFixed(6)}</span>
      ),
    },
    {
      header: "Longitude",
      width: "w-32",
      render: (row) => (
        <span className="font-mono text-xs">{Number(row.longitude).toFixed(6)}</span>
      ),
    },
    {
      header: "Radius",
      width: "w-28",
      render: (row) => `${Number(row.radius).toLocaleString("id-ID")} m`,
    },
    {
      header: "Aksi",
      width: "w-44",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setDetailTarget(row)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Detail
          </button>
          <button
            onClick={() => openEdit(row)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
          >
            Edit
          </button>
          <button
            onClick={() => openDelete(row)}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Geofence"
        description="Manajemen titik lokasi geofence untuk absensi"
      />
      <PageBreadcrumb pageTitle="Geofence" />

      <div className="space-y-6">
        {/* ── Main Map ──────────────────────────────────────── */}
        <ComponentCard
          title="Peta Titik Lokasi"
          desc="Klik pada pin untuk mengedit lokasi"
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <MapContainer
              center={INDONESIA_CENTER}
              zoom={5}
              style={{ height: "420px", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {positions.length > 0 && <FitBounds positions={positions} />}
              {geofences.map((geo) => {
                const isActive = hoveredId === geo.id;
                return (
                  <span key={geo.id}>
                    <Marker
                      position={[Number(geo.latitude), Number(geo.longitude)]}
                      icon={isActive ? selectedPin : defaultPin}
                      eventHandlers={{
                        click: () => openEdit(geo),
                        mouseover: () => setHoveredId(geo.id),
                        mouseout: () => setHoveredId(null),
                      }}
                    />
                    <Circle
                      center={[Number(geo.latitude), Number(geo.longitude)]}
                      radius={Number(geo.radius)}
                      pathOptions={{
                        color: isActive ? "#ef4444" : "#3b82f6",
                        fillColor: isActive ? "#ef4444" : "#3b82f6",
                        fillOpacity: isActive ? 0.18 : 0.1,
                        weight: 2,
                      }}
                    />
                  </span>
                );
              })}
            </MapContainer>
          </div>

          {geofences.length === 0 && !loading && (
            <p className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500">
              Belum ada geofence terdaftar. Tambah geofence baru untuk melihat
              titik lokasi di peta.
            </p>
          )}
        </ComponentCard>

        {/* ── Data Table ────────────────────────────────────── */}
        <ComponentCard
          title="Data Geofence"
          desc={`${geofences.length} lokasi terdaftar`}
        >
          <div className="mb-4 flex justify-end">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Geofence
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={geofences}
              pageSize={10}
              searchKeys={["name"]}
            />
          )}
        </ComponentCard>
      </div>

      {/* Detail Modal */}
      <GeofenceDetailModal
        geofence={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={() => detailTarget && openEdit(detailTarget)}
      />

      {/* Form Modal */}
      <GeofenceFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={formLoading}
        errorMessage={formError}
      />

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        itemName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        loading={deleteLoading}
        errorMessage={deleteError}
      />
    </>
  );
}
