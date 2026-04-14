// * This file handles print-to-PDF workflow for employee review result documents.
import { toast } from "sonner";
import { MyResultsCurrentReview } from "../../../../types/assessments.types";
import { buildPrintHtml } from "../../routes/review/components/BuildPrintHTML";
import { ReviewCategoryView } from "../../routes/review/types/ReviewCategoryViewType";

interface HandleDownloadPdfParams {
  review: MyResultsCurrentReview | null;
  categories: ReviewCategoryView[];
  evaluatorName: string;
  evaluatorPosition: string;
  completedLabel: string;
  periodLabel: string;
  safeAverageScore: number;
  predikat: string;
  feedback: string;
}

export const handleDownloadPdf = ({
  review,
  categories,
  evaluatorName,
  evaluatorPosition,
  completedLabel,
  periodLabel,
  safeAverageScore,
  predikat,
  feedback
}: HandleDownloadPdfParams) => {
    // & Stop process if there is no review payload to print.
    // % Menghentikan proses jika tidak ada payload review yang bisa dicetak.
    if (!review) return;

    // & Build printable HTML string from review and metadata.
    // % Membangun string HTML siap cetak dari data review dan metadata.
    const html = buildPrintHtml({
      review,
      categories,
      evaluatorName,
      evaluatorPosition,
      completedLabel,
      periodLabel,
      averageScore: safeAverageScore,
      predikat,
      feedback,
    });

    // & Create hidden iframe as isolated print context.
    // % Membuat iframe tersembunyi sebagai konteks cetak terisolasi.
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";

    // & Attach iframe to DOM so browser can render and print its document.
    // % Menempelkan iframe ke DOM agar browser bisa merender dan mencetak dokumennya.
    document.body.appendChild(frame);

    // & Cache iframe window/document references for guarded operations.
    // % Menyimpan referensi window/document iframe untuk operasi yang terjaga.
    const frameWindow = frame.contentWindow;
    const frameDocument = frameWindow?.document;

    // & Fail fast when iframe context is unavailable.
    // % Gagal cepat saat konteks iframe tidak tersedia.
    if (!frameWindow || !frameDocument) {
      frame.remove();
      toast.error("Gagal menyiapkan dokumen cetak.");
      return;
    }

    // & Track print and cleanup state to avoid duplicate side effects.
    // % Melacak state print dan cleanup untuk menghindari efek samping ganda.
    let hasPrinted = false;
    let isCleaned = false;

    const cleanup = () => {
      // & Ensure cleanup runs only once.
      // % Memastikan cleanup hanya berjalan sekali.
      if (isCleaned) return;
      isCleaned = true;

      // & Clear fallback timer and remove iframe from DOM.
      // % Menghapus fallback timer dan melepas iframe dari DOM.
      window.clearTimeout(fallbackTimer);
      frame.remove();
    };

    const triggerPrint = () => {
      // & Guard print trigger so browser dialog opens only once.
      // % Menjaga trigger print agar dialog browser hanya terbuka sekali.
      if (hasPrinted) return;
      hasPrinted = true;

      try {
        // & Focus frame and invoke native print dialog.
        // % Fokus ke frame lalu memanggil dialog print bawaan browser.
        frameWindow.focus();
        frameWindow.print();
      } catch {
        // & Notify user and clean resources when print invocation fails.
        // % Memberi tahu pengguna dan membersihkan resource saat pemanggilan print gagal.
        toast.error("Gagal membuka dialog cetak. Coba lagi.");
        cleanup();
      }
    };

    // & Trigger print once iframe reports content loaded.
    // % Menjalankan print saat iframe melaporkan konten selesai dimuat.
    frame.onload = () => {
      triggerPrint();
    };

    // & Cleanup after browser print flow completes.
    // % Membersihkan resource setelah alur print browser selesai.
    frameWindow.onafterprint = () => {
      cleanup();
    };

    // & Provide fallback trigger if onload does not fire as expected.
    // % Menyediakan trigger fallback jika onload tidak terpanggil sesuai harapan.
    const fallbackTimer = window.setTimeout(() => {
      triggerPrint();
    }, 250);

    // & Write generated HTML into iframe document and finalize it.
    // % Menulis HTML hasil generate ke dokumen iframe lalu menutup dokumen.
    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
  };