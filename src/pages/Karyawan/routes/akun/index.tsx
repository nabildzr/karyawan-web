// * This file defines route module logic for src/pages/Karyawan/routes/akun/index.tsx.

import { getAkunPageDescription, getAkunProfileHint } from "../../utils/akun/content";
import AkunHeader from "./components/AkunHeader";
import AkunNotificationSettings from "./components/AkunNotificationSettings";
import AkunProfileCard from "./components/AkunProfileCard";

// & This function component/helper defines KaryawanAkunPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanAkunPage untuk file route ini.
const KaryawanAkunPage = () => {
  // & Process the main execution steps of KaryawanAkunPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanAkunPage di dalam body fungsi ini.
  return (
    <div className="min-h-full bg-gray-50 px-4 pb-28 pt-6">
      <AkunHeader title="Akun" description={getAkunPageDescription()} />
      <AkunProfileCard title="Profil karyawan" hint={getAkunProfileHint()} />
      <AkunNotificationSettings />
    </div>
  );
};

export default KaryawanAkunPage;
