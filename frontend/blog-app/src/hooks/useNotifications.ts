import { useQuery } from '@tanstack/react-query';
import BackendApi from '../service/BackendApi';
import { useEffect, useState } from 'react';

interface NotificationData {
  newPosts: number[];
  newUsers: number[];
  lastPostCount: number;
  lastUserCount: number;
}

export const useNotifications = (isAdmin: boolean = false) => {
  const [notificationData, setNotificationData] = useState<NotificationData>({
    newPosts: [],
    newUsers: [],
    lastPostCount: 0,
    lastUserCount: 0
  });

  const { data: postsData } = useQuery({
    queryKey: ['posts-notification'],
    queryFn: () => BackendApi.getAllPost(0, 100),
    refetchInterval: 30000,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-notification'],
    queryFn: () => BackendApi.getAllUsers(0, 100),
    refetchInterval: 30000,
    enabled: isAdmin,
  });

  useEffect(() => {
    const stored = localStorage.getItem('notificationData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotificationData(parsed);
    }
  }, []);

  useEffect(() => {
    if (!postsData?.data?.content) return;

    const posts = postsData.data.content;
    const currentPostIds = posts.map((p: any) => p.id).sort((a: number, b: number) => b - a);
    
    if (notificationData.lastPostCount === 0) {
      setNotificationData(prev => ({ ...prev, lastPostCount: currentPostIds.length }));
      return;
    }

    const newPostIds = currentPostIds.slice(0, currentPostIds.length - notificationData.lastPostCount);
    if (newPostIds.length > 0) {
      setNotificationData(prev => ({
        ...prev,
        newPosts: [...new Set([...prev.newPosts, ...newPostIds])],
        lastPostCount: currentPostIds.length
      }));
    }
  }, [postsData]);

  useEffect(() => {
    if (!isAdmin || !usersData?.data?.content) return;

    const users = usersData.data.content;
    const currentUserIds = users.map((u: any) => u.id).sort((a: number, b: number) => b - a);
    
    if (notificationData.lastUserCount === 0) {
      setNotificationData(prev => ({ ...prev, lastUserCount: currentUserIds.length }));
      return;
    }

    const newUserIds = currentUserIds.slice(0, currentUserIds.length - notificationData.lastUserCount);
    if (newUserIds.length > 0) {
      setNotificationData(prev => ({
        ...prev,
        newUsers: [...new Set([...prev.newUsers, ...newUserIds])],
        lastUserCount: currentUserIds.length
      }));
    }
  }, [usersData, isAdmin]);

  useEffect(() => {
    localStorage.setItem('notificationData', JSON.stringify(notificationData));
  }, [notificationData]);

  const markPostAsRead = (postId: number) => {
    setNotificationData(prev => ({
      ...prev,
      newPosts: prev.newPosts.filter(id => id !== postId)
    }));
  };

  const markAllPostsAsRead = () => {
    setNotificationData(prev => ({ ...prev, newPosts: [] }));
  };

  const markUserAsRead = (userId: number) => {
    setNotificationData(prev => ({
      ...prev,
      newUsers: prev.newUsers.filter(id => id !== userId)
    }));
  };

  const markAllUsersAsRead = () => {
    setNotificationData(prev => ({ ...prev, newUsers: [] }));
  };

  const totalNotifications = notificationData.newPosts.length + notificationData.newUsers.length;

  return { 
    newPosts: notificationData.newPosts,
    newUsers: notificationData.newUsers,
    totalNotifications,
    markPostAsRead,
    markAllPostsAsRead,
    markUserAsRead,
    markAllUsersAsRead
  };
};
