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

  // Mock additional stats
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 12,
              padding: 24,
              boxShadow: theme.shadows[1],
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.text.primary, marginBottom: 16 }}>User Management</h2>
              <p style={{ color: theme.palette.text.secondary, marginBottom: 24 }}>Manage user accounts and view their activities</p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>Role</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>Joined</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>Posts</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>Comments</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>Actions</th>
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
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>{user.name}</div>
                              <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{user.email}</div>
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
                            }}>
                              {user.roles?.includes(Roles.ADMIN) && <Shield size={12} />}
                              {user.roles?.includes(Roles.ADMIN) ? 'Admin' : 'User'}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.875rem', color: theme.palette.text.primary, fontWeight: 600 }}>
                            {userPosts.length}
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.875rem', color: theme.palette.text.primary, fontWeight: 600 }}>
                            {userComments.length}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                              <button
                                onClick={() => navigate(`/dashboard/admin/user/${user.id}/view`)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: 'none',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                  color: theme.palette.primary.main,
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <Eye size={12} />
                                View Activity
                              </button>
                              {!user.roles?.includes(Roles.ADMIN) && (
                                <button
                                  onClick={() => handleDeleteUser(user.id!)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                                    color: theme.palette.error.main,
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'overview':
      default:
        return (
          <>
            {/* Stats Cards (theme-aware) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24
            }}>
              {[
                { label: 'Total Users', value: totalUsers, icon: <Users />, accent: theme.palette.primary.main, note: '+12% from last month' },
                { label: 'Total Posts', value: totalPosts, icon: <FileText />, accent: theme.palette.success.main, note: '+8% from last month' },
                { label: 'Total Comments', value: totalComments, icon: <MessageSquare />, accent: theme.palette.secondary.main, note: '+15% from last month' },
                { label: 'Flagged Content', value: flaggedContent, icon: <AlertTriangle />, accent: theme.palette.error.main, note: 'Requires attention' },
              ].map((c) => (
                <div key={c.label} style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ padding: 8, borderRadius: 8, backgroundColor: alpha(c.accent, 0.12), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {React.cloneElement(c.icon as any, { style: { width: 24, height: 24, color: c.accent } })}
                    </div>
                    <div style={{ marginLeft: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: theme.palette.text.secondary }}>{c.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: theme.palette.text.primary }}>{c.value}</div>
                      <div style={{ fontSize: 13, color: c.accent }}>{c.note}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 24
            }}>
              <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.palette.text.primary, marginBottom: 12 }}>User Growth</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ fill: theme.palette.primary.main }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.palette.text.primary, marginBottom: 12 }}>Weekly Post Activity</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={postActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Health & Recent Activity */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: 24
            }}>
              <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.palette.text.primary, marginBottom: 12 }}>System Health</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: theme.palette.text.secondary }}>Server Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              </div>

              <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.palette.text.primary, marginBottom: 12 }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { color: theme.palette.primary.main, title: 'New user registered', subtitle: 'john.doe@example.com - 2 minutes ago' },
                    { color: theme.palette.success.main, title: 'Post published', subtitle: '"React Best Practices" - 15 minutes ago' },
                    { color: '#f59e0b', title: 'Comment flagged', subtitle: 'Spam content detected - 1 hour ago' },
                    { color: theme.palette.error.main, title: 'User suspended', subtitle: 'Violation of terms - 2 hours ago' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 999, marginTop: 6, backgroundColor: a.color }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.palette.text.primary }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: theme.palette.text.secondary }}>{a.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.text.primary }}>Welcome to the Admin Dashboard</h1>
          <p style={{ color: theme.palette.text.secondary, marginTop: 8 }}>
            Monitor and manage your blog platform.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <div onClick={() => setCurrentView('users')} style={{ padding: 16, borderRadius: 12, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', backgroundColor: 'transparent' }}>
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>
                <Users style={{ width: 24, height: 24, color: theme.palette.primary.main }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: theme.palette.text.primary }}>Manage Users</p>
                <p style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>View and moderate user accounts</p>
              </div>
            </div>
            <div onClick={() => setCurrentView('posts')} style={{ padding: 16, borderRadius: 12, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: alpha(theme.palette.success.main, 0.12) }}>
                <FileText style={{ width: 24, height: 24, color: theme.palette.success.main }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: theme.palette.text.primary }}>Content Moderation</p>
                <p style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>Review flagged posts and comments</p>
              </div>
            </div>
            <div onClick={() => setCurrentView('analytics')} style={{ padding: 16, borderRadius: 12, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: alpha(theme.palette.secondary.main, 0.12) }}>
                <TrendingUp style={{ width: 24, height: 24, color: theme.palette.secondary.main }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: theme.palette.text.primary }}>View Analytics</p>
                <p style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>Detailed platform statistics</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {renderContent()}
        </div>
      </div>
  );
};


