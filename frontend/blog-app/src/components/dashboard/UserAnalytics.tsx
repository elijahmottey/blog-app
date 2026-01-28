import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { FileText, MessageSquare, Eye, Calendar, TrendingUp } from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { format, subDays, startOfDay } from 'date-fns';

export const UserAnalytics: React.FC = () => {
  const theme = useTheme();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => BackendApi.getUserProfile(),
  });

  const profile = userProfile?.data;
  //@ts-ignore
  const posts = profile?.posts || [];
  //@ts-ignore
  const comments = profile?.comments || [];

  
  // Get drafts count
  const draftsCount = React.useMemo(() => {
    try {
      const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      return drafts.length;
    } catch {
      return 0;
    }
  }, []);

  // Calculate stats
  const stats = React.useMemo(() => ({
    totalPosts: posts.length,
    totalComments: comments.length,
    totalDrafts: draftsCount,
    totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
    totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
    avgViewsPerPost: posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + (post.views || 0), 0) / posts.length) : 0,
  }), [posts, comments, draftsCount]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: theme.palette.text.secondary }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      {/* Header */}
      <div style={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: theme.shadows[1],
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.text.primary, margin: 0 }}>
          My Analytics
        </h2>
        <p style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0' }}>
          Your personal content performance and activity insights
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {[
          { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: theme.palette.primary.main },
          { label: 'Total Comments', value: stats.totalComments, icon: MessageSquare, color: theme.palette.secondary.main },
          { label: 'Draft Posts', value: stats.totalDrafts, icon: FileText, color: theme.palette.warning.main },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: theme.palette.success.main },
          { label: 'Total Likes', value: stats.totalLikes, icon: TrendingUp, color: theme.palette.info.main },
          { label: 'Avg Views/Post', value: stats.avgViewsPerPost, icon: Eye, color: theme.palette.primary.main },
        ].map((metric) => (
          <div key={metric.label} style={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 12,
            padding: 20,
            boxShadow: theme.shadows[1],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: alpha(metric.color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <metric.icon size={20} style={{ color: metric.color }} />
              </div>
              <span style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>{metric.label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.palette.text.primary }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row - Simplified */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
      }}>
        {/* Simple Activity Summary */}
        <div style={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
          padding: 24,
          boxShadow: theme.shadows[1],
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>
            Activity Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Posts this week:</span>
              <strong>{posts.filter(p => p.createdAt && new Date(p.createdAt) > subDays(new Date(), 7)).length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Comments this week:</span>
              <strong>{comments.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Most viewed post:</span>
              <strong>{Math.max(...posts.map(p => p.views || 0), 0)} views</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div style={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: theme.shadows[1],
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>
          Recent Posts Performance
        </h3>
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          {posts.slice(0, 5).map((post, index) => (
            <div key={post.id || index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>
                  {post.title || 'Untitled'}
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, marginTop: 4 }}>
                  <Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.success.main }}>
                    {post.views || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>Views</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.info.main }}>
                    {post.likes || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>Likes</div>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: theme.palette.text.secondary }}>
              No posts yet. Start writing to see your analytics!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};