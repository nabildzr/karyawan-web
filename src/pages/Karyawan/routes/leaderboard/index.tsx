// * This file defines route module logic for src/pages/Karyawan/routes/leaderboard/index.tsx.

import { Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../../../context/AuthContext";
import { useMyLeaderboard } from "../../../../hooks/useIntegrity";

const PAGE_SIZE = 10;

const KaryawanLeaderboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    entries,
    meta,
    loading,
    error,
    fetchAll,
  } = useMyLeaderboard();

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAll({
      page,
      limit: PAGE_SIZE,
    });
  }, [fetchAll, page]);

  const safeEntries = useMemo(
    () => (Array.isArray(entries) ? entries : []),
    [entries],
  );

  const myUserId = user?.id ?? null;
  const totalPages = Math.max(1, Number(meta.totalPages ?? 1));

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="min-h-full bg-gray-50 px-4 pb-28 pt-6">
      <header className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Dompet Integritas
            </p>
            <h1 className="mt-1 text-lg font-bold text-gray-900">Leaderboard Karyawan</h1>
            <p className="mt-1 text-xs text-gray-500">
              Peringkat poin integritas seluruh karyawan.
            </p>
          </div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-gray-500">Total Peserta</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {(meta.total ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-gray-500">Halaman</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {page} / {totalPages}
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-3 rounded-xl border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">Peringkat</p>
        </div>

        {loading ? (
          <div className="space-y-2 px-4 py-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="h-14 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : safeEntries.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {safeEntries.map((entry) => {
              const isMe = myUserId != null && entry.userId === myUserId;
              const isTopOne = entry.rank === 1;
              const isTopTwo = entry.rank === 2;
              const isTopThree = entry.rank === 3;

              return (
                <article
                  key={`${entry.userId}:${entry.rank}`}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isMe ? "bg-brand-50/60" : "bg-white"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                      isTopOne
                        ? "bg-yellow-100 text-yellow-700"
                        : isTopTwo
                          ? "bg-gray-200 text-gray-700"
                          : isTopThree
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isTopOne ? (
                      <Crown className="h-4 w-4" />
                    ) : isTopTwo || isTopThree ? (
                      <Medal className="h-4 w-4" />
                    ) : (
                      entry.rank
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {entry.name}
                      {isMe ? " (Anda)" : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Level {entry.level}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-600">
                      {entry.balance.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] text-gray-400">poin</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            Belum ada data leaderboard.
          </div>
        )}
      </section>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={page <= 1 || loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sebelumnya
        </button>

        <button
          type="button"
          onClick={() => navigate("/karyawan/dompet")}
          className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          Kembali ke Dompet
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={page >= totalPages || loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
};

export default KaryawanLeaderboardPage;
