// * This file defines route module logic for src/pages/Karyawan/routes/pengajuan/components/FormPengajuanSection.tsx.

import { CalenderIcon } from "../../../../../icons";
import { CreateSubmissionInput, SubmissionType } from "../../../../../types/submissions.types";
import { SUBMISSION_OPTIONS } from "../../../utils/pengajuan/constants";
import { formatDateField, formatFileSize } from "../../../utils/pengajuan/formatter";


type FormPengajuanSectionProps = {
  form: CreateSubmissionInput;
  setForm: React.Dispatch<React.SetStateAction<CreateSubmissionInput>>;
  openDateCalendar: (field: "startDate" | "endDate") => void;
  handleSubmit: (event: React.FormEvent) => void;
  handleAttachmentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedAttachment: File | null;
  setSelectedAttachment: React.Dispatch<React.SetStateAction<File | null>>;
  attachmentInputKey: number;
  setAttachmentInputKey: React.Dispatch<React.SetStateAction<number>>;
  submitting?: boolean;
};


// & This function component/helper defines FormPengajuanSection behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku FormPengajuanSection untuk file route ini.
export const FormPengajuanSection = ({ form, setForm, openDateCalendar, handleSubmit, handleAttachmentChange, selectedAttachment, setSelectedAttachment, attachmentInputKey, setAttachmentInputKey, submitting }: FormPengajuanSectionProps) => {
  // & Process the main execution steps of FormPengajuanSection inside this function body.
  // % Memproses langkah eksekusi utama FormPengajuanSection di dalam body fungsi ini.
  return (
     <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
        <h2 className="text-sm font-semibold text-gray-800">
          Form Pengajuan Baru
        </h2>
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Jenis Pengajuan
            </label>
            <select
              value={form.type}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  type: event.target.value as SubmissionType,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400"
            >
              {SUBMISSION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Rentang Tanggal
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openDateCalendar("startDate")}
                className="rounded-xl border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 outline-none transition hover:border-brand-400"
              >
                <span className="mb-1 block text-[11px] font-medium text-gray-500">
                  Tanggal Mulai
                </span>
                <span className="flex items-center justify-between">
                  <span
                    className={
                      form.startDate ? "text-gray-700" : "text-gray-400"
                    }
                  >
                    {formatDateField(form.startDate)}
                  </span>
                  <CalenderIcon className="size-4 text-gray-400" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => openDateCalendar("endDate")}
                className="rounded-xl border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 outline-none transition hover:border-brand-400"
              >
                <span className="mb-1 block text-[11px] font-medium text-gray-500">
                  Tanggal Selesai
                </span>
                <span className="flex items-center justify-between">
                  <span
                    className={form.endDate ? "text-gray-700" : "text-gray-400"}
                  >
                    {formatDateField(form.endDate)}
                  </span>
                  <CalenderIcon className="size-4 text-gray-400" />
                </span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Tanggal dipilih lewat modal kalender.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Alasan
            </label>
            <textarea
              value={form.reason}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  reason: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400"
              placeholder="Jelaskan alasan pengajuan Anda"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Lampiran (opsional)
            </label>
            <input
              key={attachmentInputKey}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleAttachmentChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Format: PDF/JPG/PNG, maksimal 10MB.
            </p>

            {selectedAttachment && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-brand-700">
                    {selectedAttachment.name}
                  </p>
                  <p className="text-[11px] text-brand-600">
                    {formatFileSize(selectedAttachment.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAttachment(null);
                    setAttachmentInputKey((previous) => previous + 1);
                  }}
                  className="rounded-md border border-brand-200 px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </form>
      </section>
  )
}

export default FormPengajuanSection
