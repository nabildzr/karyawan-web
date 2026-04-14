// * This file defines route module logic for src/pages/Karyawan/routes/akun/components/AkunProfileCard.tsx.

interface AkunProfileCardProps {
  title: string;
  hint: string;
}

// & This function component/helper defines AkunProfileCard behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AkunProfileCard untuk file route ini.
const AkunProfileCard = ({ title, hint }: AkunProfileCardProps) => {
  // & Process the main execution steps of AkunProfileCard inside this function body.
  // % Memproses langkah eksekusi utama AkunProfileCard di dalam body fungsi ini.
  return (
    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
};

export default AkunProfileCard;
