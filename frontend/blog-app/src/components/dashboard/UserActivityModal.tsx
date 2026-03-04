import React from 'react';
import { X, FileText, MessageSquare, Eye, ThumbsUp, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTheme, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import BackendApi, { type UserDto } from '../../service/BackendApi';

interface UserActivityModalProps {
  user: UserDto;
  onClose: () => void;
}

export const UserActivityModal: React.FC<UserActivityModalProps> = ({ user, onClose }) => {
  const theme = useTheme();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user-details', user.id],
    queryFn: async () => {
      if (!user.id) throw new Error('User ID required');
      const response = await BackendApi.getUserById(user.id);
      return response;
    },
    enabled: !!user.id,
  });

  // Extract posts and comments from user data
  //@ts-ignore
  const userPosts = userData?.data?.posts || [];
    //@ts-ignore
  const userComments = userData?.data?.comments || [];
  
  // Get drafts count from localStorage
  const getDraftsCount = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      return drafts.length;
    } catch {
      return 0;
    }
  };
  
  const draftsCount = getDraftsCount();

  // Calculate total views and likes from posts
  const totalViews = Array.isArray(userPosts) ? userPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0) : 0;
  const totalLikes = Array.isArray(userPosts) ? userPosts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0) : 0;

  const stats = {
    totalPosts: Array.isArray(userPosts) ? userPosts.length : 0,
    totalComments: Array.isArray(userComments) ? userComments.length : 0,
    publishedPosts: Array.isArray(userPosts) ? userPosts.filter((post: any) => post.content && post.content.length > 0).length : 0,
    draftPosts: draftsCount,
    totalViews: totalViews,
    totalLikes: totalLikes,
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 12,
        padding: 24,
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        boxShadow: theme.shadows[4],
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.text.primary, margin: 0 }}>
              User Activity: {user.name}
            </h2>
            <p style={{ color: theme.palette.text.secondary, margin: '4px 0 0 0' }}>{user.email}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              color: theme.palette.text.secondary,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Description Section */}
        {user.description && (
          <div style={{ marginBottom: 24, padding: 16, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 8 }}>About</h4>
            <p style={{ fontSize: '0.875rem', color: theme.palette.text.secondary, margin: 0, lineHeight: 1.6 }}>
              {user.description}
            </p>
          </div>
        )}

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {[
            { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: theme.palette.primary.main },
            { label: 'Published', value: stats.publishedPosts, icon: Eye, color: theme.palette.success.main },
            { label: 'Drafts', value: stats.draftPosts, icon: FileText, color: theme.palette.warning.main },
            { label: 'Comments', value: stats.totalComments, icon: MessageSquare, color: theme.palette.secondary.main },
            { label: 'Total Views', value: stats.totalViews, icon: Eye, color: theme.palette.info.main },
            { label: 'Total Likes', value: stats.totalLikes, icon: ThumbsUp, color: theme.palette.error.main },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: alpha(stat.color, 0.1),
              border: `1px solid ${alpha(stat.color, 0.2)}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <stat.icon size={16} style={{ color: stat.color }} />
                <span style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Posts */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>
            Recent Posts ({Array.isArray(userPosts) ? userPosts.length : 0})
          </h3>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {Array.isArray(userPosts) && userPosts.length > 0 ? (
              userPosts.slice(0, 5).map((post: any) => (
                <div key={post.id} style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: theme.palette.background.default,
                  marginBottom: 8,
                  border: `1px solid ${theme.palette.divider}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary, margin: '0 0 4px 0' }}>
                        {post.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, margin: 0 }}>
                        {post.content ? `${post.content.substring(0, 100)}...` : 'No content'}
                      </p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={12} /> {post.views || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsUp size={12} /> {post.likes || 0}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, marginLeft: 12 }}>
                      {post.createdAt ? format(new Date(post.createdAt), 'MMM dd') : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>No posts found</p>
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>
            Recent Comments ({Array.isArray(userComments) ? userComments.length : 0})
          </h3>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {Array.isArray(userComments) && userComments.length > 0 ? (
              userComments.slice(0, 5).map((comment: any) => (
                <div key={comment.id} style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: theme.palette.background.default,
                  marginBottom: 8,
                  border: `1px solid ${theme.palette.divider}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: theme.palette.text.primary, margin: '0 0 4px 0' }}>
                        {comment.content}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, margin: 0 }}>
                        On post: {comment.posts || 'Unknown'}
                      </p>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, marginLeft: 12 }}>
                      {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd') : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>No comments found</p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 8,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 8 }}>
            Account Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>User ID: </span>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>{user.id}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>Roles: </span>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                {user.roles?.join(', ') || 'USER'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>Joined: </span>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>Last Updated: </span>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                {user.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy') : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};