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
import {LIVBlogCard, LIVBlogHeader, LIVBlogLayout} from '../ui';

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
      <LIVBlogLayout.Container>
        <div className="aws-flex aws-items-center aws-justify-center" style={{ minHeight: '400px' }}>
          <div 
            style={{ 
              color: theme.palette.text.secondary,
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Loading analytics...
          </div>
        </div>
      </LIVBlogLayout.Container>
    );
  }

  return (
    <LIVBlogLayout.Container>
      {/* Header */}
      <LIVBlogHeader
        title="My Analytics"
        subtitle="Your personal content performance and activity insights"
        size="large"
      />

      {/* Key Metrics */}
      <LIVBlogLayout.Grid cols={3} gap="md">
        {[
          { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: theme.palette.primary.main },
          { label: 'Total Comments', value: stats.totalComments, icon: MessageSquare, color: theme.palette.secondary.main },
          { label: 'Draft Posts', value: stats.totalDrafts, icon: FileText, color: theme.palette.warning.main },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: theme.palette.success.main },
          { label: 'Total Likes', value: stats.totalLikes, icon: TrendingUp, color: theme.palette.info.main },
          { label: 'Avg Views/Post', value: stats.avgViewsPerPost, icon: Eye, color: theme.palette.primary.main },
        ].map((metric) => (
          <LIVBlogCard
            key={metric.label}
            title={metric.label}
            variant="default"
            padding="medium"
            className="aws-min-h-card-sm"
          >
            <div className="aws-flex aws-items-center aws-gap-3 aws-mb-2">
              <div 
                className="aws-p-2 aws-rounded-md aws-flex aws-items-center aws-justify-center"
                style={{
                  backgroundColor: alpha(metric.color, 0.12),
                }}
              >
                <metric.icon size={20} style={{ color: metric.color }} />
              </div>
            </div>
            <div 
              className="aws-text-2xl aws-font-bold aws-text-primary"
              style={{ 
                color: theme.palette.text.primary,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {metric.value}
            </div>
          </LIVBlogCard>
        ))}
      </LIVBlogLayout.Grid>

      {/* Charts Row */}
      <LIVBlogLayout.Grid cols={1} gap="lg">
        <LIVBlogCard
          title="Activity Summary"
          variant="default"
          padding="large"
        >
          <div className="aws-flex aws-flex-col aws-gap-3">
            <div className="aws-flex aws-justify-between">
              <span 
                style={{ 
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: theme.palette.text.secondary
                }}
              >
                Posts this week:
              </span>
              <strong 
                style={{ 
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: theme.palette.text.primary
                }}
              >
                {posts.filter(p => p.createdAt && new Date(p.createdAt) > subDays(new Date(), 7)).length}
              </strong>
            </div>
            <div className="aws-flex aws-justify-between">
              <span 
                style={{ 
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: theme.palette.text.secondary
                }}
              >
                Comments this week:
              </span>
              <strong 
                style={{ 
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: theme.palette.text.primary
                }}
              >
                {comments.length}
              </strong>
            </div>
            <div className="aws-flex aws-justify-between">
              <span 
                style={{ 
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: theme.palette.text.secondary
                }}
              >
                Most viewed post:
              </span>
              <strong 
                style={{ 
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: theme.palette.text.primary
                }}
              >
                {Math.max(...posts.map(p => p.views || 0), 0)} views
              </strong>
            </div>
          </div>
        </LIVBlogCard>
      </LIVBlogLayout.Grid>

      {/* Recent Posts */}
      <LIVBlogCard
        title="Recent Posts Performance"
        variant="default"
        padding="large"
      >
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          {posts.slice(0, 5).map((post, index) => (
            <div 
              key={post.id || index} 
              className="aws-flex aws-justify-between aws-items-center aws-py-3"
              style={{
                borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div 
                  className="aws-text-sm aws-font-semibold"
                  style={{ 
                    color: theme.palette.text.primary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {post.title || 'Untitled'}
                </div>
                <div 
                  className="aws-text-xs aws-mt-1 aws-flex aws-items-center"
                  style={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  <Calendar size={12} style={{ marginRight: 4 }} />
                  {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                </div>
              </div>
              <div className="aws-flex aws-gap-4 aws-items-center">
                <div className="aws-text-center">
                  <div 
                    className="aws-text-base aws-font-semibold"
                    style={{ 
                      color: theme.palette.success.main,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {post.views || 0}
                  </div>
                  <div 
                    className="aws-text-xs"
                    style={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    Views
                  </div>
                </div>
                <div className="aws-text-center">
                  <div 
                    className="aws-text-base aws-font-semibold"
                    style={{ 
                      color: theme.palette.info.main,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {post.likes || 0}
                  </div>
                  <div 
                    className="aws-text-xs"
                    style={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    Likes
                  </div>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div 
              className="aws-text-center aws-py-10"
              style={{ 
                color: theme.palette.text.secondary,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              No posts yet. Start writing to see your analytics!
            </div>
          )}
        </div>
      </LIVBlogCard>
    </LIVBlogLayout.Container>
  );
};