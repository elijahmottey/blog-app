import React, { useState } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, AlertTriangle, Activity, Eye, Trash2, Shield, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import BackendApi, { type UserDto, type PostDto } from '../../service/BackendApi';
import { useTheme, alpha } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AnalyticsView } from './AnalyticsView';
import { Roles } from '../../enums/Roles';
import { LIVBlogHeader, LIVBlogCard, LIVBlogLayout } from '../ui';
import { Button } from '@mui/material';

// Mock data for charts
const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 150 },
  { month: 'Mar', users: 180 },
  { month: 'Apr', users: 220 },
  { month: 'May', users: 280 },
  { month: 'Jun', users: 320 },
];

const postActivityData = [
  { day: 'Mon', posts: 12 },
  { day: 'Tue', posts: 19 },
  { day: 'Wed', posts: 15 },
  { day: 'Thu', posts: 22 },
  { day: 'Fri', posts: 18 },
  { day: 'Sat', posts: 8 },
  { day: 'Sun', posts: 6 },
];

type View = 'overview' | 'users' | 'posts' | 'comments' | 'analytics';

export const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('overview');

  // Fetch admin stats
  const { data: totalUsersData } = useQuery({
    queryKey: ['total-users'],
    queryFn: () => BackendApi.getTotalUsers(),
  });

  const { data: totalPostsData } = useQuery({
    queryKey: ['total-posts'],
    queryFn: () => BackendApi.getTotalPost(),
  });

  const { data: totalCommentsData } = useQuery({
    queryKey: ['total-comments'],
    queryFn: () => BackendApi.getTotalPostComment(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => BackendApi.getAllUsers(),
  });

  const { data: postsData } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => BackendApi.getAllPost(0, 100),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => BackendApi.getAllPostComment(0, 100),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => BackendApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const totalUsers = totalUsersData?.data || 0;
  const totalPosts = totalPostsData?.data || 0;
  const totalComments = totalCommentsData?.data || 0;
  const totalDownloads = postsData?.data?.content?.reduce((acc: number, post: PostDto) => acc + (post.downloads || 0), 0) || 0;
  const flaggedContent = 3;
  const systemHealth = 98;

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return (
          <LIVBlogLayout.Container>
            <LIVBlogHeader
              title="User Management"
              subtitle="Manage user accounts and view their activities"
              size="large"
            />
            <LIVBlogCard
              variant="elevated"
              padding="large"
            >
              <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
                <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        padding: '12px 24px', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>User</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Role</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Joined</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Posts</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Comments</th>
                      <th style={{ 
                        padding: '12px 24px', 
                        textAlign: 'center', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.content?.map((user: UserDto) => {
                      const userPosts = postsData?.data?.content?.filter((post: any) => 
                        post.users === user.name || post.users === user.email
                      ) || [];
                      const userComments = commentsData?.data?.content?.filter((comment: any) => 
                        comment.users === user.name || comment.users === user.email
                      ) || [];
                      
                      return (
                        <tr 
                          key={user.id} 
                          className="admin-table-row"
                          style={{ 
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <td style={{ 
                            padding: '16px 24px', 
                            borderTopLeftRadius: '12px', 
                            borderBottomLeftRadius: '12px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRight: 'none'
                          }}>
                            <div>
                              <div style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                color: theme.palette.text.primary,
                                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                              }}>{user.name}</div>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: theme.palette.text.secondary,
                                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                              }}>{user.email}</div>
                            </div>
                          </td>
                          <td style={{ 
                            padding: '16px',
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 8px',
                              borderRadius: 12,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: user.roles?.includes(Roles.ADMIN) 
                                ? alpha(theme.palette.error.main, 0.12)
                                : alpha(theme.palette.primary.main, 0.12),
                              color: user.roles?.includes(Roles.ADMIN) 
                                ? theme.palette.error.main
                                : theme.palette.primary.main,
                              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}>
                              {user.roles?.includes(Roles.ADMIN) && <Shield size={12} />}
                              {user.roles?.includes(Roles.ADMIN) ? 'Admin' : 'User'}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            fontSize: '0.875rem', 
                            color: theme.palette.text.secondary,
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            fontSize: '0.875rem', 
                            color: theme.palette.text.primary, 
                            fontWeight: 600,
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            {userPosts.length}
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            fontSize: '0.875rem', 
                            color: theme.palette.text.primary, 
                            fontWeight: 600,
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}>
                            {userComments.length}
                          </td>
                          <td style={{ 
                            padding: '16px 24px',
                            borderTopRightRadius: '12px', 
                            borderBottomRightRadius: '12px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderLeft: 'none'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                              <Button
                                onClick={() => navigate(`/dashboard/admin/user/${user.id}/view`)}
                                className="aws-button aws-button-secondary hover-button"
                                size="small"
                                startIcon={<Eye size={12} />}
                                style={{
                                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}
                              >
                                View Activity
                              </Button>
                              {!user.roles?.includes(Roles.ADMIN) && (
                                <Button
                                  onClick={() => handleDeleteUser(user.id!)}
                                  className="aws-button hover-button"
                                  size="small"
                                  startIcon={<Trash2 size={12} />}
                                  style={{
                                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                                    color: theme.palette.error.main,
                                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                  }}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </LIVBlogCard>
            <style>{`
              .admin-table-row:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                z-index: 10;
                position: relative;
              }
            `}</style>
          </LIVBlogLayout.Container>
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'overview':
      default:
        return (
          <LIVBlogLayout.Container>
            <LIVBlogHeader
              title="Dashboard Overview"
              subtitle="Monitor your platform's key metrics and performance"
              size="large"
            />
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[
                { label: 'Total Users', value: totalUsers, icon: <Users />, accent: theme.palette.primary.main, note: '+12% from last month' },
                { label: 'Total Posts', value: totalPosts, icon: <FileText />, accent: theme.palette.success.main, note: '+8% from last month' },
                { label: 'Total Comments', value: totalComments, icon: <MessageSquare />, accent: theme.palette.secondary.main, note: '+15% from last month' },
                { label: 'Total Downloads', value: totalDownloads, icon: <Download />, accent: theme.palette.info.main, note: 'All time' },
                { label: 'Flagged Content', value: flaggedContent, icon: <AlertTriangle />, accent: theme.palette.error.main, note: 'Requires attention' },
              ].map((c) => (
                <LIVBlogCard
                  key={c.label}
                  title={c.label}
                  variant="elevated"
                  padding="large"
                  hoverable
                  style={{
                    background: `linear-gradient(135deg, ${alpha(c.accent, 0.05)}, ${alpha(c.accent, 0.02)})`,
                    borderLeft: `4px solid ${c.accent}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div 
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(c.accent, 0.12)
                      }}
                    >
                      {React.cloneElement(c.icon as any, { style: { width: 24, height: 24, color: c.accent } })}
                    </div>
                  </div>
                  <div 
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      marginBottom: '8px',
                      color: theme.palette.text.primary
                    }}
                  >
                    {c.value}
                  </div>
                  <div 
                    style={{
                      fontSize: '0.875rem',
                      color: c.accent
                    }}
                  >
                    {c.note}
                  </div>
                </LIVBlogCard>
              ))}
            </div>

            {/* Charts */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              <LIVBlogCard
                title="User Growth"
                variant="elevated"
                padding="large"
                hoverable
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ fill: theme.palette.primary.main }} />
                  </LineChart>
                </ResponsiveContainer>
              </LIVBlogCard>

              <LIVBlogCard
                title="Weekly Post Activity"
                variant="elevated"
                padding="large"
                hoverable
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={postActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </LIVBlogCard>
            </div>

            {/* System Health & Recent Activity */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px'
            }}>
              <LIVBlogCard
                title="System Health"
                variant="elevated"
                padding="large"
                hoverable
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: theme.palette.text.secondary }}>Server Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity style={{ width: 16, height: 16, color: theme.palette.success.main }} />
                      <div style={{ color: theme.palette.success.main }}>Healthy</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: theme.palette.text.secondary }}>Uptime</div>
                    <div style={{ color: theme.palette.text.primary }}>{systemHealth}%</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: theme.palette.text.secondary }}>Database</div>
                    <div style={{ color: theme.palette.success.main }}>Connected</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: theme.palette.text.secondary }}>API Response</div>
                    <div style={{ color: theme.palette.success.main }}>Fast</div>
                  </div>
                </div>
              </LIVBlogCard>

              <LIVBlogCard
                title="Recent Activity"
                variant="elevated"
                padding="large"
                hoverable
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { color: theme.palette.primary.main, title: 'New user registered', subtitle: 'john.doe@example.com - 2 minutes ago' },
                    { color: theme.palette.success.main, title: 'Post published', subtitle: '"React Best Practices" - 15 minutes ago' },
                    { color: '#f59e0b', title: 'Comment flagged', subtitle: 'Spam content detected - 1 hour ago' },
                    { color: theme.palette.error.main, title: 'User suspended', subtitle: 'Violation of terms - 2 hours ago' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div 
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          marginTop: '6px',
                          backgroundColor: a.color
                        }}
                      />
                      <div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: theme.palette.text.primary
                        }}>{a.title}</div>
                        <div style={{ 
                          fontSize: 12, 
                          color: theme.palette.text.secondary
                        }}>{a.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </LIVBlogCard>
            </div>
          </LIVBlogLayout.Container>
        );
    }
  };

  return (
    <LIVBlogLayout.Container>
      {/* Header */}
      <LIVBlogHeader
        title="Welcome to the Admin Dashboard"
        subtitle="Monitor and manage your blog platform."
        size="large"
      />

      {/* Quick Actions */}
      <LIVBlogCard
        title="Quick Actions"
        variant="elevated"
        padding="large"
        style={{ marginBottom: '32px' }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px'
        }}>
          <div 
            onClick={() => setCurrentView('users')} 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              transition: 'all 0.2s ease'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.primary.main, 0.12)
              }}
            >
              <Users style={{ width: 24, height: 24, color: theme.palette.primary.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                margin: '0 0 4px 0'
              }}>Manage Users</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                margin: 0
              }}>View and moderate user accounts</p>
            </div>
          </div>
          <div 
            onClick={() => setCurrentView('posts')} 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              transition: 'all 0.2s ease'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.success.main, 0.12)
              }}
            >
              <FileText style={{ width: 24, height: 24, color: theme.palette.success.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                margin: '0 0 4px 0'
              }}>Content Moderation</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                margin: 0
              }}>Review flagged posts and comments</p>
            </div>
          </div>
          <div 
            onClick={() => setCurrentView('analytics')} 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              transition: 'all 0.2s ease'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.secondary.main, 0.12)
              }}
            >
              <TrendingUp style={{ width: 24, height: 24, color: theme.palette.secondary.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                margin: '0 0 4px 0'
              }}>View Analytics</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                margin: 0
              }}>Detailed platform statistics</p>
            </div>
          </div>
          <div 
            onClick={() => navigate('/dashboard/admin/reports')}
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              transition: 'all 0.2s ease'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.error.main, 0.12)
              }}
            >
              <AlertTriangle style={{ width: 24, height: 24, color: theme.palette.error.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                margin: '0 0 4px 0'
              }}>Manage Reports</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                margin: 0
              }}>Review and manage reported content</p>
            </div>
          </div>
        </div>
      </LIVBlogCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {renderContent()}
      </div>
    </LIVBlogLayout.Container>
  );
};