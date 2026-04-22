import { useNavigate } from "react-router-dom";

const AkunChangePasswordCard = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 rounded-2xl border border-amber-100 bg-white p-4 shadow-theme-xs">
      <p className="text-sm font-semibold text-gray-800">Keamanan Akun</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Untuk ganti password, kamu akan diarahkan ke halaman lupa password yang sudah tersedia.
      </p>

      <button
        type="button"
        onClick={() => navigate("/auth/forgot-password")}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
      >
        Ganti Password
      </button>
    </div>
  );
};

export default AkunChangePasswordCard;
