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
  Typography,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';
import {  LIVBlogCard, LIVBlogLayout } from '../ui';
import { useTheme } from '@mui/material/styles';

export const UserDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['all-posts'],
    queryFn: () => BackendApi.getAllPost(),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
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

  const userPosts = userProfile?.posts || [];
  const allPosts = postsData?.data?.content || [];
  const posts = userPosts.length > 0 ? userPosts : allPosts.filter(post => post.id === user?.id);
  const userComments = userProfile?.comments || [];

  const totalPosts = posts.length;
  const totalComments = userComments.length;
  const publishedPosts = posts.filter(post => post.content && post.content.trim().length > 0).length;
  const draftPosts = totalPosts - publishedPosts;
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
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
      <LIVBlogCard variant="outlined" padding="medium">
        <Typography style={{ color: theme.palette.error.main }}>
          Error loading posts: {(postsError as Error).message}
        </Typography>
      </LIVBlogCard>
    );
  }

  return (
    <div className="aws-spacing-y-lg">
      <LIVBlogCard 
        variant="elevated" 
        padding="medium" 
        className="aws-margin-b-lg"
        style={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}
      >
        <h1 className="aws-header-lg" style={{ color: 'white', margin: 0 }}>
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="aws-text-body-lg" style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          Here's what's happening with your blog today.
        </p>
      </LIVBlogCard>

      <LIVBlogLayout.Grid cols={4} gap="lg" className="aws-margin-b-lg">
        <LIVBlogCard title="Total Posts" padding="medium" className="aws-min-h-card-sm">
          <div className="text-center">
            <div className="aws-header-lg" style={{ color: theme.palette.primary.main, margin: '0 0 8px 0' }}>
              {totalPosts}
            </div>
            <Chip label={`${publishedPosts} published`} size="small" color="success" variant="outlined" />
          </div>
        </LIVBlogCard>

        <LIVBlogCard title="Comments" padding="medium" className="aws-min-h-card-sm">
          <div className="text-center">
            <div className="aws-header-lg" style={{ color: theme.palette.success.main, margin: '0 0 8px 0' }}>
              {totalComments}
            </div>
            <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0 }}>
              From your posts
            </p>
          </div>
        </LIVBlogCard>

        <LIVBlogCard title="Likes" padding="medium" className="aws-min-h-card-sm">
          <div className="text-center">
            <div className="aws-header-lg" style={{ color: theme.palette.error.main, margin: '0 0 8px 0' }}>
              {totalLikes}
            </div>
            <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0 }}>
              Total engagement
            </p>
          </div>
        </LIVBlogCard>

        <LIVBlogCard title="Views" padding="medium" className="aws-min-h-card-sm">
          <div className="text-center">
            <div className="aws-header-lg" style={{ color: theme.palette.warning.main, margin: '0 0 8px 0' }}>
              {totalViews}
            </div>
            <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0 }}>
              Post impressions
            </p>
          </div>
        </LIVBlogCard>
      </LIVBlogLayout.Grid>

      <LIVBlogCard title="Quick Actions" padding="medium" className="aws-margin-b-lg">
        <LIVBlogLayout.Grid cols={3} gap="md">
          <Button
            component={Link}
            to="/dashboard/posts/create"
            variant="outlined"
            className="aws-button aws-button-secondary aws-min-h-card-sm"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main
            }}
          >
            <Plus size={32} />
            <div>
              <div className="aws-text-body" style={{ fontWeight: 600 }}>Create New Post</div>
              <div className="aws-text-body" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                Write and publish a new article
              </div>
            </div>
          </Button>

          <Button
            component={Link}
            to="/dashboard/posts"
            variant="outlined"
            className="aws-button aws-button-secondary aws-min-h-card-sm"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main
            }}
          >
            <FileText size={32} />
            <div>
              <div className="aws-text-body" style={{ fontWeight: 600 }}>Manage Posts</div>
              <div className="aws-text-body" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                Edit or delete your posts
              </div>
            </div>
          </Button>

          <Button
            component={Link}
            to="/dashboard/comments"
            variant="outlined"
            className="aws-button aws-button-secondary aws-min-h-card-sm"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main
            }}
          >
            <MessageSquare size={32} />
            <div>
              <div className="aws-text-body" style={{ fontWeight: 600 }}>View Comments</div>
              <div className="aws-text-body" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                Respond to reader comments
              </div>
            </div>
          </Button>
        </LIVBlogLayout.Grid>
      </LIVBlogCard>

      <LIVBlogCard 
        title="Your Recent Posts" 
        padding="medium" 
        className="aws-margin-b-lg"
        actions={
          <Button component={Link} to="/dashboard/posts" variant="text" size="small" className="aws-button">
            View All
          </Button>
        }
      >
        {userProfile?.posts.length === 0 ? (
          <div className="text-center aws-spacing-y-xl">
            <FileText size={48} style={{ color: theme.palette.text.secondary, margin: '0 auto 16px' }} />
            <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: '0 0 16px 0' }}>
              No posts yet. Create your first post!
            </p>
            <Button component={Link} to="/dashboard/posts/create" variant="contained" className="aws-button aws-button-primary">
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {userProfile?.posts.slice(0, 5).map((post) => (
              <LIVBlogCard key={post.id} variant="outlined" padding="small" hoverable>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} style={{ color: theme.palette.text.secondary }} />
                    <div>
                      <h4 className="aws-text-body" style={{ fontWeight: 600, margin: 0 }}>
                        {post.title || 'Untitled Post'}
                      </h4>
                      <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0 }}>
                        {post.content ? `${post.content.substring(0, 80)}...` : 'No content yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <IconButton component={Link} to={`/dashboard/posts/${post.id}`} size="small">
                      <FileText size={18} />
                    </IconButton>
                    <IconButton component={Link} to={`/dashboard/posts/${post.id}/edit`} size="small">
                      <Edit size={18} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(post.id!)} disabled={deleteMutation.isPending} size="small">
                      {deleteMutation.isPending ? <CircularProgress size={18} /> : <Trash2 size={18} />}
                    </IconButton>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 pl-8">
                  <Chip
                    label={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date'}
                    size="small"
                    variant="outlined"
                  />
                </div>
              </LIVBlogCard>
            ))}
          </div>
        )}
      </LIVBlogCard>

      {draftPosts > 0 && (
        <LIVBlogCard 
          title={`Draft Posts (${draftPosts})`} 
          padding="medium"
          variant="outlined"
          style={{ backgroundColor: theme.palette.warning.light + '20' }}
          actions={
            <Button component={Link} to="/dashboard/posts?filter=drafts" variant="text" size="small" className="aws-button">
              View All Drafts
            </Button>
          }
        >
          <div className="space-y-3">
            {posts
              .filter(post => !post.content || post.content.trim().length === 0)
              .slice(0, 3)
              .map((post) => (
                <LIVBlogCard key={post.id} variant="outlined" padding="small" hoverable>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock size={20} style={{ color: theme.palette.warning.main }} />
                      <div>
                        <h4 className="aws-text-body" style={{ fontWeight: 600, margin: 0 }}>
                          {post.title || 'Untitled Draft'}
                        </h4>
                        <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0 }}>
                          Last modified: {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Button
                      component={Link}
                      to={`/dashboard/posts/${post.id}/edit`}
                      variant="contained"
                      size="small"
                      className="aws-button aws-button-primary"
                    >
                      Continue editing
                    </Button>
                  </div>
                </LIVBlogCard>
              ))}
          </div>
        </LIVBlogCard>
      )}
    </div>
  );
};