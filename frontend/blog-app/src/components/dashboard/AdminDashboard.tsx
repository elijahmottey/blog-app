import React, { useState } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AIChatWidget } from './AIChatWidget';
import { AIChat } from './AIChat';

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

export const AdminDashboard: React.FC = () => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to the Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage your blog platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
              <p className="text-sm text-green-600">+8% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
              <p className="text-sm text-green-600">+15% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Flagged Content</p>
              <p className="text-2xl font-bold text-gray-900">{flaggedContent}</p>
              <p className="text-sm text-red-600">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Post Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Post Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="posts" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Server Status</span>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Uptime</span>
              <span className="text-sm text-gray-900">{systemHealth}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Database</span>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">API Response</span>
              <span className="text-sm text-green-600">Fast</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">john.doe@example.com - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Post published</p>
                <p className="text-xs text-gray-500">"React Best Practices" - 15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Comment flagged</p>
                <p className="text-xs text-gray-500">Spam content detected - 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">User suspended</p>
                <p className="text-xs text-gray-500">Violation of terms - 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-600">View and moderate user accounts</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Content Moderation</p>
            <p className="text-sm text-gray-600">Review flagged posts and comments</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">View Analytics</p>
            <p className="text-sm text-gray-600">Detailed platform statistics</p>
          </button>
        </div>
      </div>

      {/* AI Chat Widget */}
      {!isChatExpanded && (
        <AIChatWidget
          title="AI Platform Assistant"
          description="Get AI insights on user behavior, content trends, and platform analytics"
        />
      )}

      {/* Expanded AI Chat */}
      {isChatExpanded && (
        <AIChat isExpanded={true} onToggleExpand={setIsChatExpanded} />
      )}
    </div>
  );
};