import { apiClient } from "../api/apiClient";
import { NotificationListResponse } from "../types/notifications.types";

interface UnreadCountResponse {
  data: { count: number };
}

interface PublicVapidKeyResponse {
  data: { publicKey: string };
}

export const notificationsService = {
  getMyNotifications: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    isRead?: boolean;
  }): Promise<NotificationListResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined)
    );
    const res = await apiClient.get<NotificationListResponse>("/notifications/my", {
      params: cleanParams,
    });
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<UnreadCountResponse>("/notifications/my/unread-count");
    return res.data.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/my/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put("/notifications/my/read-all");
  },

  getPushPublicKey: async (): Promise<string> => {
    const res = await apiClient.get<PublicVapidKeyResponse>(
      "/notifications/push-public-key",
    );
    return String(res.data.data.publicKey || "");
  },

  subscribeToPush: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await apiClient.post("/notifications/subscribe", {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });
  },

  unsubscribeFromPush: async (endpoint: string): Promise<void> => {
    await apiClient.delete("/notifications/unsubscribe", {
      data: { endpoint },
    });
  },
};
