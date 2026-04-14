// * This file defines route module logic for src/pages/Karyawan/routes/pengajuan/components/abandoned/_modal.tsx.

// & This archived snippet stores previous modal draft for date selection UI reference.
// % Cuplikan arsip ini menyimpan draft modal sebelumnya untuk referensi UI pemilihan tanggal.

  // <Modal
  //       isOpen={isCalendarOpen}
  //       onClose={cancelDateSelection}
  //       className="mx-4 max-w-md p-5"
  //     >
  //       <h3 className="text-sm font-semibold text-gray-800">
  //         {activeDateField === "startDate"
  //           ? "Pilih Tanggal Mulai"
  //           : "Pilih Tanggal Selesai"}
  //       </h3>
  //       <p className="mt-1 text-xs text-gray-500">
  //         Pemilihan tanggal terpisah per kolom agar tidak saling mengubah.
  //       </p>

  //       <div className="mt-3">
  //         <DatePicker
  //           id="submission-date-single-picker"
  //           mode="single"
  //           placeholder={
  //             activeDateField === "startDate"
  //               ? "Pilih tanggal mulai"
  //               : "Pilih tanggal selesai"
  //           }
  //           defaultDate={dateDraft[activeDateField] || undefined}
  //           onChange={handleDateChange}
  //         />
  //       </div>

  //       <div className="mt-4 flex gap-2">
  //         <button
  //           type="button"
  //           onClick={cancelDateSelection}
  //           className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
  //         >
  //           Batal
  //         </button>
  //         <button
  //           type="button"
  //           onClick={applyDateSelection}
  //           className="flex-1 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
  //         >
  //           Pilih
  //         </button>
  //       </div>
  //     </Modal>