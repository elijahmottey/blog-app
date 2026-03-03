import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackendApi from '../service/BackendApi';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { webSocketService } from '../service/WebSocketService';

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
  const queryClient = useQueryClient();
  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => BackendApi.getNotifications(0, 50),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => BackendApi.getUnreadNotificationCount(),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!userId) return;

    // Temporarily disabled WebSocket - using polling instead
    // const handleNotification = (notification: Notification) => {
    //   setRealtimeNotifications((prev) => [notification, ...prev]);
    //   queryClient.invalidateQueries({ queryKey: ['notifications'] });
    //   queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    //   toast.info(notification.message, { autoClose: 5000 });
    // };

    // webSocketService.connect(userId, handleNotification);

    // return () => {
    //   webSocketService.disconnect();
    // };
  }, [userId, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => BackendApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => BackendApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifications = (notificationsData?.data as any)?.content || [];
  const unreadCount = unreadCountData?.data || 0;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
  };
};
