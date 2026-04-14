// * This file defines route module logic for src/pages/Karyawan/routes/review/components/SelectReviewYear.tsx.


type SelectReviewYearProps = {
  selectedYear: number;
  handleYearChange: (year: string) => void;
  yearOptions: number[];
}

// & This function component/helper defines SelectReviewYear behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku SelectReviewYear untuk file route ini.
const SelectReviewYear = ({ selectedYear, handleYearChange, yearOptions }: SelectReviewYearProps) => {
  // & Process the main execution steps of SelectReviewYear inside this function body.
  // % Memproses langkah eksekusi utama SelectReviewYear di dalam body fungsi ini.
  return (
    <label className="block text-xs font-semibold text-gray-600">
      Tahun
      <select
        value={selectedYear}
        onChange={(event) => handleYearChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400"
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectReviewYear;
