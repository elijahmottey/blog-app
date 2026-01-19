import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Eye, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import {
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import BackendApi, { type PostDto } from '../../service/BackendApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import useLocalStorage from '../../hooks/useLocalStorage';
import {useAuth} from "../../context/AuthContext.tsx";

export const PostsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();

  // Use localStorage to cache posts
  const [cachedPosts, setCachedPosts] = useLocalStorage<any>('user-posts-cache', null);
  const [lastFetchTime, setLastFetchTime] = useLocalStorage<number>('posts-last-fetch', 0);

  // Cache posts for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const { isAdmin } = useAuth();

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
  const {
    data: postsData,
    isLoading,
    error,
    refetch
  } = useQuery({
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

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      // Invalidate all posts queries
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      // Clear cache when post is deleted
      setCachedPosts(null);
      setLastFetchTime(0);
    },
    onError: (error: any) => {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    },
  });

  // Function to manually refresh posts
  const refreshPosts = () => {
    queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
    setCachedPosts(null);
    setLastFetchTime(0);
    toast.info('Refreshing posts...');
    refetch();
  };

  const posts: PostDto[] = postsData?.data?.content || [];
  const totalPages = postsData?.data?.totalPages || 0;
  const totalElements = postsData?.data?.totalElements || 0;

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deleteMutation.mutate(postId);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load posts: {(error as Error).message}
          </Alert>
          <Button
              onClick={() => refreshPosts()}
              variant="contained"
              startIcon={<RefreshCw />}
          >
            Try Again
          </Button>
        </Box>
    );
  }

  // @ts-ignore
  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                View all Posts
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find your blog post
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                  onClick={refreshPosts}
                  variant="outlined"
                  startIcon={<RefreshCw />}
                  sx={{ textTransform: 'none' }}
              >
                Refresh
              </Button>
              <Button
                  component={Link}
                  to="/dashboard/posts/create"
                  variant="contained"
                  startIcon={<Plus />}
                  sx={{ textTransform: 'none' }}
              >
                Create New Post
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Search and Filter */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' } }}>
            <TextField
                placeholder="Search posts by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
            />
            <Button
                variant="outlined"
                startIcon={<Filter />}
                sx={{ minWidth: '120px', textTransform: 'none' }}
            >
              Filter
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                {totalElements}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Posts
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                {posts.filter(post => post.content && post.content.length > 100).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Published Posts
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 'bold', mb: 1 }}>
                {posts.filter(post => !post.content || post.content.length <= 100).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Draft Posts
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Posts List */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
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
                        sx={{ textTransform: 'none' }}
                    >
                      Create Your First Post
                    </Button>
                )}
              </Box>
          ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredPosts.map((post) => (
                    <Paper
                        key={post.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 1
                          },
                          transition: 'all 0.2s'
                        }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {(!post.content || post.content.length <= 100) && (
                                <Chip label="Draft" size="small" color="warning" variant="outlined" />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                            </Typography>
                          </Box>

                          <Link to={`/dashboard/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                  color: 'text.primary',
                                  '&:hover': { color: 'primary.main' },
                                  mb: 1,
                                  fontWeight: 600
                                }}
                            >
                              {post.title || 'Untitled Post'}
                            </Typography>
                          </Link>

                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            {truncateContent(post.content || '')}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                                label={`${post.comments?.length || 0} comments`}
                                size="small"
                                variant="outlined"
                                color="info"
                            />
                            {/*@ts-ignore*/}
                            {post.likes > 0 && (
                                <Chip
                                    label={`${post.likes} likes`}
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                />
                            )}
                            {/*@ts-ignore*/}
                            {post.views > 0 && (
                                <Chip
                                    label={`${post.views} views`}
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                          <IconButton
                              component={Link}
                              to={`/dashboard/posts/${post.id}`}
                              size="small"
                              sx={{
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.50' }
                              }}
                              title="View Post"
                          >
                            <Eye size={18} />
                          </IconButton>

                          {isAdmin && (
                              <>
                                <IconButton
                                    component={Link}
                                    to={`/dashboard/posts/${post.id}/edit`}
                                    size="small"
                                    sx={{
                                      color: 'success.main',
                                      '&:hover': { bgcolor: 'success.50' }
                                    }}
                                    title="Edit Post"
                                >
                                  <Edit size={18} />
                                </IconButton>

                                <IconButton
                                    onClick={() => handleDelete(post.id!)}
                                    disabled={deleteMutation.isPending}
                                    size="small"
                                    sx={{
                                      color: 'error.main',
                                      '&:hover': { bgcolor: 'error.50' },
                                      '&:disabled': { opacity: 0.5 }
                                    }}
                                    title="Delete Post"
                                >
                                  {deleteMutation.isPending ? (
                                      <CircularProgress size={18} />
                                  ) : (
                                      <Trash2 size={18} />
                                  )}
                                </IconButton>
                              </>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                ))}
              </Box>
          )}
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    variant="outlined"
                    startIcon={<RefreshCw style={{ transform: 'rotate(90deg)' }} />}
                    sx={{ textTransform: 'none' }}
                >
                  Previous
                </Button>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i;
                    } else if (currentPage < 3) {
                      pageNumber = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNumber = totalPages - 5 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                        <Button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            variant={currentPage === pageNumber ? 'contained' : 'outlined'}
                            sx={{ minWidth: '40px' }}
                        >
                          {pageNumber + 1}
                        </Button>
                    );
                  })}
                </Box>

                <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    variant="outlined"
                    endIcon={<RefreshCw style={{ transform: 'rotate(-90deg)' }} />}
                    sx={{ textTransform: 'none' }}
                >
                  Next
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Page {currentPage + 1} of {totalPages} • {totalElements} total posts
              </Typography>
            </Paper>
        )}

        {/* Summary */}
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
            📊 Quick Summary
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            '@media (max-width: 600px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            }
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {filteredPosts.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                {posts.filter(p => p.comments && p.comments.length > 0).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                With Comments
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                {posts.filter(p => !p.updatedAt || p.updatedAt === p.createdAt).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Never Edited
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                {deleteMutation.isPending ? 0 : 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Deleted Today
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
  );
};