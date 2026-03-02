import { useQuery } from '@tanstack/react-query';
import BackendApi from '../service/BackendApi';
import { useEffect, useState } from 'react';

export const useNotifications = () => {
  const [lastPostCount, setLastPostCount] = useState<number | null>(null);
  const [newPostsCount, setNewPostsCount] = useState(0);

  const { data: postsData } = useQuery({
    queryKey: ['posts-notification'],
    queryFn: () => BackendApi.getTotalPost(),
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    const totalPosts = postsData?.data || 0;
    
    if (lastPostCount === null) {
      setLastPostCount(totalPosts);
      const stored = localStorage.getItem('lastSeenPostCount');
      if (stored) {
        const diff = totalPosts - parseInt(stored);
        if (diff > 0) setNewPostsCount(diff);
      }
    } else if (totalPosts > lastPostCount) {
      setNewPostsCount(totalPosts - lastPostCount);
    }
  }, [postsData, lastPostCount]);

  const markAsRead = () => {
    const totalPosts = postsData?.data || 0;
    setLastPostCount(totalPosts);
    setNewPostsCount(0);
    localStorage.setItem('lastSeenPostCount', totalPosts.toString());
  };

  return { newPostsCount, markAsRead };
};
