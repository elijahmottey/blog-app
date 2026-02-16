import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Eye, Plus, Search, Filter, RefreshCw, User, MessageSquare } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Use localStorage to cache posts
  const [cachedPosts, setCachedPosts] = useLocalStorage<any>('user-posts-cache', null);
  const [lastFetchTime, setLastFetchTime] = useLocalStorage<number>('posts-last-fetch', 0);

  // Cache posts for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const { user, isAdmin } = useAuth();

  // Listen for post creation events (triggered from CreatePost component)
  useEffect(() => {
    const handlePostCreated = () => {
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
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('You are not authorized to delete this post.');
      } else if (status === 404) {
        toast.error('Post not found or already deleted.');
      } else {
        toast.error('Failed to delete post');
      }
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

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort by creation date, newest first
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, md: 2 } }}>
        {/* Header */}
        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25, fontSize: '1.125rem' }}>
                View all Posts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Find your blog post
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                  onClick={refreshPosts}
                  variant="outlined"
                  startIcon={<RefreshCw size={16} />}
                  size="small"
                  sx={{ textTransform: 'none', fontSize: '0.875rem' }}
              >
                Refresh
              </Button>
              <Button
                  component={Link}
                  to="/dashboard/posts/create"
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  size="small"
                  sx={{ textTransform: 'none', fontSize: '0.875rem' }}
              >
                Create New Post
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, alignItems: { xs: 'stretch', md: 'center' } }}>
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
                        <Search size={16} />
                      </InputAdornment>
                  ),
                  sx: { borderRadius: 1, fontSize: '0.875rem' }
                }}
            />
            <TextField
                select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: '180px', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                SelectProps={{ native: true }}
            >
              <option value="all">All Categories</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="SPIRITUAL">Spiritual</option>
              <option value="POLITICS">Politics</option>
              <option value="LEADERSHIP">Leadership</option>
              <option value="CULTURE">Culture</option>
              <option value="HEALTH">Health</option>
              <option value="BUSINESS">Business</option>
              <option value="EDUCATION">Education</option>
              <option value="SPORTS">Sports</option>
            </TextField>
          </Box>
        </Paper>



        {/* Posts List */}
        <Paper sx={{ p: 0, borderRadius: 1 }}>
          {filteredPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontSize: '0.875rem' }}>
                  {searchTerm ? 'No posts found matching your search.' : 'No posts yet.'}
                </Typography>
                {!searchTerm && (
                    <Button
                        component={Link}
                        to="/dashboard/posts/create"
                        variant="contained"
                        startIcon={<Plus size={16} />}
                        size="small"
                        sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                    >
                      Create Your First Post
                    </Button>
                )}
              </Box>
          ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {filteredPosts.map((post, index) => {
                  const isNew = post.createdAt && (new Date().getTime() - new Date(post.createdAt).getTime()) < 24 * 60 * 60 * 1000;
                  return (
                    <Box
                        key={post.id}
                        sx={{
                          p: 1.5,
                          borderBottom: 1,
                          borderColor: 'divider',
                          bgcolor: isNew ? 'primary.50' : 'background.paper',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            cursor: 'pointer'
                          },
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {/* Avatar */}
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: post.user?.avatar ? 'transparent' : 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}
                        >
                          {post.user?.avatar ? (
                            <img
                              src={post.user.avatar}
                              alt={post.user.name || 'User'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            (post.user?.name || post.users || 'A').charAt(0).toUpperCase()
                          )}
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25, flexWrap: 'wrap' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/profile/${post.user?.name || post.users}`, '_blank');
                              }}
                            >
                              {post.user?.name || post.users || 'Anonymous'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              · {post.createdAt ? format(new Date(post.createdAt), 'MMM dd') : 'Unknown'}
                            </Typography>
                            {isNew && (
                                <Chip label="New" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                            )}
                            {(!post.content || post.content.length <= 100) && (
                                <Chip label="Draft" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                            )}
                          </Box>

                          {/* Title */}
                          <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                mb: 0.25,
                                color: 'text.primary',
                                fontSize: '0.875rem'
                              }}
                          >
                            {post.title || 'Untitled Post'}
                          </Typography>

                          {/* Content Preview */}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary', 
                              mb: 0.75,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.8125rem',
                              lineHeight: 1.4
                            }}
                          >
                            {truncateContent(post.content || '', 150)}
                          </Typography>

                          {/* Actions */}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MessageSquare size={14} />
                              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                {Array.isArray(post.comments) ? post.comments.length : 0}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.25 }}>
                              <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/dashboard/posts/${post.id}`);
                                  }}
                                  sx={{ color: 'text.secondary', p: 0.5 }}
                              >
                                <Eye size={14} />
                              </IconButton>

                              {(isAdmin || post.user?.id === user?.id) && (
                                  <>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/dashboard/posts/${post.id}/edit`);
                                        }}
                                        sx={{ color: 'text.secondary', p: 0.5 }}
                                    >
                                      <Edit size={14} />
                                    </IconButton>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(post.id!);
                                        }}
                                        disabled={deleteMutation.isPending}
                                        sx={{ color: 'text.secondary', p: 0.5 }}
                                    >
                                      {deleteMutation.isPending ? (
                                          <CircularProgress size={14} />
                                      ) : (
                                          <Trash2 size={14} />
                                      )}
                                    </IconButton>
                                  </>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
          )}
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
            <Paper sx={{ p: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshCw size={14} style={{ transform: 'rotate(90deg)' }} />}
                    sx={{ textTransform: 'none', fontSize: '0.8125rem' }}
                >
                  Previous
                </Button>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
                            size="small"
                            sx={{ minWidth: '32px', fontSize: '0.8125rem' }}
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
                    size="small"
                    endIcon={<RefreshCw size={14} style={{ transform: 'rotate(-90deg)' }} />}
                    sx={{ textTransform: 'none', fontSize: '0.8125rem' }}
                >
                  Next
                </Button>
              </Box>

              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1.5, display: 'block', fontSize: '0.75rem' }}>
                Page {currentPage + 1} of {totalPages} • {totalElements} total posts
              </Typography>
            </Paper>
        )}

        {/* Summary */}
      </Box>
  );
};