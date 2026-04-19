// * This file defines route module logic for src/pages/Karyawan/routes/dompet/index.tsx.

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../components/ui/modal";
import { useAuthContext } from "../../../../context/AuthContext";
import {
  useMarketplace,
  useMyInventory,
  useMyLedger,
  useMyWallet,
} from "../../../../hooks/useIntegrity";
import type { FlexibilityItem } from "../../../../types/integrity.types";
import { DOMPET_QUERY_LIMITS } from "../../utils/dompet/constants";
import { getCurrentLevel, getNextLevel } from "../../utils/dompet/levels";
import type { DompetTabKey } from "../../utils/dompet/types";
import DompetHeaderSection from "./components/DompetHeaderSection";
import DompetInventorySection from "./components/DompetInventorySection";
import DompetLedgerSection from "./components/DompetLedgerSection";
import DompetMarketplaceSection from "./components/DompetMarketplaceSection";
import DompetTabSection from "./components/DompetTabSection";
import DompetWalletSection from "./components/DompetWalletSection";

// & This function component/helper defines KaryawanDompetPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanDompetPage untuk file route ini.
const KaryawanDompetPage = () => {
  // & Process the main execution steps of KaryawanDompetPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanDompetPage di dalam body fungsi ini.
  const { user, hasPermission, hasRoutePermission } = useAuthContext();

  const canReadWallet =
    hasPermission("employee_wallet", "READ") ||
    hasRoutePermission("/karyawan/dompet", "READ");
  const canBuyToken =
    hasPermission("employee_wallet", "CREATE") ||
    hasPermission("points", "CREATE") ||
    hasRoutePermission("/karyawan/dompet", "CREATE");

  const {
    balance,
    loading: walletLoading,
    error: walletError,
    fetch: fetchWallet,
  } = useMyWallet();
  const {
    entries: ledgerEntries,
    meta: ledgerMeta,
    loading: ledgerLoading,
    error: ledgerError,
    fetchAll: fetchLedger,
    handleQueryChange: handleLedgerQuery,
  } = useMyLedger();
  const {
    items: marketplaceItems,
    meta: marketplaceMeta,
    loading: marketplaceLoading,
    error: marketplaceError,
    fetchAll: fetchMarketplace,
    handleQueryChange: handleMarketplaceQuery,
    buy,
    buying,
  } = useMarketplace();
  const {
    tokens,
    meta: inventoryMeta,
    loading: inventoryLoading,
    error: inventoryError,
    fetchAll: fetchInventory,
    handleQueryChange: handleInventoryQuery,
  } = useMyInventory();

  const [activeTab, setActiveTab] = useState<DompetTabKey>("wallet");
  const [selectedItem, setSelectedItem] = useState<FlexibilityItem | null>(
    null,
  );
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyResult, setBuyResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!canReadWallet) return;

    fetchWallet();
    fetchLedger({ page: 1, limit: DOMPET_QUERY_LIMITS.ledger });
    fetchMarketplace({ page: 1, limit: DOMPET_QUERY_LIMITS.marketplace });
    fetchInventory({ page: 1, limit: DOMPET_QUERY_LIMITS.inventory });
  }, [
    canReadWallet,
    fetchWallet,
    fetchLedger,
    fetchMarketplace,
    fetchInventory,
  ]);

  const fullName = user?.employees?.fullName ?? null;
  const nip = user?.nip ?? null;
  const currentBalance = balance?.balance ?? 0;
  const totalEarned = balance?.totalEarned ?? 0;
  const totalSpent = balance?.totalSpent ?? 0;
  const rank = balance?.rank ?? null;

  const level = useMemo(() => getCurrentLevel(currentBalance), [currentBalance]);
  const { next: nextLevel, progress } = useMemo(
    () => getNextLevel(currentBalance),
    [currentBalance],
  );

  const pageError =
    walletError ?? ledgerError ?? marketplaceError ?? inventoryError;

  const handleLedgerPageChange = (page: number) => {
    handleLedgerQuery({
      page,
      limit: DOMPET_QUERY_LIMITS.ledger,
      search: "",
    });
  };

  const handleMarketplacePageChange = (page: number) => {
    handleMarketplaceQuery({
      page,
      limit: DOMPET_QUERY_LIMITS.marketplace,
      search: "",
    });
  };

  const handleInventoryPageChange = (page: number) => {
    handleInventoryQuery({
      page,
      limit: DOMPET_QUERY_LIMITS.inventory,
      search: "",
    });
  };

  const closeBuyModal = () => {
    if (buying) return;
    setIsBuyModalOpen(false);
    setSelectedItem(null);
    setBuyResult(null);
  };

  const openBuyModal = (item: FlexibilityItem) => {
    if (!canBuyToken) {
      return;
    }

    setSelectedItem(item);
    setBuyResult(null);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedItem || buying) return;

    const result = await buy(selectedItem.id);

    if (result.success) {
      setBuyResult({
        type: "success",
        message: `Berhasil menukar "${selectedItem.itemName}". Token telah masuk ke inventory Anda.`,
      });

      fetchWallet();
      fetchLedger({
        page: ledgerMeta?.page ?? 1,
        limit: DOMPET_QUERY_LIMITS.ledger,
      });
      fetchInventory({
        page: inventoryMeta?.page ?? 1,
        limit: DOMPET_QUERY_LIMITS.inventory,
      });
      fetchMarketplace({
        page: marketplaceMeta?.page ?? 1,
        limit: DOMPET_QUERY_LIMITS.marketplace,
      });

      return;
    }

    setBuyResult({
      type: "error",
      message: result.error ?? "Terjadi kesalahan saat menukar token.",
    });

    fetchMarketplace({
      page: marketplaceMeta?.page ?? 1,
      limit: DOMPET_QUERY_LIMITS.marketplace,
    });
  };

  if (!canReadWallet) {
    return (
      <div className="min-h-full bg-gray-50 px-4 py-6 md:px-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Anda tidak memiliki izin untuk mengakses Dompet Integritas.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 md:px-6">
      {pageError && (
        <div className="mb-3 rounded-xl border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700">
          {pageError}
        </div>
      )}

      <DompetHeaderSection
        fullName={fullName}
        nip={nip}
        walletLoading={walletLoading}
        currentBalance={currentBalance}
        rank={rank}
        totalEarned={totalEarned}
        totalSpent={totalSpent}
        level={level}
        nextLevel={nextLevel}
        progress={progress}
      />

      <DompetTabSection activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === "wallet" && (
        <DompetWalletSection
          currentBalance={currentBalance}
          totalEarned={totalEarned}
          totalSpent={totalSpent}
          currentLevelKey={level.key}
          progress={progress}
        />
      )}

      {activeTab === "ledger" && (
        <DompetLedgerSection
          loading={ledgerLoading}
          entries={ledgerEntries}
          page={ledgerMeta.page}
          totalPages={ledgerMeta.totalPages}
          onPageChange={handleLedgerPageChange}
        />
      )}

      {activeTab === "marketplace" && (
        <DompetMarketplaceSection
          loading={marketplaceLoading}
          items={marketplaceItems}
          currentBalance={currentBalance}
          buying={buying}
          canBuyToken={canBuyToken}
          page={marketplaceMeta.page}
          totalPages={marketplaceMeta.totalPages}
          onPageChange={handleMarketplacePageChange}
          onBuy={openBuyModal}
        />
      )}

      {activeTab === "inventory" && (
        <DompetInventorySection
          loading={inventoryLoading}
          tokens={tokens}
          page={inventoryMeta.page}
          totalPages={inventoryMeta.totalPages}
          onPageChange={handleInventoryPageChange}
        />
      )}

      <Modal
        isOpen={isBuyModalOpen}
        onClose={closeBuyModal}
        className="mx-4 max-w-md p-6 sm:p-7"
        showCloseButton={!buying}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {buyResult
            ? buyResult.type === "success"
              ? "Penukaran Berhasil"
              : "Penukaran Gagal"
            : "Konfirmasi Penukaran"}
        </h3>

        {!buyResult ? (
          <>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Anda akan menukar poin untuk item berikut:
            </p>

            {selectedItem && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedItem.itemName}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Biaya: {selectedItem.pointCost.toLocaleString("id-ID")} poin
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeBuyModal}
                disabled={buying}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBuy}
                disabled={buying || !selectedItem}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buying ? "Memproses..." : "Tukar Sekarang"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className={`mt-3 text-sm ${
                buyResult.type === "success"
                  ? "text-success-600 dark:text-success-400"
                  : "text-error-600 dark:text-error-400"
              }`}
            >
              {buyResult.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeBuyModal}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default KaryawanDompetPage;
