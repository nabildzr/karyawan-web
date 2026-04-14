import { useNavigate } from "react-router";

// * Hook ini mengembalikan user ke halaman sebelumnya.
// * Jika tidak ada riwayat, user diarahkan ke admin.
const useGoBack = () => {
  const navigate = useNavigate();

  // & Navigate back when history exists.
  // % Kembali ke halaman sebelumnya jika riwayat ada.
  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // & Fallback to admin home when no history is available.
      // % Arahkan ke beranda admin saat riwayat tidak tersedia.
      navigate("/admin");
    }
  };

  return goBack;
};

export default useGoBack;
