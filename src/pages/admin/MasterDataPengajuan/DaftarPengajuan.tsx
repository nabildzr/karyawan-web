// * Frontend module: karyawan-web/src/pages/admin/MasterDataPengajuan/DaftarPengajuan.tsx
// & This file defines frontend UI or logic for DaftarPengajuan.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk DaftarPengajuan.tsx.

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import { useAuthContext } from "../../../context/AuthContext";
import { useSubmissions } from "../../../hooks/useSubmissions";
import type {
  SubmissionRecord,
  SubmissionStatus,
  SubmissionType,
} from "../../../types/submissions.types";

const STATUS_FILTERS: Array<{ value: SubmissionStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const DELETE_REJECTED_WINDOW_MS = 48 * 60 * 60 * 1000;

function getDeleteEligibility(item: SubmissionRecord) {
  if (item.status !== "REJECTED") {
    return {
      canDelete: false,
      reason: "Hanya pengajuan status REJECTED yang bisa dihapus.",
    };
  }

  const rejectedAtMs = new Date(item.updatedAt).getTime();
  if (Number.isNaN(rejectedAtMs)) {
    return {
      canDelete: false,
      reason: "Waktu penolakan tidak valid.",
    };
  }

  const elapsedMs = Date.now() - rejectedAtMs;
  if (elapsedMs > DELETE_REJECTED_WINDOW_MS) {
    return {
      canDelete: false,
      reason: "Batas hapus 48 jam setelah penolakan sudah lewat.",
    };
  }

  return {
    canDelete: true,
    reason: null,
  };
}

function formatType(type: SubmissionType) {
  if (type === "IZIN_SAKIT") return "Izin Sakit";
  if (type === "IZIN_KHUSUS") return "Izin Khusus";
  if (type === "DINAS_LUAR") return "Dinas Luar";
  return type;
}

function statusClass(status: SubmissionStatus) {
  if (status === "APPROVED") return "bg-success-50 text-success-700";
  if (status === "REJECTED") return "bg-error-50 text-error-700";
  return "bg-warning-50 text-warning-700";
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const end = new Date(endDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${start} - ${end}`;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export default function DaftarPengajuanPage() {
  const { user, hasPermission, hasRoutePermission } = useAuthContext();
  const currentUserId = user?.id ?? "";

  const canReadSubmissions = hasRoutePermission("/admin/daftar-pengajuan", "READ");
  const canApproveSubmissions = hasPermission("submissions", "APPROVE");
  const canDeleteSubmissions = hasPermission("submissions", "DELETE");

  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<SubmissionRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const {
    submissions,
    meta,
    loading,
    error,
    fetchAdmin,
    updateSubmissionStatus,
    deleteSubmission,
  } = useSubmissions("admin");

  useEffect(() => {
    if (!canReadSubmissions) {
      return;
    }

    fetchAdmin({
      page: 1,
      limit: 50,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: search.trim() || undefined,
    }).catch(() => undefined);
  }, [canReadSubmissions, fetchAdmin, search, statusFilter]);

  const counts = useMemo(() => {
    const pending = submissions.filter((item) => item.status === "PENDING").length;
    const approved = submissions.filter((item) => item.status === "APPROVED").length;
    const rejected = submissions.filter((item) => item.status === "REJECTED").length;

    return {
      pending,
      approved,
      rejected,
    };
  }, [submissions]);

  const approve = async (item: SubmissionRecord) => {
    if (!canApproveSubmissions) {
      toast.error("Anda tidak memiliki izin APPROVE untuk pengajuan.");
      return;
    }

    setActionLoading(true);
    try {
      await updateSubmissionStatus(item.id, { status: "APPROVED" });
      toast.success("Pengajuan berhasil di-approve.");
    } catch {
      // handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!rejectTarget) return;
    if (!canApproveSubmissions) {
      toast.error("Anda tidak memiliki izin APPROVE untuk pengajuan.");
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }

    setActionLoading(true);
    try {
      await updateSubmissionStatus(rejectTarget.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Pengajuan berhasil ditolak.");
      setRejectTarget(null);
      setRejectionReason("");
    } catch {
      // handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const removeSubmission = async (item: SubmissionRecord) => {
    if (!canDeleteSubmissions) {
      toast.error("Anda tidak memiliki izin DELETE untuk pengajuan.");
      return;
    }

    if (item.userId === currentUserId) {
      toast.error("Anda tidak dapat menghapus pengajuan milik sendiri.");
      return;
    }

    const eligibility = getDeleteEligibility(item);
    if (!eligibility.canDelete) {
      toast.error(eligibility.reason ?? "Pengajuan tidak dapat dihapus.");
      return;
    }

    const confirmed = window.confirm(
      "Hapus pengajuan ini? Lampiran di Cloudinary juga akan dihapus.",
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteSubmission(item.id);
      toast.success("Pengajuan berhasil dihapus.");
    } catch {
      // handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Daftar Pengajuan | Admin"
        description="Manajemen approval pengajuan karyawan"
      />
      <PageBreadcrumb pageTitle="Daftar Pengajuan" />

      {!canReadSubmissions && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          Role Anda tidak memiliki izin READ untuk melihat daftar pengajuan.
        </div>
      )}

      {canReadSubmissions && (

      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-2 text-sm text-error-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">{counts.pending}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Approved</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{counts.approved}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-error-700">{counts.rejected}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? "bg-brand-100 text-brand-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, NIP, atau alasan"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400 lg:max-w-xs"
            />
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Memuat data pengajuan...</p>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data pengajuan.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((item) => {
                const isOwnSubmission = item.userId === currentUserId;
                const disableAction =
                  item.status !== "PENDING" ||
                  actionLoading ||
                  isOwnSubmission ||
                  !canApproveSubmissions;
                const deleteEligibility = getDeleteEligibility(item);
                const disableDelete =
                  actionLoading ||
                  !deleteEligibility.canDelete ||
                  !canDeleteSubmissions ||
                  isOwnSubmission;

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.user?.employees?.fullName ?? item.user?.nip ?? "Karyawan"}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.user?.nip ? `NIP: ${item.user.nip} • ` : ""}
                          {formatType(item.type)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDateRange(item.startDate, item.endDate)}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-gray-600">{item.reason}</p>

                        {item.attachment && (
                          <div className="mt-1 text-xs">
                            <a
                              href={item.attachment}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-brand-600 underline"
                            >
                              {item.attachmentOriginalName || "Lihat lampiran"}
                            </a>
                            {item.attachmentSizeBytes ? (
                              <span className="ml-1 text-gray-500">
                                ({formatFileSize(item.attachmentSizeBytes)})
                              </span>
                            ) : null}
                          </div>
                        )}

                        {item.rejectionReason && (
                          <p className="mt-1 text-xs font-medium text-error-600">
                            Alasan ditolak: {item.rejectionReason}
                          </p>
                        )}

                        {isOwnSubmission && (
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            Pengajuan milik Anda sendiri. Aksi approve/reject/hapus dinonaktifkan.
                          </p>
                        )}

                        {!canApproveSubmissions && (
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            Approve/Reject dinonaktifkan: role Anda tidak memiliki izin APPROVE.
                          </p>
                        )}

                        {!canDeleteSubmissions && (
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            Hapus dinonaktifkan: role Anda tidak memiliki izin DELETE.
                          </p>
                        )}

                        {!deleteEligibility.canDelete && (
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            Hapus dinonaktifkan: {deleteEligibility.reason}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={disableDelete}
                          onClick={() => removeSubmission(item)}
                          title={
                            !canDeleteSubmissions
                              ? "Role Anda tidak memiliki izin DELETE"
                              : isOwnSubmission
                              ? "Anda tidak dapat menghapus pengajuan milik sendiri"
                              : deleteEligibility.canDelete
                              ? "Hapus pengajuan"
                              : (deleteEligibility.reason ??
                                "Pengajuan tidak dapat dihapus")
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Hapus
                        </button>
                        <button
                          type="button"
                          disabled={disableAction}
                          onClick={() => approve(item)}
                          className="rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={disableAction}
                          onClick={() => {
                            setRejectTarget(item);
                            setRejectionReason("");
                          }}
                          className="rounded-lg bg-error-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Menampilkan {submissions.length} data dari total {meta.total} pengajuan.
          </p>
        </section>
      </div>
      )}

      <Modal
        isOpen={!!rejectTarget}
        onClose={() => {
          if (!actionLoading) {
            setRejectTarget(null);
            setRejectionReason("");
          }
        }}
        className="max-w-md p-6"
      >
        <h3 className="text-base font-semibold text-gray-800">Tolak Pengajuan</h3>
        <p className="mt-1 text-sm text-gray-500">
          Isi alasan penolakan untuk pengajuan {rejectTarget ? formatType(rejectTarget.type) : ""}.
        </p>

        <textarea
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          rows={4}
          className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400"
          placeholder="Contoh: Dokumen lampiran belum lengkap"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setRejectTarget(null);
              setRejectionReason("");
            }}
            disabled={actionLoading}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={reject}
            disabled={actionLoading}
            className="flex-1 rounded-xl bg-error-600 px-3 py-2 text-sm font-semibold text-white hover:bg-error-700 disabled:opacity-60"
          >
            {actionLoading ? "Memproses..." : "Tolak Pengajuan"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
