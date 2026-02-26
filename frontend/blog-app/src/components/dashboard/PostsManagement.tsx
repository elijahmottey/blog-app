import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Eye, Plus, Search, RefreshCw, MessageSquare } from 'lucide-react';
import {
  Button,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import BackendApi, { type PostDto } from '../../service/BackendApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useAuth } from "../../context/AuthContext.tsx";
import {LIVBlogCard, LIVBlogHeader} from '../ui';
import { useTheme } from '@mui/material/styles';

export const PostsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();

  const [cachedPosts, setCachedPosts] = useLocalStorage<any>('user-posts-cache', null);
  const [lastFetchTime, setLastFetchTime] = useLocalStorage<number>('posts-last-fetch', 0);
  const CACHE_DURATION = 5 * 60 * 1000;
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handlePostCreated = () => {
      setCachedPosts(null);
      setLastFetchTime(0);
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      }
    };

    window.addEventListener('post-created', handlePostCreated);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('post-created', handlePostCreated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  const { data: postsData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-posts-management', currentPage],
    queryFn: async () => {
      const now = Date.now();
      if (cachedPosts && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION && cachedPosts.page === currentPage) {
        return cachedPosts.data;
      }
      const result = await BackendApi.getAllPost(currentPage, 10);
      setCachedPosts({ page: currentPage, data: result });
      setLastFetchTime(now);
      return result;
    },
    staleTime: CACHE_DURATION,
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      setCachedPosts(null);
      setLastFetchTime(0);
    },
    onError: (error: any) => {
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
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

  const extractFirstImage = (content: string) => {
    if (!content) return null;
    const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    return imageMatch ? { alt: imageMatch[1] || 'Image', url: imageMatch[2] } : null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <LIVBlogCard variant="outlined" padding="large" className="text-center">
        <Typography style={{ color: theme.palette.error.main, marginBottom: '16px' }}>
          Failed to load posts: {(error as Error).message}
        </Typography>
        <Button onClick={refreshPosts} variant="contained" className="aws-button aws-button-primary">
          <RefreshCw size={16} style={{ marginRight: '8px' }} />
          Try Again
        </Button>
      </LIVBlogCard>
    );
  }

  return (
    <div className="aws-spacing-y-sm">

      <LIVBlogCard padding="medium" className="aws-margin-b-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            placeholder="Search posts by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            size="small"
            className="aws-font"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            variant="outlined"
            size="small"
            className="aws-font"
            style={{ minWidth: '180px' }}
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
        </div>
        <Button onClick={refreshPosts} variant="outlined" className="aws-button aws-button-secondary">
          <RefreshCw size={10} style={{ marginTop: '4px' }} />
          Refresh
        </Button>
      </LIVBlogCard>

      <LIVBlogCard padding="none">
        {filteredPosts.length === 0 ? (
          <div className="text-center aws-spacing-y-xl">
            <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: '0 0 16px 0' }}>
              {searchTerm ? 'No posts found matching your search.' : 'No posts yet.'}
            </p>
            {!searchTerm && (
              <Button component={Link} to="/dashboard/posts/create" variant="contained" className="aws-button aws-button-primary">
                <Plus size={16} style={{ marginRight: '8px' }} />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredPosts.map((post, index) => {
              const isNew = post.createdAt && (new Date().getTime() - new Date(post.createdAt).getTime()) < 24 * 60 * 60 * 1000;
              return (
                <div
                  key={post.id}
                  className="aws-spacing-md cursor-pointer transition-colors"
                  style={{
                    borderBottom: index < filteredPosts.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    backgroundColor: isNew ? theme.palette.primary.light + '10' : 'transparent'
                  }}
                  onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.palette.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isNew ? theme.palette.primary.light + '10' : 'transparent';
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: post.user?.avatar ? 'transparent' : theme.palette.primary.main,
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
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        (post.user?.name || post.users || 'A').charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {post.user?.name || post.users || 'Anonymous'}
                        </span>
                        <span className="aws-text-body" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                          · {post.createdAt ? format(new Date(post.createdAt), 'MMM dd') : 'Unknown'}
                        </span>
                        {isNew && <Chip label="New" size="small" color="primary" style={{ height: '18px', fontSize: '0.65rem' }} />}
                        {(!post.content || post.content.length <= 100) && (
                          <Chip label="Draft" size="small" color="warning" variant="outlined" style={{ height: '18px', fontSize: '0.65rem' }} />
                        )}
                      </div>

                      <h4 className="aws-text-body" style={{ fontWeight: 600, margin: '0 0 4px 0', color: theme.palette.text.primary }}>
                        {post.title || 'Untitled Post'}
                      </h4>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: '0 0 12px 0', fontSize: '0.8125rem' }}>
                            {truncateContent(post.content || '', 150)}
                          </p>
                        </div>
                        {extractFirstImage(post.content || '') && (
                          <img
                            src={extractFirstImage(post.content || '')!.url}
                            alt={extractFirstImage(post.content || '')!.alt}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={14} style={{ color: theme.palette.text.secondary }} />
                          <span className="aws-text-body" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                            {Array.isArray(post.comments) ? post.comments.length : 0}
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/posts/${post.id}`);
                            }}
                            style={{ color: theme.palette.text.secondary, padding: '4px' }}
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
                                style={{ color: theme.palette.text.secondary, padding: '4px' }}
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
                                style={{ color: theme.palette.text.secondary, padding: '4px' }}
                              >
                                {deleteMutation.isPending ? <CircularProgress size={14} /> : <Trash2 size={14} />}
                              </IconButton>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </LIVBlogCard>

      {totalPages > 1 && (
        <LIVBlogCard padding="medium">
          <div className="flex justify-center items-center gap-3">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              variant="outlined"
              size="small"
              className="aws-button aws-button-secondary"
            >
              Previous
            </Button>

            <div className="flex gap-1">
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
                    className={currentPage === pageNumber ? 'aws-button aws-button-primary' : 'aws-button aws-button-secondary'}
                    style={{ minWidth: '32px' }}
                  >
                    {pageNumber + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              variant="outlined"
              size="small"
              className="aws-button aws-button-secondary"
            >
              Next
            </Button>
          </div>

          <p className="aws-text-body text-center" style={{ color: theme.palette.text.secondary, margin: '12px 0 0 0', fontSize: '0.75rem' }}>
            Page {currentPage + 1} of {totalPages} • {totalElements} total posts
          </p>
        </LIVBlogCard>
      )}
    </div>
  );
};