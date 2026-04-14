import { useCallback, useState } from "react";

// * Hook ini mengatur buka tutup modal sederhana.
// * Dipakai untuk dialog form atau konfirmasi.
export const useModal = (initialState: boolean = false) => {
  // & State to track modal visibility.
  // % State untuk menyimpan status modal.
  const [isOpen, setIsOpen] = useState(initialState);

  // & Actions to open, close, and toggle modal.
  // % Aksi untuk membuka, menutup, dan toggle modal.
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
};
