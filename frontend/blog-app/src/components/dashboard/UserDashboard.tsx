import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Heart,
  TrendingUp,
  Plus,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import {
  IconButton,
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';

export const UserDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all posts
  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['all-posts'],
    queryFn: () => BackendApi.getAllPost(),
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      // Invalidate all posts queries
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
    },
    onError: (error: any) => {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    },
  });

  const handleDelete = (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deleteMutation.mutate(postId);
    }
  };

  // Get posts from userProfile or postsData
  const userPosts = userProfile?.posts || [];
  const allPosts = postsData?.data?.content || [];

  // Combine posts - prioritize userProfile posts, fall back to all posts filtered by user
  const posts = userPosts.length > 0
      ? userPosts
      : allPosts.filter(post => post.id === user?.id);

  const userComments = userProfile?.comments || [];

  // Calculate stats
  const totalPosts = posts.length;
  const totalComments = userComments.length;
  const publishedPosts = posts.filter(post => post.content && post.content.trim().length > 0).length;
  const draftPosts = totalPosts - publishedPosts;

  // Calculate likes and views (assuming these fields exist)

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0),
      0);


  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

  if (postsLoading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
    );
  }

  if (postsError) {
    return (
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography color="error">
            Error loading posts: {(postsError as Error).message}
          </Typography>
        </Paper>
    );
  }






  // @ts-ignore
  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 } }}>
        {/* Welcome Header */}
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.light' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
            Welcome back, {user?.name || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.primary">
            Here's what's happening with your blog today.
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          '@media (max-width: 900px)': {
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'primary.50', borderRadius: 1, mr: 2 }}>
                  <FileText color="primary" size={24} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Posts</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalPosts}</Typography>
                </Box>
              </Box>
              <Chip
                  label={`${publishedPosts} published`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'success.50', borderRadius: 1, mr: 2 }}>
                  <MessageSquare color="success" size={24} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Comments</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalComments}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                From your posts
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'error.50', borderRadius: 1, mr: 2 }}>
                  <Heart color="error" size={24} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Likes</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalLikes}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Total engagement
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'warning.50', borderRadius: 1, mr: 2 }}>
                  <TrendingUp color="warning" size={24} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Views</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalViews}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Post impressions
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
            Quick Actions
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            '@media (max-width: 900px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            <Button
                component={Link}
                to="/dashboard/posts/create"
                variant="outlined"
                fullWidth
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.50'
                  }
                }}
            >
              <Plus size={32} color="#1976d2" style={{ marginBottom: 8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Create New Post
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center">
                Write and publish a new article
              </Typography>
            </Button>

            <Button
                component={Link}
                to="/dashboard/posts"
                variant="outlined"
                fullWidth
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: 'success.main',
                  '&:hover': {
                    borderColor: 'success.dark',
                    bgcolor: 'success.50'
                  }
                }}
            >
              <FileText size={32} color="#2e7d32" style={{ marginBottom: 8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Manage Posts
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center">
                Edit or delete your posts
              </Typography>
            </Button>

            <Button
                component={Link}
                to="/dashboard/comments"
                variant="outlined"
                fullWidth
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    bgcolor: 'secondary.50'
                  }
                }}
            >
              <MessageSquare size={32} color="#9c27b0" style={{ marginBottom: 8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                View Comments
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center">
                Respond to reader comments
              </Typography>
            </Button>
          </Box>
        </Paper>

        {/* Recent Posts */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Your Recent Posts
            </Typography>
            <Button
                component={Link}
                to="/dashboard/posts"
                variant="text"
                size="small"
                sx={{ fontWeight: 'bold' }}
            >
              View All
            </Button>
          </Box>

          {posts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FileText size={48} color="#9e9e9e" style={{ marginBottom: 16 }} />
                <Typography color="text.secondary">No posts yet. Create your first post!</Typography>
                <Button
                    component={Link}
                    to="/dashboard/posts/create"
                    variant="contained"
                    sx={{ mt: 2 }}
                >
                  Create First Post
                </Button>
              </Box>
          ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posts.slice(0, 5).map((post) => (
                    <Paper
                        key={post.id}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FileText size={20} color="#757575" />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {post.title || 'Untitled Post'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {post.content ? `${post.content.substring(0, 80)}...` : 'No content yet'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                              component={Link}
                              to={`/dashboard/posts/${post.id}`}
                              size="small"
                              sx={{ color: 'primary.main' }}
                              title="View Post"
                          >
                            <FileText size={18} />
                          </IconButton>
                          <IconButton
                              component={Link}
                              to={`/dashboard/posts/${post.id}/edit`}
                              size="small"
                              sx={{ color: 'success.main' }}
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
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1, pl: 4 }}>
                        <Chip

                            label={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date'}
                            size="small"
                            variant="outlined"
                        />
                        {/*{post.likes > 0 && (*/}
                        {/*    <Chip*/}
                        {/*        label={`${post.likes} likes`}*/}
                        {/*        size="small"*/}
                        {/*        color="error"*/}
                        {/*        variant="outlined"*/}
                        {/*    />*/}
                        {/*)}*/}
                        {/*{post.views > 0 && (*/}
                        {/*    <Chip*/}
                        {/*        label={`${post.views} views`}*/}
                        {/*        size="small"*/}
                        {/*        color="info"*/}
                        {/*        variant="outlined"*/}
                        {/*    />*/}
                        {/*)}*/}
                      </Box>
                    </Paper>
                ))}
              </Box>
          )}
        </Paper>

        {/* Draft Posts */}
        {draftPosts > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'warning.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={20} color="#ed6c02" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                    Draft Posts ({draftPosts})
                  </Typography>
                </Box>
                <Button
                    component={Link}
                    to="/dashboard/posts?filter=drafts"
                    variant="text"
                    size="small"
                    sx={{ fontWeight: 'bold', color: 'warning.dark' }}
                >
                  View All Drafts
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posts
                    .filter(post => !post.content || post.content.trim().length === 0)
                    .slice(0, 3)
                    .map((post) => (
                        <Paper
                            key={post.id}
                            sx={{
                              p: 2,
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'warning.light',
                              bgcolor: 'warning.50',
                              '&:hover': {
                                bgcolor: 'warning.100'
                              }
                            }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Clock size={20} color="#ed6c02" />
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {post.title || 'Untitled Draft'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Last modified: {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown'}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                                component={Link}
                                to={`/dashboard/posts/${post.id}/edit`}
                                variant="contained"
                                size="small"
                                sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                            >
                              Continue editing
                            </Button>
                          </Box>
                        </Paper>
                    ))}
              </Box>
            </Paper>
        )}
      </Box>
  );
};