// * This file defines route module logic for src/pages/Karyawan/routes/pengajuan/index.tsx.

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useModal } from "../../../../hooks/useModal";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import type {
  CreateSubmissionInput,
  SubmissionRecord,
  SubmissionStatus,
} from "../../../../types/submissions.types";
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  HISTORY_PAGE_SIZE,
  INITIAL_FORM,
  MAX_ATTACHMENT_SIZE_BYTES,
} from "../../utils/pengajuan/constants";
import {
  toJakartaDateKey,
} from "../../utils/pengajuan/formatter";
import { HeaderSection } from "../jadwal";
import AttachmentPreviewModal, { AttachmentPreviewKind } from "./components/AttachmentPreviewModal";
import FormPengajuanSection from "./components/FormPengajuanSection";
import RiwayatPengajuanSection from "./components/RiwayatPengajuanSection";
import SelectDatePengajuanModal, {
  DateFieldKey,
} from "./components/SelectDatePengajuanModal";


// & This function defines getAttachmentPreviewKind behavior in the route flow.
// % Fungsi ini mendefinisikan perilaku getAttachmentPreviewKind dalam alur route.
function getAttachmentPreviewKind(
  mimeType?: string | null,
  fileName?: string | null,
  url?: string | null,
): AttachmentPreviewKind {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";

  const source = `${fileName ?? ""} ${url ?? ""}`.toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(source)) return "image";
  if (/\.pdf(\?|$)/.test(source)) return "pdf";

  return "other";
}

