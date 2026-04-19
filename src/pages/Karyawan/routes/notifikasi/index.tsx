import {
  ArrowLeftRight,
  Bell,
  CalendarCheck2,
  CheckCheck,
  FileSignature,
  Info,
  Star,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNotifications } from "../../../../hooks/useNotifications";
import { usePushSubscription } from "../../../../hooks/usePushSubscription";
import type { NotificationRecord } from "../../../../types/notifications.types";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "ATTENDANCE":
      return <CalendarCheck2 className="text-blue-500" />;
    case "POINTS":
      return <Star className="text-yellow-500" />;
    case "SCHEDULE":
      return <ArrowLeftRight className="text-purple-500" />;
    case "ASSESSMENT":
      return <UserRound className="text-teal-500" />;
    case "SUBMISSION":
      return <FileSignature className="text-orange-500" />;
    default:
      return <Info className="text-gray-500" />;
  }
};

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case "ATTENDANCE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "POINTS":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "SCHEDULE":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "ASSESSMENT":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
    case "SUBMISSION":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

const TranslateCategory = (cat: string) => {
  const map: Record<string, string> = {
    ATTENDANCE: "Absensi",
    POINTS: "Poin",
    SCHEDULE: "Jadwal",
    ASSESSMENT: "Penilaian",
    SUBMISSION: "Pengajuan",
    GENERAL: "Umum",
  };
  return map[cat] || cat;
}

export default function NotifikasiKaryawan() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  const {
    notifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications(selectedCategory);

  const { isSupported, isSubscribed, subscribe } = usePushSubscription();

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const handleNotificationClick = async (notifId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notifId);
    }
  };

  const categories = [
    { id: "ALL", label: "Semua" },
    { id: "ATTENDANCE", label: "Absensi" },
    { id: "POINTS", label: "Poin" },
    { id: "SUBMISSION", label: "Pengajuan" },
    { id: "ASSESSMENT", label: "Penilaian" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 pt-6 px-4">
      <div className="flex flex-col mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="text-brand-500" />
            Notifikasi
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm flex items-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors dark:text-slate-400 dark:hover:text-brand-400"
            >
              <CheckCheck /> Tandai Semua Dibaca
            </button>
          )}
        </div>

        {isSupported && !isSubscribed && (
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
             <div className="flex items-start gap-3">
               <Bell className="text-blue-500 mt-1" />
               <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300">Aktifkan Notifikasi Push</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Dapatkan pemberitahuan langsung di perangkatmu untuk info absensi dan pengajuan penting.</p>
               </div>
             </div>
             <button onClick={subscribe} className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                Aktifkan
             </button>
          </div>
        )}

        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-800 text-white shadow-md dark:bg-brand-600"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-4 flex gap-4 border border-slate-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="text-3xl text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Tidak Ada Notifikasi</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-[250px]">
              Kelihatannya kamu sudah membaca semua notifikasi terbaru.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notif: NotificationRecord) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                className={`relative group bg-white dark:bg-slate-800 rounded-2xl p-4 transition-all duration-300 border cursor-pointer hover:shadow-md
                  ${
                    notif.isRead
                      ? "border-slate-100 dark:border-slate-700 opacity-70"
                      : "border-brand-200/50 dark:border-brand-800/30 shadow-sm"
                  }`}
              >
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg ${notif.isRead ? "bg-slate-100 dark:bg-slate-700" : "bg-brand-50 dark:bg-brand-900/30"}`}>
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getCategoryBadgeClass(notif.category)}`}>
                        {TranslateCategory(notif.category)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <h4 className={`font-semibold text-sm mb-1 ${notif.isRead ? "text-slate-600 dark:text-slate-300" : "text-slate-800 dark:text-white"}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-sm line-clamp-2 ${notif.isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-600 dark:text-slate-300"}`}>
                      {notif.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Memuat..." : "Tampilkan Lebih Banyak"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
