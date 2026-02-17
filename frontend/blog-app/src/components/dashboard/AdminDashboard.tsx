import React, { useState } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, AlertTriangle, Activity, Eye, Trash2, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import BackendApi, { type UserDto } from '../../service/BackendApi';
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
            <LIVBlogCard
              title="User Management"
              subtitle="Manage user accounts and view their activities"
              variant="default"
              padding="large"
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: theme.palette.text.primary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>User</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: theme.palette.text.primary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Role</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: theme.palette.text.primary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Joined</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: theme.palette.text.primary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Posts</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: theme.palette.text.primary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Comments</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: theme.palette.text.primary,
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
                        <tr key={user.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <td style={{ padding: '16px' }}>
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
                          <td style={{ padding: '16px' }}>
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
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}>
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            fontSize: '0.875rem', 
                            color: theme.palette.text.primary, 
                            fontWeight: 600,
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}>
                            {userPosts.length}
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            fontSize: '0.875rem', 
                            color: theme.palette.text.primary, 
                            fontWeight: 600,
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}>
                            {userComments.length}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                              <Button
                                onClick={() => navigate(`/dashboard/admin/user/${user.id}/view`)}
                                className="aws-button aws-button-secondary"
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
                                  className="aws-button"
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
          </LIVBlogLayout.Container>
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'overview':
      default:
        return (
          <LIVBlogLayout.Container>
            {/* Stats Cards */}
            <LIVBlogLayout.Grid cols={4} gap="md">
              {[
                { label: 'Total Users', value: totalUsers, icon: <Users />, accent: theme.palette.primary.main, note: '+12% from last month' },
                { label: 'Total Posts', value: totalPosts, icon: <FileText />, accent: theme.palette.success.main, note: '+8% from last month' },
                { label: 'Total Comments', value: totalComments, icon: <MessageSquare />, accent: theme.palette.secondary.main, note: '+15% from last month' },
                { label: 'Flagged Content', value: flaggedContent, icon: <AlertTriangle />, accent: theme.palette.error.main, note: 'Requires attention' },
              ].map((c) => (
                <LIVBlogCard
                  key={c.label}
                  title={c.label}
                  variant="default"
                  padding="medium"
                  className="aws-min-h-card-sm"
                >
                  <div className="aws-flex aws-items-center aws-mb-3">
                    <div 
                      className="aws-p-2 aws-rounded-md aws-flex aws-items-center aws-justify-center"
                      style={{ backgroundColor: alpha(c.accent, 0.12) }}
                    >
                      {React.cloneElement(c.icon as any, { style: { width: 24, height: 24, color: c.accent } })}
                    </div>
                  </div>
                  <div 
                    className="aws-text-xl aws-font-bold aws-mb-1"
                    style={{ 
                      color: theme.palette.text.primary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {c.value}
                  </div>
                  <div 
                    className="aws-text-sm"
                    style={{ 
                      color: c.accent,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {c.note}
                  </div>
                </LIVBlogCard>
              ))}
            </LIVBlogLayout.Grid>

            {/* Charts */}
            <LIVBlogLayout.Grid cols={2} gap="lg">
              <LIVBlogCard
                title="User Growth"
                variant="default"
                padding="large"
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
                variant="default"
                padding="large"
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
            </LIVBlogLayout.Grid>

            {/* System Health & Recent Activity */}
            <LIVBlogLayout.Grid cols={2} gap="lg">
              <LIVBlogCard
                title="System Health"
                variant="default"
                padding="large"
              >
                <div className="aws-flex aws-flex-col aws-gap-3">
                  <div className="aws-flex aws-justify-between">
                    <div style={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>Server Status</div>
                    <div className="aws-flex aws-items-center aws-gap-2">
                      <Activity style={{ width: 16, height: 16, color: theme.palette.success.main }} />
                      <div style={{ 
                        color: theme.palette.success.main,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>Healthy</div>
                    </div>
                  </div>
                  <div className="aws-flex aws-justify-between">
                    <div style={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>Uptime</div>
                    <div style={{ 
                      color: theme.palette.text.primary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>{systemHealth}%</div>
                  </div>
                  <div className="aws-flex aws-justify-between">
                    <div style={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>Database</div>
                    <div style={{ 
                      color: theme.palette.success.main,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>Connected</div>
                  </div>
                  <div className="aws-flex aws-justify-between">
                    <div style={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>API Response</div>
                    <div style={{ 
                      color: theme.palette.success.main,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>Fast</div>
                  </div>
                </div>
              </LIVBlogCard>

              <LIVBlogCard
                title="Recent Activity"
                variant="default"
                padding="large"
              >
                <div className="aws-flex aws-flex-col aws-gap-3">
                  {[
                    { color: theme.palette.primary.main, title: 'New user registered', subtitle: 'john.doe@example.com - 2 minutes ago' },
                    { color: theme.palette.success.main, title: 'Post published', subtitle: '"React Best Practices" - 15 minutes ago' },
                    { color: '#f59e0b', title: 'Comment flagged', subtitle: 'Spam content detected - 1 hour ago' },
                    { color: theme.palette.error.main, title: 'User suspended', subtitle: 'Violation of terms - 2 hours ago' },
                  ].map((a, i) => (
                    <div key={i} className="aws-flex aws-gap-3 aws-items-start">
                      <div 
                        className="aws-w-2 aws-h-2 aws-rounded-full aws-mt-1.5"
                        style={{ backgroundColor: a.color }}
                      />
                      <div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: theme.palette.text.primary,
                          fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>{a.title}</div>
                        <div style={{ 
                          fontSize: 12, 
                          color: theme.palette.text.secondary,
                          fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>{a.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </LIVBlogCard>
            </LIVBlogLayout.Grid>
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
        variant="default"
        padding="large"
      >
        <LIVBlogLayout.Grid cols={3} gap="md">
          <div 
            onClick={() => setCurrentView('users')} 
            className="aws-p-4 aws-rounded-xl aws-border aws-cursor-pointer aws-flex aws-gap-3 aws-items-start aws-hover-bg-gray-50"
            style={{ 
              borderColor: theme.palette.divider,
              backgroundColor: 'transparent'
            }}
          >
            <div 
              className="aws-w-10 aws-h-10 aws-flex aws-items-center aws-justify-center aws-rounded-lg"
              style={{ backgroundColor: alpha(theme.palette.primary.main, 0.12) }}
            >
              <Users style={{ width: 24, height: 24, color: theme.palette.primary.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>Manage Users</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>View and moderate user accounts</p>
            </div>
          </div>
          <div 
            onClick={() => setCurrentView('posts')} 
            className="aws-p-4 aws-rounded-xl aws-border aws-cursor-pointer aws-flex aws-gap-3 aws-items-start"
            style={{ borderColor: theme.palette.divider }}
          >
            <div 
              className="aws-w-10 aws-h-10 aws-flex aws-items-center aws-justify-center aws-rounded-lg"
              style={{ backgroundColor: alpha(theme.palette.success.main, 0.12) }}
            >
              <FileText style={{ width: 24, height: 24, color: theme.palette.success.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>Content Moderation</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>Review flagged posts and comments</p>
            </div>
          </div>
          <div 
            onClick={() => setCurrentView('analytics')} 
            className="aws-p-4 aws-rounded-xl aws-border aws-cursor-pointer aws-flex aws-gap-3 aws-items-start"
            style={{ borderColor: theme.palette.divider }}
          >
            <div 
              className="aws-w-10 aws-h-10 aws-flex aws-items-center aws-justify-center aws-rounded-lg"
              style={{ backgroundColor: alpha(theme.palette.secondary.main, 0.12) }}
            >
              <TrendingUp style={{ width: 24, height: 24, color: theme.palette.secondary.main }} />
            </div>
            <div>
              <p style={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>View Analytics</p>
              <p style={{ 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem',
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>Detailed platform statistics</p>
            </div>
          </div>
        </LIVBlogLayout.Grid>
      </LIVBlogCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {renderContent()}
      </div>
    </LIVBlogLayout.Container>
  );
};