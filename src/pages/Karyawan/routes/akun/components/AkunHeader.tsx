// * This file defines route module logic for src/pages/Karyawan/routes/akun/components/AkunHeader.tsx.

interface AkunHeaderProps {
  title: string;
  description: string;
}

// & This function component/helper defines AkunHeader behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AkunHeader untuk file route ini.
const AkunHeader = ({ title, description }: AkunHeaderProps) => {
  // & Process the main execution steps of AkunHeader inside this function body.
  // % Memproses langkah eksekusi utama AkunHeader di dalam body fungsi ini.
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </>
  );
};

export default AkunHeader;
