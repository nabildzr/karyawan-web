// * This file defines route module logic for src/pages/Karyawan/routes/pengajuan/components/abandoned/_riwayatpengajuansection.tsx.

// & This archived snippet preserves previous submission history section markup for reference.
// % Cuplikan arsip ini menyimpan markup section riwayat pengajuan versi sebelumnya untuk referensi.

  {/* <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Riwayat Pengajuan
          </h2>
          <span className="text-xs text-gray-500">{meta.total} total</span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setActiveFilter(filter.value);
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeFilter === filter.value
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-xs text-gray-500">Memuat data pengajuan...</p>
        ) : submissions.length === 0 ? (
          <p className="text-xs text-gray-500">Belum ada data pengajuan.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {formatType(item.type)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-600">
                  {item.reason}
                </p>

                {item.attachment && (
                  <div className="mt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => openAttachmentPreview(item)}
                      className="font-semibold text-brand-600 underline"
                    >
                      {item.attachmentOriginalName || "Lihat lampiran"}
                    </button>
                    {item.attachmentSizeBytes ? (
                      <span className="ml-1 text-gray-500">
                        ({formatFileSize(item.attachmentSizeBytes)})
                      </span>
                    ) : null}
                  </div>
                )}

                {item.status === "REJECTED" && item.rejectionReason && (
                  <p className="mt-1 text-[11px] font-medium text-error-600">
                    Alasan ditolak: {item.rejectionReason}
                  </p>
                )}
              </article>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <p className="text-[11px] text-gray-500">
                Halaman {meta.page} dari {Math.max(meta.totalPages, 1)}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((previous) => Math.max(1, previous - 1))
                  }
                  disabled={currentPage <= 1}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                      pageNumber === currentPage
                        ? "bg-brand-500 text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((previous) =>
                      Math.min(Math.max(meta.totalPages, 1), previous + 1),
                    )
                  }
                  disabled={currentPage >= Math.max(meta.totalPages, 1)}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </section> */}