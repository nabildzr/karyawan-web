// * This file defines route module logic for src/pages/Karyawan/routes/pengajuan/components/SelectDatePengajuanModal.tsx.

import DatePicker from "../../../../../components/form/date-picker";
import { Modal } from "../../../../../components/ui/modal";
import { CreateSubmissionInput } from "../../../../../types/submissions.types";

export type DateFieldKey = "startDate" | "endDate";

type SelectDatePengajuanModalProps = {
  isCalendarOpen: boolean;
  activeDateField: DateFieldKey;
  handleDateChange: (selectedDates: Date[]) => void;
  cancelDateSelection: () => void;
  applyDateSelection: () => void;
  dateDraft: Pick<CreateSubmissionInput, "startDate" | "endDate">
}

// & This function component/helper defines SelectDatePengajuanModal behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku SelectDatePengajuanModal untuk file route ini.
const SelectDatePengajuanModal = ({
  isCalendarOpen,
  activeDateField,
  handleDateChange,
  cancelDateSelection,
  applyDateSelection,
  dateDraft
}: SelectDatePengajuanModalProps) => {
  // & Process the main execution steps of SelectDatePengajuanModal inside this function body.
  // % Memproses langkah eksekusi utama SelectDatePengajuanModal di dalam body fungsi ini.
  return (
    <Modal
          isOpen={isCalendarOpen}
          onClose={cancelDateSelection}
          className="mx-4 max-w-md p-5"
        >
          <h3 className="text-sm font-semibold text-gray-800">
            {activeDateField === "startDate"
              ? "Pilih Tanggal Mulai"
              : "Pilih Tanggal Selesai"}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Pemilihan tanggal terpisah per kolom agar tidak saling mengubah.
          </p>
  
          <div className="mt-3">
            <DatePicker
              id="submission-date-single-picker"
              mode="single"
              placeholder={
                activeDateField === "startDate"
                  ? "Pilih tanggal mulai"
                  : "Pilih tanggal selesai"
              }
              defaultDate={dateDraft[activeDateField] || undefined}
              onChange={handleDateChange}
            />
          </div>
  
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={cancelDateSelection}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={applyDateSelection}
              className="flex-1 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Pilih
            </button>
          </div>
        </Modal>
  )
}

export default SelectDatePengajuanModal
