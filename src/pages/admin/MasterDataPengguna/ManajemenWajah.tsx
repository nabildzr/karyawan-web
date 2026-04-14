import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import type { PaginationMeta } from "../../../components/tables/DataTables/DataTableOnline";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useAuthContext } from "../../../context/AuthContext";
import { useFaces } from "../../../hooks/useFaces";
import { facesService } from "../../../services/faces.service";
import { karyawanService } from "../../../services/karyawan.service";
import type { FaceRecord } from "../../../types/faces.types";
import type { Employee } from "../../../types/karyawan.types";

// ── Helpers ───────────────────────────────────────────────────
function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Upload Zone ───────────────────────────────────────────────
interface UploadZoneProps {
  file: File | null;
  preview: string | null;
  onChange: (file: File) => void;
  disabled?: boolean;
}

function UploadZone({ file, preview, onChange, disabled = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Hanya file JPEG/PNG yang diperbolehkan.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5 MB.");
      return;
    }
    onChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
        dragOver
          ? "border-brand-400 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10"
          : preview
            ? "border-gray-200 dark:border-gray-700"
            : "border-gray-200 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-500/50 dark:hover:bg-white/[0.02]"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        disabled={disabled}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="Face preview"
            className="h-full w-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-white">Ganti Foto</p>
          </div>
          {/* File name badge */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1.5">
            <p className="truncate text-xs text-white">{file?.name}</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
            <svg className="h-7 w-7 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Capture or Upload New Face Image
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Click to open camera or drag &amp; drop
            </p>
            <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
              JPEG / PNG · Max 5 MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Photo instructions ────────────────────────────────────────
function PhotoInstructions() {
  const tips = [
    "Pastikan wajah berada di tengah dan terlihat penuh di dalam frame",
    "Pandang langsung ke kamera dengan ekspresi netral",
    "Hindari topi, kacamata hitam, atau penutup wajah apapun",
    "Gunakan area yang terang dengan latar belakang polos",
  ];
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
      <div className="mb-2 flex items-center gap-2">
        <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Instructions for a clear photo</p>
      </div>
      <ul className="space-y-1.5">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-600 dark:text-gray-400">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Update/Edit Face Modal ────────────────────────────────────
interface UpdateFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: FaceRecord | null;
  onSave: (userId: string, file: File) => Promise<void>;
  loading?: boolean;
}

function UpdateFaceModal({ isOpen, onClose, target, onSave, loading = false }: UpdateFaceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreview(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleFileChange = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSave = async () => {
    if (!file || !target) return;
    setErrorMsg(null);
    try {
      await onSave(target.userId, file);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memperbarui data biometrik.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Update Biometric Face Data
        </h3>
        {target && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Employee:{" "}
            <span className="font-medium text-brand-600 dark:text-brand-400">
              {target.user?.employees?.fullName ?? target.user?.nip ?? "—"}
            </span>
          </p>
        )}
      </div>

      {/* Upload zone */}
      <div className="mb-4">
        <UploadZone file={file} preview={preview} onChange={handleFileChange} disabled={loading} />
      </div>

      {/* Instructions */}
      <div className="mb-5">
        <PhotoInstructions />
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !file}
          className="ml-auto rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Memperbarui...
            </span>
          ) : (
            "Update Biometric"
          )}
        </button>
      </div>
    </Modal>
  );
}

// ── Register New Face Modal (select employee → upload) ────────
const EMP_META_DEFAULT: PaginationMeta = { total: 0, page: 1, limit: 5, totalPages: 1 };

interface RegisterNewFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function RegisterNewFaceModal({ isOpen, onClose, onSaved }: RegisterNewFaceModalProps) {
  const [step, setStep] = useState<"select" | "upload">("select");

