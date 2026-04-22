


// & This function defines getAttachmentPreviewKind behavior in the route flow.

import { AttachmentPreviewKind } from "../../routes/pengajuan/components/AttachmentPreviewModal";

// % Fungsi ini mendefinisikan perilaku getAttachmentPreviewKind dalam alur route.
export function getAttachmentPreviewKind(
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