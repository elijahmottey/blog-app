import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { webSocketService } from '../service/WebSocketService';
import { toast } from 'sonner';
import BackendApi, {type NotificationDto } from '../service/BackendApi';

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await BackendApi.getNotifications(0, 20);
      // @ts-ignore
      setNotifications(response.data.content);
      const countResponse = await BackendApi.getUnreadNotificationCount();
      setUnreadCount(countResponse.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
      webSocketService.connect(user.id, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(notification.message);
      });
    } else {
      webSocketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await BackendApi.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await BackendApi.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