  // Step 1 — employee selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empMeta, setEmpMeta] = useState<PaginationMeta>(EMP_META_DEFAULT);
  const [empLoading, setEmpLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Step 2 — upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchEmployees = useCallback(
    async (params: { page: number; limit: number; search: string }) => {
      setEmpLoading(true);
      try {
        const res = await karyawanService.getAll(params);
        setEmployees(res.data);
        setEmpMeta(res.meta);
      } catch {
        // toasted by interceptor
      } finally {
        setEmpLoading(false);
      }
    },
    [],
  );

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setSelectedEmp(null);
      setFile(null);
      setPreview(null);
      setErrorMsg(null);
      fetchEmployees({ page: 1, limit: 5, search: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSelectEmp = (emp: Employee) => {
    setSelectedEmp(emp);
    setStep("upload");
    setFile(null);
    setPreview(null);
    setErrorMsg(null);
  };

  const handleFileChange = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleRegister = async () => {
    if (!file || !selectedEmp) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      // Use /faces/admin/:userId (PUT) for admin registering face on behalf of employee
      await facesService.register(selectedEmp.user.id, file);
      toast.success(`Wajah karyawan "${selectedEmp.fullName}" berhasil didaftarkan.`);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal mendaftarkan wajah. Pastikan karyawan belum memiliki wajah terdaftar.",
      );
    } finally {
      setUploading(false);
    }
  };

  const empColumns: Column<Employee>[] = [
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold dark:bg-brand-500/10 dark:text-brand-400">
            {(row.fullName ?? "?").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{row.fullName}</p>
            <p className="text-xs text-gray-400">{row.email ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "NIP",
      render: (row) => <span className="text-xs font-mono">{row.user.nip}</span>,
    },
    {
      header: "Posisi",
      render: (row) => (
        <span className="text-xs">{row.position?.name ?? "—"}</span>
      ),
    },
    {
      header: "",
      width: "w-24",
      render: (row) => (
        <button
          onClick={() => handleSelectEmp(row)}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
        >
          Pilih
        </button>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
          <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {step === "select" ? "Pilih Karyawan" : "Daftarkan Wajah"}
          </h3>
          <p className="text-xs text-gray-400">
            {step === "select"
              ? "Cari dan pilih karyawan yang akan didaftarkan wajahnya"
              : `Karyawan: ${selectedEmp?.fullName}`}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-2">
        {(["select", "upload"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                step === s
                  ? "bg-brand-500 text-white"
                  : i < (step === "upload" ? 1 : 0)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-700"
              }`}
            >
              {i < (step === "upload" ? 1 : 0) ? (
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs ${step === s ? "font-medium text-gray-700 dark:text-gray-200" : "text-gray-400"}`}>
              {s === "select" ? "Pilih Karyawan" : "Upload Foto"}
            </span>
            {i < 1 && <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      {/* Step 1: Employee table */}
      {step === "select" && (
        <DataTableOnline
          columns={empColumns}
          data={employees}
          meta={empMeta}
          loading={empLoading}
          showIndex={false}
          onQueryChange={fetchEmployees}
          searchPlaceholder="Cari nama karyawan atau email..."
        />
      )}

      {/* Step 2: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          <UploadZone file={file} preview={preview} onChange={handleFileChange} disabled={uploading} />
          <PhotoInstructions />

          {errorMsg && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setStep("select"); setFile(null); setPreview(null); setErrorMsg(null); }}
              disabled={uploading}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <button
              onClick={onClose}
              disabled={uploading}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Batal
            </button>
            <button
              onClick={handleRegister}
              disabled={uploading || !file}
              className="ml-auto rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-40"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Mendaftarkan...
                </span>
              ) : "Daftarkan Wajah"}
            </button>
          </div>
        </div>
      )}

      {/* Step 1 footer */}
      {step === "select" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Batal
          </button>
        </div>
      )}
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ManajemenWajah() {
  const { user: authUser } = useAuthContext();
  const currentUserId = authUser?.id ?? "";

  const {
    faces,
    meta,
    loading,
    error,
    fetchAll,
    handleQueryChange,
    adminUpdate,
    adminDelete,
  } = useFaces();

  // Modals
  const [updateTarget, setUpdateTarget] = useState<FaceRecord | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FaceRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    fetchAll({ page: 1, limit: 10, search: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (userId: string, file: File) => {
    setUpdateLoading(true);
    try {
      await adminUpdate(userId, file);
      toast.success(`Data biometrik "${updateTarget?.user?.employees?.fullName ?? updateTarget?.user?.nip ?? ""}" berhasil diperbarui.`);
      setUpdateTarget(null);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.userId === currentUserId) {
      setDeleteError("Anda tidak dapat menghapus data wajah diri sendiri.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminDelete(deleteTarget.userId);
      toast.success(`Data wajah "${deleteTarget.user?.employees?.fullName ?? deleteTarget.user?.nip ?? ""}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus data wajah.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Role badge
  const RoleBadge = ({ role }: { role: string }) => {
    const colors: Record<string, string> = {
      CEO: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      HR: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
      ADMIN: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
      USER: "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] ?? colors.USER}`}>
        {role}
      </span>
    );
  };

  const columns: Column<FaceRecord>[] = [
    {
      header: "Karyawan",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-base font-bold text-white">
              {(row.user?.employees?.fullName ?? row.user?.nip ?? "?").charAt(0).toUpperCase()}
            </div>
            {/* Biometric indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-500 dark:border-gray-900">
              <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{row.user?.employees?.fullName ?? row.user?.nip ?? "—"}</p>
            <p className="text-xs text-gray-400">{row.user?.employees?.email ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      width: "w-28",
      render: (row) => <RoleBadge role={row.user?.role ?? "USER"} />,
    },
    {
      header: "Didaftarkan",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(row.createdAt)}</p>
          {row.updatedAt !== row.createdAt && (
            <p className="text-xs text-gray-400">Diperbarui: {formatDate(row.updatedAt)}</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      width: "w-28",
      render: () => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Terdaftar
        </span>
      ),
    },
    {
      header: "Aksi",
      width: "w-36",
      render: (row) => {
        const isSelf = row.userId === currentUserId;

        return (
          <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setUpdateTarget(row)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
          >
            Update
          </button>
          <button
            type="button"
            disabled={isSelf}
            title={isSelf ? "Anda tidak dapat menghapus data wajah diri sendiri" : "Hapus data wajah"}
            onClick={() => {
              if (isSelf) return;
              setDeleteTarget(row);
              setDeleteError(null);
            }}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hapus
          </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageMeta
        title="Manajemen Wajah"
        description="Kelola data biometrik wajah karyawan"
      />
      <PageBreadcrumb pageTitle="Manajemen Wajah" />

      <div className="space-y-6">
        {/* Stats Banner */}
        <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-blue-50 p-5 dark:border-brand-500/20 dark:from-brand-500/10 dark:to-blue-500/10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{meta.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Karyawan terdaftar biometrik wajah
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 shadow-sm dark:bg-white/[0.05]">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Secure Biometric</span>
          </div>
        </div>

        {/* Table card */}
        <ComponentCard
          title="Data Wajah Terdaftar"
          desc="Karyawan yang telah mendaftarkan data biometrik wajah"
          action={
            <button
              onClick={() => setRegisterOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              Register New
            </button>
          }
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}
          <DataTableOnline
            columns={columns}
            data={faces}
            meta={meta}
            loading={loading}
            onQueryChange={handleQueryChange}
            searchPlaceholder="Cari nama atau email karyawan..."
          />
        </ComponentCard>
      </div>

      {/* Update Face Modal */}
      <UpdateFaceModal
        isOpen={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        target={updateTarget}
        onSave={handleUpdate}
        loading={updateLoading}
      />

      {/* Register New Face Modal */}
      <RegisterNewFaceModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={() => fetchAll({ page: 1, limit: meta.limit, search: "" })}
      />

      {/* Delete Confirm */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        itemName={`data wajah milik ${deleteTarget?.user?.employees?.fullName ?? deleteTarget?.user?.nip ?? ""}`}
        onConfirm={handleDelete}
        loading={deleteLoading}
        errorMessage={deleteError}
      />
    </>
  );
}