// & This function component/helper defines KaryawanPengajuanPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanPengajuanPage untuk file route ini.
const KaryawanPengajuanPage = () => {
  // & Process the main execution steps of KaryawanPengajuanPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanPengajuanPage di dalam body fungsi ini.
  const [form, setForm] = useState<CreateSubmissionInput>(INITIAL_FORM);
  const [dateDraft, setDateDraft] = useState<
    Pick<CreateSubmissionInput, "startDate" | "endDate">
  >({
    startDate: "",
    endDate: "",
  });
  const [activeDateField, setActiveDateField] =
    useState<DateFieldKey>("startDate");
  const [activeFilter, setActiveFilter] = useState<SubmissionStatus | "ALL">(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(
    null,
  );
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const [previewAttachment, setPreviewAttachment] =
    useState<SubmissionRecord | null>(null);
  const {
    isOpen: isCalendarOpen,
    openModal: openCalendar,
    closeModal: closeCalendar,
  } = useModal();

  const { submissions, meta, loading, error, fetchMine, createSubmission } =
    useSubmissions("mine");

  // & This effect refetches submission history whenever page or status filter changes.
  // % Effect ini memuat ulang riwayat pengajuan setiap halaman atau filter status berubah.
  useEffect(() => {
    // & Convert ALL filter into undefined so backend receives no status constraint.
    // % Ubah filter ALL menjadi undefined agar backend tidak menerima batasan status.
    const status = activeFilter === "ALL" ? undefined : activeFilter;
    fetchMine({
      page: currentPage,
      limit: HISTORY_PAGE_SIZE,
      status,
    }).catch(() => undefined);
  }, [activeFilter, currentPage, fetchMine]);

  // & This effect keeps currentPage inside valid total page bounds from API metadata.
  // % Effect ini menjaga currentPage tetap dalam batas total halaman valid dari metadata API.
  useEffect(() => {
    if (currentPage > Math.max(meta.totalPages, 1)) {
      setCurrentPage(Math.max(meta.totalPages, 1));
    }
  }, [currentPage, meta.totalPages]);

  // & This memo derives preview mode (image/pdf/other) from selected attachment metadata.
  // % Memo ini menurunkan mode pratinjau (image/pdf/lainnya) dari metadata lampiran terpilih.
  const attachmentPreviewKind = useMemo(
    () =>
      getAttachmentPreviewKind(
        previewAttachment?.attachmentMimeType,
        previewAttachment?.attachmentOriginalName,
        previewAttachment?.attachment,
      ),
    [previewAttachment],
  );

  // & This memo builds compact pagination numbers centered around current page.
  // % Memo ini membangun nomor pagination ringkas yang berpusat pada halaman aktif.
  const pageNumbers = useMemo(() => {
    const totalPages = Math.max(meta.totalPages, 1);
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisible - 1);

    start = Math.max(1, end - maxVisible + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, meta.totalPages]);

  // & This function component/helper defines openDateCalendar behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku openDateCalendar untuk file route ini.
  const openDateCalendar = (field: DateFieldKey) => {
    // & Process the main execution steps of openDateCalendar inside this function body.
    // % Memproses langkah eksekusi utama openDateCalendar di dalam body fungsi ini.
    setActiveDateField(field);
    setDateDraft({
      startDate: form.startDate,
      endDate: form.endDate,
    });
    openCalendar();
  };

  // & This function component/helper defines handleDateChange behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku handleDateChange untuk file route ini.
  const handleDateChange = (selectedDates: Date[]) => {
    // & Process the main execution steps of handleDateChange inside this function body.
    // % Memproses langkah eksekusi utama handleDateChange di dalam body fungsi ini.
    if (!selectedDates.length) return;

    const selectedDate = toJakartaDateKey(selectedDates[0]);
    setDateDraft((previous) => ({
      ...previous,
      [activeDateField]: selectedDate,
    }));
  };

  // & This function component/helper defines cancelDateSelection behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku cancelDateSelection untuk file route ini.
  const cancelDateSelection = () => {
    // & Process the main execution steps of cancelDateSelection inside this function body.
    // % Memproses langkah eksekusi utama cancelDateSelection di dalam body fungsi ini.
    setDateDraft({
      startDate: form.startDate,
      endDate: form.endDate,
    });
    closeCalendar();
  };

  // & This function component/helper defines applyDateSelection behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku applyDateSelection untuk file route ini.
  const applyDateSelection = () => {
    // & Process the main execution steps of applyDateSelection inside this function body.
    // % Memproses langkah eksekusi utama applyDateSelection di dalam body fungsi ini.
    setForm((previous) => ({
      ...previous,
      startDate: dateDraft.startDate,
      endDate: dateDraft.endDate,
    }));
    closeCalendar();
  };

  // & This function component/helper defines handleAttachmentChange behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku handleAttachmentChange untuk file route ini.
  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // & Process the main execution steps of handleAttachmentChange inside this function body.
    // % Memproses langkah eksekusi utama handleAttachmentChange di dalam body fungsi ini.
    const selected = event.target.files?.[0];
    if (!selected) {
      setSelectedAttachment(null);
      return;
    }

    if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(selected.type)) {
      toast.error("Lampiran hanya mendukung PDF, JPG, atau PNG.");
      event.target.value = "";
      setSelectedAttachment(null);
      setAttachmentInputKey((previous) => previous + 1);
      return;
    }

    if (selected.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error("Ukuran lampiran maksimal 10MB.");
      event.target.value = "";
      setSelectedAttachment(null);
      setAttachmentInputKey((previous) => previous + 1);
      return;
    }

    setSelectedAttachment(selected);
  };

  // & This function component/helper defines openAttachmentPreview behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku openAttachmentPreview untuk file route ini.
  const openAttachmentPreview = (item: SubmissionRecord) => {
    // & Process the main execution steps of openAttachmentPreview inside this function body.
    // % Memproses langkah eksekusi utama openAttachmentPreview di dalam body fungsi ini.
    if (!item.attachment) return;
    setPreviewAttachment(item);
  };

  // & This function component/helper defines closeAttachmentPreview behavior for this route file.
  // % Fungsi komponen/helper ini mendefinisikan perilaku closeAttachmentPreview untuk file route ini.
  const closeAttachmentPreview = () => {
    // & Process the main execution steps of closeAttachmentPreview inside this function body.
    // % Memproses langkah eksekusi utama closeAttachmentPreview di dalam body fungsi ini.
    setPreviewAttachment(null);
  };

  // & This async handler validates payload, submits request, and resets form state on success.
  // % Handler async ini memvalidasi payload, mengirim request, lalu mereset state form saat sukses.
  const handleSubmit = async (event: React.FormEvent) => {
    // & Stop native form submission so the React submit flow can control validation and API call.
    // % Hentikan submit bawaan browser agar alur React mengontrol validasi dan panggilan API.
    event.preventDefault();

    if (!form.startDate || !form.endDate) {
      toast.error("Tanggal mulai dan selesai wajib diisi.");
      return;
    }

    if (form.startDate > form.endDate) {
      toast.error("Tanggal mulai tidak boleh melebihi tanggal selesai.");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Alasan pengajuan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await createSubmission({
        ...form,
        reason: form.reason.trim(),
        attachmentFile: selectedAttachment ?? undefined,
      });
      toast.success("Pengajuan berhasil dikirim.");
      setForm(INITIAL_FORM);
      setDateDraft({ startDate: "", endDate: "" });
      setSelectedAttachment(null);
      setAttachmentInputKey((previous) => previous + 1);
    } catch {
      // handled globally by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 px-4 pb-28 pt-6">
      <HeaderSection
        title="Pengajuan"
        description="Buat pengajuan izin, dinas luar, lembur, atau ganti shift hari."
      />

      {error && (
        <div className="mt-4 rounded-xl border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700">
          {error}
        </div>
      )}

      {/* Form Pengajuan */}
      <FormPengajuanSection
        form={form}
        setForm={setForm}
        openDateCalendar={openDateCalendar}
        handleSubmit={handleSubmit}
        handleAttachmentChange={handleAttachmentChange}
        selectedAttachment={selectedAttachment}
        setSelectedAttachment={setSelectedAttachment}
        attachmentInputKey={attachmentInputKey}
        setAttachmentInputKey={setAttachmentInputKey}
        submitting={submitting}
      />

      {/* Section Riwayat Pengajuan  */}
      <RiwayatPengajuanSection
        submissions={submissions}
        meta={meta}
        loading={loading}
        // error={error}

        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageNumbers={pageNumbers}
        openAttachmentPreview={openAttachmentPreview}
      />

      {/* Date Selection Modal */}
      <SelectDatePengajuanModal
        isCalendarOpen={isCalendarOpen}
        activeDateField={activeDateField}
        handleDateChange={handleDateChange}
        cancelDateSelection={cancelDateSelection}
        applyDateSelection={applyDateSelection}
        dateDraft={dateDraft}
      />

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        previewAttachment={previewAttachment}
        attachmentPreviewKind={attachmentPreviewKind}
        closeAttachmentPreview={closeAttachmentPreview}
      />

    </div>
  );
};

export default KaryawanPengajuanPage;
