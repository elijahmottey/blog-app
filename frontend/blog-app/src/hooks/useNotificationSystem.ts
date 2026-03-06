import { useNotification } from '../context/NotificationContext';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  referenceId: number;
  isRead: boolean;
  createdAt: string;
}

export const useNotificationSystem = (userId?: number) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  return {
    notifications,
    unreadCount,
    isLoading: false,
    markAsRead,
    markAllAsRead,
  };
};