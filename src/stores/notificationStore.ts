import { create } from "zustand";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (message, type = "info") => {
    const id = crypto.randomUUID();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
