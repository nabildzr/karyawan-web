// * This file defines route module logic for src/pages/Karyawan/routes/review/components/SelectReviewMonth.tsx.

import { MonthOption } from "../../../utils/review/period";


type SelectReviewMonthProps = {
  selectedMonth: MonthOption["value"];
  handleMonthChange: (value: string) => void;
  monthOptions: MonthOption[];
};

// & This function component/helper defines SelectReviewMonth behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku SelectReviewMonth untuk file route ini.
const SelectReviewMonth = ({ selectedMonth, handleMonthChange, monthOptions }: SelectReviewMonthProps) => {
  // & Process the main execution steps of SelectReviewMonth inside this function body.
  // % Memproses langkah eksekusi utama SelectReviewMonth di dalam body fungsi ini.
  return (
    <label className="block text-xs font-semibold text-gray-600">
      Bulan
      <select
        value={selectedMonth}
        onChange={(event) => handleMonthChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400"
      >
        {monthOptions.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectReviewMonth;
