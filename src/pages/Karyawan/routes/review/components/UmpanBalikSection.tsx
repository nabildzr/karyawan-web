// * This file defines route module logic for src/pages/Karyawan/routes/review/components/UmpanBalikSection.tsx.



// & This function component/helper defines UmpanBalikSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku UmpanBalikSection untuk file route ini.
const UmpanBalikSection = ({ feedback }: { feedback: string }) => {
  // & Process the main execution steps of UmpanBalikSection inside this function body.
  // % Memproses langkah eksekusi utama UmpanBalikSection di dalam body fungsi ini.
  return (
    <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
      <h2 className="text-sm font-semibold text-gray-800">Umpan Balik</h2>
      <p className="mt-2 text-sm leading-6 text-gray-700">
        {feedback || "Belum ada umpan balik tertulis dari evaluator."}
      </p>
    </section>
  );
};

export default UmpanBalikSection;
