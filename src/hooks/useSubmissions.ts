// * Frontend module: karyawan-web/src/hooks/useSubmissions.ts
// & This file defines frontend UI or logic for useSubmissions.ts.
// % File ini mendefinisikan UI atau logika frontend untuk useSubmissions.ts.

import { useCallback, useRef, useState } from "react";
import { submissionsService } from "../services/submissions.service";
import type {
  CreateSubmissionInput,
  GetAdminSubmissionsParams,
  GetSubmissionsParams,
  SubmissionPaginatedMeta,
  SubmissionRecord,
  UpdateSubmissionStatusInput,
} from "../types/submissions.types";

const DEFAULT_META: SubmissionPaginatedMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

type Mode = "mine" | "admin";

// * Hook ini mengelola data pengajuan untuk mode mine dan admin.
// * Admin melihat semua data, mine hanya data milik sendiri.

export function useSubmissions(mode: Mode = "mine") {
  // & State for list, pagination, and status.
  // % State untuk daftar, paginasi, dan status.
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [meta, setMeta] = useState<SubmissionPaginatedMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // & Keep latest query params for refetch.
  // % Simpan query terakhir untuk refetch.
  const queryRef = useRef<GetSubmissionsParams | GetAdminSubmissionsParams>({
    page: 1,
    limit: 10,
  });

  // & Fetch submissions for mine mode.
  // % Ambil pengajuan untuk mode mine.
  const fetchMine = useCallback(async (params: GetSubmissionsParams = {}) => {
    setLoading(true);
    setError(null);
    queryRef.current = params;

    try {
      const result = await submissionsService.getMy(params);
      setSubmissions(result.data);
      setMeta(result.meta);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pengajuan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // & Fetch submissions for admin mode.
  // % Ambil pengajuan untuk mode admin.
  const fetchAdmin = useCallback(
    async (params: GetAdminSubmissionsParams = {}) => {
      setLoading(true);
      setError(null);
      queryRef.current = params;

      try {
        const result = await submissionsService.getAllAdmin(params);
        setSubmissions(result.data);
        setMeta(result.meta);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat data pengajuan.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // & Route fetch call by active mode.
  // % Arahkan fetch sesuai mode aktif.
  const fetchList = useCallback(
    async (params?: GetSubmissionsParams | GetAdminSubmissionsParams) => {
      if (mode === "admin") {
        await fetchAdmin((params as GetAdminSubmissionsParams) ?? {});
        return;
      }

      await fetchMine((params as GetSubmissionsParams) ?? {});
    },
    [fetchAdmin, fetchMine, mode],
  );

  // & Refetch list with stored query.
  // % Refetch daftar dengan query tersimpan.
  const refetch = useCallback(async () => {
    // & Use admin fetch when mode is admin.
    // % Pakai fetch admin saat mode admin.
    if (mode === "admin") {
      await fetchAdmin(queryRef.current as GetAdminSubmissionsParams);
      return;
    }

    // & Otherwise use mine fetch.
    // % Selain itu pakai fetch mine.
    await fetchMine(queryRef.current as GetSubmissionsParams);
  }, [fetchAdmin, fetchMine, mode]);

  // & Create submission then refetch list.
  // % Buat pengajuan lalu refetch daftar.
  const createSubmission = async (
    payload: CreateSubmissionInput,
  ): Promise<SubmissionRecord> => {
    const created = await submissionsService.create(payload);

    await refetch();
    return created;
  };

  // & Update submission status then refetch list.
  // % Ubah status pengajuan lalu refetch daftar.
  const updateSubmissionStatus = async (
    id: string,
    payload: UpdateSubmissionStatusInput,
  ): Promise<SubmissionRecord> => {
    const updated = await submissionsService.updateStatus(id, payload);

    await refetch();
    return updated;
  };

  // & Delete submission then refetch list.
  // % Hapus pengajuan lalu refetch daftar.
  const deleteSubmission = async (id: string): Promise<SubmissionRecord> => {
    const deleted = await submissionsService.deleteAdmin(id);

    await refetch();
    return deleted;
  };

  // & Return state and actions for UI.
  // % Kembalikan state dan aksi untuk UI.

  return {
    submissions,
    meta,
    loading,
    error,
    fetchList,
    fetchMine,
    fetchAdmin,
    refetch,
    createSubmission,
    updateSubmissionStatus,
    deleteSubmission,
  };
}
