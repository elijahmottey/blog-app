import React, { useState } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { useTheme, alpha } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// import { AIChatWidget } from './AIChatWidget';
// import { AIChat } from './AIChat';
// import { AdminUsers } from './AdminUsers';

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
  //const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<View>('overview');

  // Fetch admin stats
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

  const totalUsers = usersData?.totalElements || 0;
  const totalPosts = postsData?.data?.totalElements || 0;
  const totalComments = commentsData?.data?.totalElements || 0;

  // Mock additional stats
  const flaggedContent = 3;
  const systemHealth = 98;

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return ""; // placeholder
      case 'overview':
      default:
        return (
          <>
            {/* Stats Cards (theme-aware) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12, padding: 24, boxShadow: theme.shadows[1] }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.palette.text.primary, marginBottom: 12 }}>User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
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
                <ResponsiveContainer width="100%" height={300}>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }}>
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


