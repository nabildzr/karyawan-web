// * This file defines route module logic for src/pages/Karyawan/routes/pengajuan/components/AttachmentPreviewModal.tsx.

import { formatDate } from "@fullcalendar/core/index.js";
import { Modal } from "../../../../../components/ui/modal";
import {  SubmissionRecord } from "../../../../../types/submissions.types";
import { formatType, formatFileSize } from "../../../utils/pengajuan/formatter";

export type AttachmentPreviewKind = "image" | "pdf" | "other";

type AttachmentPreviewModalProps = {
  previewAttachment: SubmissionRecord | null;
  attachmentPreviewKind: AttachmentPreviewKind;
  closeAttachmentPreview: () => void;
}

// & This function component/helper defines AttachmentPreviewModal behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku AttachmentPreviewModal untuk file route ini.
const AttachmentPreviewModal = ({
  previewAttachment,
  attachmentPreviewKind,
  closeAttachmentPreview,
}: AttachmentPreviewModalProps  ) => {
  // & Process the main execution steps of AttachmentPreviewModal inside this function body.
  // % Memproses langkah eksekusi utama AttachmentPreviewModal di dalam body fungsi ini.
  return (
   <Modal
          isOpen={!!previewAttachment}
          onClose={closeAttachmentPreview}
          className="mx-4 max-w-5xl p-5"
        >
          {previewAttachment && (
            <>
              <h3 className="text-sm font-semibold text-gray-800">
                Detail Lampiran
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {formatType(previewAttachment.type)} •{" "}
                {formatDate(previewAttachment.startDate)} -{" "}
                {formatDate(previewAttachment.endDate)}
              </p>
  
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {attachmentPreviewKind === "image" &&
                  previewAttachment.attachment && (
                    <img
                      src={previewAttachment.attachment}
                      alt={
                        previewAttachment.attachmentOriginalName ||
                        "Preview Lampiran"
                      }
                      className="h-[65vh] w-full object-contain"
                    />
                  )}
  
                {attachmentPreviewKind === "pdf" &&
                  previewAttachment.attachment && (
                    <iframe
                      src={previewAttachment.attachment}
                      title={
                        previewAttachment.attachmentOriginalName || "Preview PDF"
                      }
                      className="h-[65vh] w-full"
                    />
                  )}
  
                {attachmentPreviewKind === "other" && (
                  <div className="flex h-[30vh] items-center justify-center px-4 text-center text-sm text-gray-500">
                    Preview tidak tersedia untuk format file ini.
                  </div>
                )}
              </div>
  
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {previewAttachment.attachmentOriginalName || "Lampiran"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {previewAttachment.attachmentMimeType ||
                      "Tipe tidak diketahui"}
                    {previewAttachment.attachmentSizeBytes
                      ? ` • ${formatFileSize(previewAttachment.attachmentSizeBytes)}`
                      : ""}
                  </p>
                </div>
  
                {previewAttachment.attachment && (
                  <a
                    href={previewAttachment.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    Buka di tab baru
                  </a>
                )}
              </div>
            </>
          )}
        </Modal>
  )
}

export default AttachmentPreviewModal
