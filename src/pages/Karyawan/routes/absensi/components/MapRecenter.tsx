// * This file defines route module logic for src/pages/Karyawan/routes/absensi/components/MapRecenter.tsx.

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapRecenterProps {
  center: [number, number];
  trigger: number;
}

// * komponen ini digunakan untuk memicu map untuk recenter ke koordinat tertentu saat trigger berubah,
// * biasanya digunakan setelah mendapatkan koordinat terbaru dari user

// & This function component/helper defines MapRecenter behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku MapRecenter untuk file route ini.
const MapRecenter = ({ center, trigger }: MapRecenterProps) => {
  // & Process the main execution steps of MapRecenter inside this function body.
  // % Memproses langkah eksekusi utama MapRecenter di dalam body fungsi ini.
  const map = useMap();

  useEffect(() => {
    // & to prevent flyTo being called on initial render
    // % untuk memastikan flyTo hanya dipanggil saat trigger berubah, bukan saat komponen pertama kali dirender
    map.flyTo(center, 16, { duration: 0.8 });
  }, [center, map, trigger]);

  return null;
};

export default MapRecenter;
