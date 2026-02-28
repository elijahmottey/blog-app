import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  Heart,
  TrendingUp,
  Plus,
  Clock,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  User
} from 'lucide-react';
import {
  IconButton,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  TextField,
  Avatar
} from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';
import { LIVBlogCard, LIVBlogLayout } from '../ui';
import { useTheme, alpha } from '@mui/material/styles';
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";

export const UserDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileDescription, setProfileDescription] = useState('');
  useDocumentTitle('LIVBlog | Dashboard');

  // Check if profile needs completion on component mount
  useEffect(() => {
    const profileCompleted = localStorage.getItem('user_profile_completed');
    if (user && !profileCompleted && (!user.description || user.description.trim() === '' || user.description === 'No description provided')) {
      setShowProfilePopup(true);
    }
  }, [user]);

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

  const updateProfileMutation = useMutation({
    mutationFn: (description: string) => {
      if (!user?.id) throw new Error('User ID not found');
      return BackendApi.updateUser(user.id, { description });
    },
    onSuccess: () => {
      localStorage.setItem('user_profile_completed', 'true');
      setShowProfilePopup(false);
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });

  const handleProfileSave = () => {
    if (!profileDescription.trim()) return;
    updateProfileMutation.mutate(profileDescription);
  };

  const handleProfileSkip = () => {
    setShowProfilePopup(false);
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
    <div style={{ padding: window.innerWidth < 768 ? '16px' : '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Profile Completion Popup */}
      <Dialog 
        open={showProfilePopup}
        onClose={handleProfileSkip}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent style={{ padding: '32px', textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto 16px',
              bgcolor: theme.palette.primary.main,
              fontSize: '2rem'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User />}
          </Avatar>
          
          <Typography variant="h4" style={{ fontWeight: 700, marginBottom: '8px' }}>
            Complete Your Profile
          </Typography>
          
          <Typography variant="body1" style={{ marginBottom: '24px', color: theme.palette.text.secondary }}>
            Help readers get to know you better by adding a description to your profile.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Tell us about yourself, your interests, and what you love to write about..."
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            variant="outlined"
            style={{ marginBottom: '24px' }}
          />
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button
              onClick={handleProfileSave}
              variant="contained"
              disabled={!profileDescription.trim() || updateProfileMutation.isPending}
              style={{ borderRadius: '8px' }}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button
              onClick={handleProfileSkip}
              variant="outlined"
              style={{ borderRadius: '8px' }}
            >
              Skip for now
            </Button>
          </div>
          
          <Typography variant="caption" style={{ display: 'block', marginTop: '16px', color: theme.palette.text.disabled }}>
            You can always update this later in your profile settings
          </Typography>
        </DialogContent>
      </Dialog>
      {/* Welcome Header */}
      <LIVBlogCard 
        variant="glass" 
        padding="xl"
        style={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            margin: '0 0 12px 0',
            background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'rgba(255,255,255,0.9)', 
            margin: 0,
            lineHeight: 1.6
          }}>
            Here's what's happening with your blog today. Keep creating amazing content!
          </p>
        </div>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
      </LIVBlogCard>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {[
          {
            title: 'Total Posts',
            value: totalPosts,
            subtitle: `${publishedPosts} published`,
            icon: FileText,
            color: theme.palette.primary.main,
            trend: '+12%'
          },
          {
            title: 'Comments Received',
            value: totalComments,
            subtitle: 'From your posts',
            icon: MessageSquare,
            color: theme.palette.success.main,
            trend: '+8%'
          },
          {
            title: 'Total Likes',
            value: totalLikes,
            subtitle: 'Total engagement',
            icon: Heart,
            color: theme.palette.error.main,
            trend: '+15%'
          },
          {
            title: 'Total Views',
            value: totalViews,
            subtitle: 'Post impressions',
            icon: Eye,
            color: theme.palette.warning.main,
            trend: '+5%'
          },
        ].map((stat) => (
          <LIVBlogCard
            key={stat.title}
            variant="elevated"
            padding="large"
            hoverable
            style={{
              background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)}, ${alpha(stat.color, 0.02)})`,
              borderLeft: `4px solid ${stat.color}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: alpha(stat.color, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: theme.palette.success.main,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}
              >
                {stat.trend}
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: theme.palette.text.primary,
                lineHeight: 1.2,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                marginBottom: '4px'
              }}>
                {stat.title}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: theme.palette.text.secondary
              }}>
                {stat.subtitle}
              </div>
            </div>
          </LIVBlogCard>
        ))}
      </div>

      {/* Quick Actions */}
      <LIVBlogCard 
        title="Quick Actions" 
        subtitle="Get started with these common tasks"
        variant="elevated" 
        padding="large"
        style={{ marginBottom: '32px' }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: window.innerWidth < 768 ? '16px' : '20px',
          marginBottom: window.innerWidth < 768 ? '24px' : '32px'
        }}>
          {[
            {
              title: 'Create New Post',
              subtitle: 'Write and publish a new article',
              icon: Plus,
              color: theme.palette.primary.main,
              link: '/dashboard/posts/create'
            },
            {
              title: 'Manage Posts',
              subtitle: 'Edit or delete your existing posts',
              icon: FileText,
              color: theme.palette.success.main,
              link: '/dashboard/posts'
            },
            {
              title: 'View Analytics',
              subtitle: 'Check your content performance',
              icon: BarChart3,
              color: theme.palette.info.main,
              link: '/dashboard/analytics'
            },
            {
              title: 'Manage Comments',
              subtitle: 'Respond to reader comments',
              icon: MessageSquare,
              color: theme.palette.secondary.main,
              link: '/dashboard/comments'
            },
          ].map((action) => (
            <Button
              key={action.title}
              component={Link}
              to={action.link}
              variant="outlined"
              style={{
                padding: '24px',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: '16px',
                borderColor: alpha(action.color, 0.3),
                backgroundColor: alpha(action.color, 0.05),
                borderRadius: '12px',
                textTransform: 'none',
                transition: 'all 0.2s ease'
              }}
              sx={{
                '&:hover': {
                  borderColor: action.color,
                  backgroundColor: alpha(action.color, 0.1),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(action.color, 0.15)}`
                }
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: alpha(action.color, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <action.icon size={24} style={{ color: action.color }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  color: theme.palette.text.primary,
                  marginBottom: '4px'
                }}>
                  {action.title}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: theme.palette.text.secondary,
                  lineHeight: 1.4
                }}>
                  {action.subtitle}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </LIVBlogCard>

      {/* Recent Posts */}
      <LIVBlogCard 
        title="Your Recent Posts" 
        subtitle={`Manage your ${totalPosts} posts`}
        variant="elevated" 
        padding="large"
        style={{ marginBottom: '32px' }}
        actions={
          <Button 
            component={Link} 
            to="/dashboard/posts" 
            variant="outlined" 
            size="small"
            startIcon={<Eye size={16} />}
          >
            View All Posts
          </Button>
        }
      >
        {userProfile?.posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}
            >
              <FileText size={40} style={{ color: theme.palette.primary.main }} />
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: theme.palette.text.primary, 
              margin: '0 0 8px 0' 
            }}>
              No posts yet
            </h3>
            <p style={{ 
              color: theme.palette.text.secondary, 
              margin: '0 0 24px 0',
              fontSize: '0.875rem'
            }}>
              Start your blogging journey by creating your first post!
            </p>
            <Button 
              component={Link} 
              to="/dashboard/posts/create" 
              variant="contained" 
              size="large"
              startIcon={<Plus size={20} />}
              style={{
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              Create First Post
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userProfile?.posts.slice(0, 5).map((post) => (
              <LIVBlogCard 
                key={post.id} 
                variant="outlined" 
                padding="medium" 
                hoverable
                style={{
                  transition: 'all 0.2s ease',
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FileText size={20} style={{ color: theme.palette.primary.main }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        margin: '0 0 4px 0',
                        color: theme.palette.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {post.title || 'Untitled Post'}
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: theme.palette.text.secondary, 
                        margin: '0 0 8px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {post.content ? `${post.content.substring(0, 80)}...` : 'No content yet'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Chip
                          label={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date'}
                          size="small"
                          variant="outlined"
                          style={{ fontSize: '0.75rem' }}
                        />
                        {post.content && post.content.trim().length > 0 ? (
                          <Chip
                            label="Published"
                            size="small"
                            color="success"
                            variant="outlined"
                            style={{ fontSize: '0.75rem' }}
                          />
                        ) : (
                          <Chip
                            label="Draft"
                            size="small"
                            color="warning"
                            variant="outlined"
                            style={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <IconButton 
                      component={Link} 
                      to={`/dashboard/posts/${post.id}`} 
                      size="small"
                      style={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton 
                      component={Link} 
                      to={`/dashboard/posts/${post.id}/edit`} 
                      size="small"
                      style={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main
                      }}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(post.id!)} 
                      disabled={deleteMutation.isPending} 
                      size="small"
                      style={{
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main
                      }}
                    >
                      {deleteMutation.isPending ? <CircularProgress size={16} /> : <Trash2 size={16} />}
                    </IconButton>
                  </div>
                </div>
              </LIVBlogCard>
            ))}
          </div>
        )}
      </LIVBlogCard>

      {/* Draft Posts Section */}
      {draftPosts > 0 && (
        <LIVBlogCard 
          title={`Draft Posts (${draftPosts})`}
          subtitle="Continue working on your unfinished posts"
          variant="outlined"
          padding="large"
          style={{ 
            backgroundColor: alpha(theme.palette.warning.main, 0.05),
            borderColor: alpha(theme.palette.warning.main, 0.3),
            borderLeft: `4px solid ${theme.palette.warning.main}`
          }}
          actions={
            <Button 
              component={Link} 
              to="/dashboard/posts?filter=drafts" 
              variant="outlined" 
              size="small"
              style={{
                borderColor: theme.palette.warning.main,
                color: theme.palette.warning.main
              }}
            >
              View All Drafts
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts
              .filter(post => !post.content || post.content.trim().length === 0)
              .slice(0, 3)
              .map((post) => (
                <LIVBlogCard 
                  key={post.id} 
                  variant="outlined" 
                  padding="medium" 
                  hoverable
                  style={{
                    backgroundColor: alpha(theme.palette.warning.main, 0.02),
                    borderColor: alpha(theme.palette.warning.main, 0.2)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: alpha(theme.palette.warning.main, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Clock size={20} style={{ color: theme.palette.warning.main }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          margin: '0 0 4px 0',
                          color: theme.palette.text.primary
                        }}>
                          {post.title || 'Untitled Draft'}
                        </h4>
                        <p style={{ 
                          fontSize: '0.875rem',
                          color: theme.palette.text.secondary, 
                          margin: 0
                        }}>
                          Last modified: {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Button
                      component={Link}
                      to={`/dashboard/posts/${post.id}/edit`}
                      variant="contained"
                      size="small"
                      startIcon={<Edit size={16} />}
                      style={{
                        backgroundColor: theme.palette.warning.main,
                        color: 'white',
                        borderRadius: '8px'
                      }}
                    >
                      Continue Editing
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