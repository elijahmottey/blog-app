import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Heart, TrendingUp, Plus, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';

export const UserDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Fetch all posts (for broader stats); your own posts are also in userProfile.posts
  const { data: postsData } = useQuery({
    queryKey: ['all-posts'],
    queryFn: () => BackendApi.getAllPost(),
  });

  // Prefer comments from the logged-in user's profile
  const userComments = userProfile?.comments ?? [];

  const posts = postsData?.data?.content || [];
  const comments = userComments;

  // Calculate stats
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const publishedPosts = posts.filter(post => post.content).length;
  const draftPosts = totalPosts - publishedPosts;

  // Recent activity (mock data for now)
  const recentActivity = [
    { type: 'post', title: 'Published new post', time: '2 hours ago' },
    { type: 'comment', title: 'Received comment on "React Best Practices"', time: '4 hours ago' },
    { type: 'like', title: 'Post "JavaScript Tips" got 5 likes', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your blog today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comments</p>
              <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Likes</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Views</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/posts/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Create New Post</p>
              <p className="text-sm text-gray-600">Write and publish a new article</p>
            </div>
          </Link>

          <Link
            to="/dashboard/posts"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Posts</p>
              <p className="text-sm text-gray-600">Edit or delete your posts</p>
            </div>
          </Link>

          <Link
            to="/dashboard/comments"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Comments</p>
              <p className="text-sm text-gray-600">Respond to reader comments</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Posts</h2>
        <div className="space-y-4">
          {userProfile?.posts?.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{post.title}</p>
                  <p className="text-sm text-gray-500">
                    {post.content.substring(0, 100)}...
                  </p>
                </div>
              </div>
              <Link
                to={`/dashboard/posts/${post.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Post
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Posts */}
      {draftPosts > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Draft Posts</h2>
          <div className="space-y-3">
            {posts.filter(post => !post.content).slice(0, 3).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      Last modified: {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/dashboard/posts/${post.id}/edit`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Continue editing
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};