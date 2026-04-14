// * This file defines route module logic for src/pages/Karyawan/routes/absensi/components/NearestOfficeSection.tsx.

import type { GeofenceWithDistance } from "../types/AbsensiTypes";

interface NearestOfficeSectionProps {
  nearestOffices: GeofenceWithDistance[];
}

// & This function component/helper defines NearestOfficeSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku NearestOfficeSection untuk file route ini.
const NearestOfficeSection = ({ nearestOffices }: NearestOfficeSectionProps) => {
  // & Process the main execution steps of NearestOfficeSection inside this function body.
  // % Memproses langkah eksekusi utama NearestOfficeSection di dalam body fungsi ini.
  return (
    <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Lokasi Kantor Terdekat</h2>
        <span className="text-xs text-gray-500">Berdasarkan lokasi Anda</span>
      </div>

      {nearestOffices.length === 0 ? (
        <p className="text-xs text-gray-500">Belum ada data kantor dari API geofence.</p>
      ) : (
        <div className="space-y-2">
          {nearestOffices.slice(0, 3).map((office, index) => (
            <article
              key={office.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  {index + 1}. {office.name}
                </p>
                <p className="text-[11px] text-gray-500">Radius {Math.round(office.radius)} m</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">{office.distanceLabel}</p>
                <p
                  className={`text-[11px] font-medium ${
                    office.isInside ? "text-success-700" : "text-gray-500"
                  }`}
                >
                  {office.isInside ? "Dalam Area" : "Di Luar Area"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default NearestOfficeSection;
