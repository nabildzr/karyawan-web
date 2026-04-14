import { useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import DemographicCard from "../../../components/ecommerce/DemographicCard";
import EcommerceMetrics from "../../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../../components/ecommerce/RecentOrders";
import StatisticsChart from "../../../components/ecommerce/StatisticsChart";

export default function Home() {
  const navigate = useNavigate();

  const todayDisplay = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }),
    [],
  );

  const handlePortalChange = (nextPortal: string) => {
    if (nextPortal === "karyawan") {
      navigate("/karyawan");
      return;
    }

    navigate("/admin");
  };

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="mb-6 rounded-2xl bg-gray-900 p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-300">
              Portal
            </span>
            <select
              value="admin"
              onChange={(event) => handlePortalChange(event.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white outline-none focus:border-white"
            >
              <option value="admin" className="text-gray-900">
                Portal Admin
              </option>
              <option value="karyawan" className="text-gray-900">
                Portal Karyawan
              </option>
            </select>
          </label>

          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
            {todayDisplay}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
