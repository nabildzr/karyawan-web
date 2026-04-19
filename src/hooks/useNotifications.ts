import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";

export const useNotifications = (category?: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["notifications", category];

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => 
      notificationsService.getMyNotifications({ page: pageParam, limit: 10, category: category === "ALL" ? undefined : category }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages) => {
      const currentPage = lastPage.meta.currentPage;
      if (currentPage < lastPage.meta.totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 30000, // refresh tiap 30 detik
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    ...infiniteQuery,
    notifications: infiniteQuery.data?.pages.flatMap(page => page.data) ?? [],
    unreadCount: unreadCountQuery.data ?? 0,
    refetchUnread: unreadCountQuery.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
  };
};
