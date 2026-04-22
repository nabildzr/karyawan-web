import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../../../services/auth.service";

const AkunLogoutButton = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      queryClient.clear();
      navigate("/karyawan/signin");
    },
  });

  return (
    <div className="mt-4 rounded-2xl border border-red-100 bg-white p-4 shadow-theme-xs">
      <p className="text-sm font-semibold text-gray-800">Sesi Login</p>
      <p className="mt-1 text-xs text-gray-500">
        Keluar dari akun pada perangkat ini.
      </p>

      <button
        type="button"
        onClick={() => logout()}
        disabled={isPending}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Memproses..." : "Logout"}
      </button>
    </div>
  );
};

export default AkunLogoutButton;
