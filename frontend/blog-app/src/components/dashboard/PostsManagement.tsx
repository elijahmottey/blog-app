import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Plus, Search, Filter } from 'lucide-react';
import { Button, TextField, InputAdornment, Box, Typography, Paper, IconButton, Chip, Pagination } from '@mui/material';
import BackendApi, { type PostDto } from '../../service/BackendApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import useLocalStorage from '../../hooks/useLocalStorage';
import { motion } from 'framer-motion';

export const PostsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();

  // Use localStorage to cache posts
  const [cachedPosts, setCachedPosts] = useLocalStorage<any>('user-posts-cache', null);
  const [lastFetchTime, setLastFetchTime] = useLocalStorage<number>('posts-last-fetch', 0);

  // Cache posts for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Listen for post creation events (triggered from CreatePost component)
  useEffect(() => {
    const handlePostCreated = () => {
      console.log('Post created event received, invalidating posts cache...');
      // Clear cache and refetch posts
      setCachedPosts(null);
      setLastFetchTime(0);
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
    };

    // Listen for custom event
    window.addEventListener('post-created', handlePostCreated);

    // Also listen for navigation events from create post page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to this page, refresh data
        queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('post-created', handlePostCreated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  // Fetch posts
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['user-posts-management', currentPage],
    queryFn: async () => {
      const now = Date.now();
      // Check if we have valid cached data
      if (cachedPosts &&
          lastFetchTime &&
          (now - lastFetchTime) < CACHE_DURATION &&
          cachedPosts.page === currentPage) {
        return cachedPosts.data;
      }

      // Fetch from API
      const result = await BackendApi.getAllPost(currentPage, 10);

      // Cache the result
      setCachedPosts({ page: currentPage, data: result });
      setLastFetchTime(now);

      return result;
    },
    staleTime: CACHE_DURATION,
  });

  // Function to manually refresh posts
  const refreshPosts = () => {
    queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
    setCachedPosts(null);
    setLastFetchTime(0);
    toast.info('Refreshing posts...');
  };

  const posts: PostDto[] = postsData?.data?.content || [];
  const totalPages = postsData?.data?.totalPages || 0;

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load posts</div>
          <button
              onClick={() => refreshPosts()}
              className="px-4 py-2 bg-blue-600 text-primary-foreground rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
            <p className="text-gray-600">Manage your blog posts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
                onClick={refreshPosts}
                variant="outlined"
                sx={{ mr: 1 }}
                title="Refresh posts"
            >
              Refresh
            </Button>
            <Link
                to="/dashboard/posts/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-primary-foreground rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                ),
              }}
          />
          <Button
              variant="outlined"
              startIcon={<Filter />}
          >
            Filter
          </Button>
        </Box>

        {/* Posts List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                  {searchTerm ? 'No posts found matching your search.' : 'No posts yet.'}
                </Typography>
                {!searchTerm && (
                    <Button
                        component={Link}
                        to="/dashboard/posts/create"
                        variant="contained"
                        startIcon={<Plus />}
                    >
                      Create Your First Post
                    </Button>
                )}
              </Box>
          ) : (
              filteredPosts.map((post) => (
                  <Paper key={post.id} sx={{ p: 3, '&:hover': { boxShadow: 2 }, transition: 'box-shadow 0.2s' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Link to={`/dashboard/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                          <Typography variant="h6" sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' }, mb: 1, cursor: 'pointer' }}>
                            {post.title}
                          </Typography>
                        </Link>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          {truncateContent(post.content)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', typography: 'caption', color: 'text.secondary' }}>
                          <Box>Created: {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'Unknown'}</Box>
                          <Box>Updated: {post.updatedAt ? format(new Date(post.updatedAt), 'MMM dd, yyyy') : 'Unknown'}</Box>
                          {post.comments && (
                              <Chip label={`${post.comments.length} comments`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <IconButton
                              component={Link}
                              to={`/dashboard/posts/${post.id}`}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
                              title="View Post"
                          >
                            <Eye />
                          </IconButton>
                        </motion.div>
                        {/*<IconButton*/}
                        {/*    component={Link}*/}
                        {/*    to={`/dashboard/posts/${post.id}/edit`}*/}
                        {/*    sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: 'success.light' } }}*/}
                        {/*    title="Edit Post"*/}
                        {/*>*/}
                        {/*  <Edit />*/}
                        {/*</IconButton>*/}
                        {/*<IconButton*/}
                        {/*    onClick={() => handleDelete(post.id!)}*/}
                        {/*    disabled={deleteMutation.isPending}*/}
                        {/*    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' }, '&:disabled': { opacity: 0.5 } }}*/}
                        {/*    title="Delete Post"*/}
                        {/*>*/}
                        {/*  <Trash2 />*/}
                        {/*</IconButton>*/}
                      </Box>
                    </Box>
                  </Paper>
              ))
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={(_, page) => setCurrentPage(page - 1)}
                color="primary"
                size="large"
              />
            </Box>
        )}

        {/* Stats */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Posts Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {postsData?.data?.totalElements || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Posts
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                {posts.filter(post => post.content && post.content.length > 100).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Published Posts
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                {posts.filter(post => !post.content || post.content.length <= 100).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Draft Posts
              </Typography>
            </Box>
          </Box>
        </Paper>
      </div>
  );
};