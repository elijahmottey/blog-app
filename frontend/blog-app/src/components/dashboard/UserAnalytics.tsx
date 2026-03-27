import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme, alpha } from '@mui/material/styles';
import { 
   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { FileText, MessageSquare, Eye, Calendar, TrendingUp, Heart } from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { format, subDays, startOfDay } from 'date-fns';
import {LIVBlogCard, LIVBlogHeader, LIVBlogLayout} from '../ui';
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";

export const UserAnalytics: React.FC = () => {
  const theme = useTheme();

    useDocumentTitle('LIVBlog | Analytics');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: () => BackendApi.getMyOverviewAnalytics(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => BackendApi.getUserProfile(),
  });

  const analyticsResponse = analyticsData?.data;
  const profile = userProfile?.data;
  //@ts-ignore
  const posts = profile?.posts || [];
  //@ts-ignore
  const comments = profile?.comments || [];
  console.log(analyticsResponse)

  // Get drafts count
  const draftsCount = React.useMemo(() => {
    try {
      const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      return drafts.length;
    } catch {
      return 0;
    }
  }, []);

  // Calculate stats from analytics endpoint
  const stats = React.useMemo(() => ({
    totalPosts: analyticsResponse?.totalPosts ?? posts.length,
    totalComments: analyticsResponse?.totalComments ?? comments.length,
    totalDrafts: draftsCount,
    totalViews: analyticsResponse?.totalPostViews ?? posts.reduce((sum, post) => sum + (post.views || 0), 0),
    totalLikes: analyticsResponse?.totalPostLikes ?? posts.reduce((sum, post) => sum + (post.likes || 0), 0),
    totalCommentLikes: analyticsResponse?.totalCommentLikes ?? 0,
    totalCommentDislikes: analyticsResponse?.totalCommentDislikes ?? 0,
    avgViewsPerPost: analyticsResponse?.totalPostViews && analyticsResponse?.totalPosts ? Math.round(analyticsResponse.totalPostViews / analyticsResponse.totalPosts) : 0,
  }), [analyticsResponse, posts, comments, draftsCount]);

  // Generate chart data for recent posts performance
  const postPerformanceData = React.useMemo(() => {
    return [...posts]
      .filter(p => p.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
      .slice(-7)
      .map((p) => ({
        name: p.title ? (p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title) : 'Untitled',
        views: p.views || 0,
        likes: p.likes || 0
      }));
  }, [posts]);

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
          { label: 'Post Likes', value: stats.totalLikes, icon: TrendingUp, color: theme.palette.info.main },
          { label: 'Comment Likes', value: stats.totalCommentLikes, icon: Heart, color: theme.palette.error.main },
          { label: 'Comment Dislikes', value: stats.totalCommentDislikes, icon: TrendingUp, color: theme.palette.warning.main },
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <LIVBlogCard
          title="Recent Posts Performance"
          subtitle="Views over your last 7 posts"
          variant="elevated"
          padding="large"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={postPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
              <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="views" stroke={theme.palette.success.main} fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </LIVBlogCard>

        <LIVBlogCard
          title="Activity Summary"
          subtitle="Your engagement highlight"
          variant="elevated"
          padding="large"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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
      </div>

      {/* Recent Posts */}
      <LIVBlogCard
        title="Individual Posts Performance"
        variant="default"
        padding="large"
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {posts.slice(0, 5).map((post, index) => (
            <div 
              key={post.id || index} 
              className="user-analytics-post-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '8px',
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.2s ease',
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div 
                  className="aws-text-sm"
                  style={{ 
                    fontWeight: 600,
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
      <style>{`
        .user-analytics-post-row:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: ${theme.palette.primary.main} !important;
        }
      `}</style>
    </LIVBlogLayout.Container>
  );
};