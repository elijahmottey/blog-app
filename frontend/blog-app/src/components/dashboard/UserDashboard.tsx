import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Heart, TrendingUp, Plus, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { AIChatWidget } from './AIChatWidget';
import { AIChat } from './AIChat';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const UserDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch all posts (for broader stats); your own posts are also in userProfile.posts
  const { data: postsData } = useQuery({
    queryKey: ['all-posts'],
    queryFn: () => BackendApi.getAllPost(),
  });

  // Prefer comments from the logged-in user's profile
  const userComments = userProfile?.comments ?? [];

  const posts = postsData?.data?.content || [];
  const comments = userComments;
  const userPosts = userProfile?.posts || [];

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="shrink-0">
                {activity.type === 'post' && <FileText className="h-5 w-5 text-blue-600" />}
                {activity.type === 'comment' && <MessageSquare className="h-5 w-5 text-green-600" />}
                {activity.type === 'like' && <Heart className="h-5 w-5 text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
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

      {/* My Posts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Posts</h2>
          <Button
            component={Link}
            to="/dashboard/posts/create"
            variant="contained"
            startIcon={<Plus />}
          >
            Create New Post
          </Button>
        </div>
        {userPosts.length === 0 ? (
          <p className="text-gray-500">You haven't created any posts yet.</p>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <IconButton
                          onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                          title="View Post"
                        >
                          <Eye />
                        </IconButton>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <IconButton
                          onClick={() => navigate(`/dashboard/posts/${post.id}/edit`)}
                          title="Edit Post"
                        >
                          <Edit />
                        </IconButton>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <IconButton
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this post?')) {
                              deleteMutation.mutate(post.id);
                            }
                          }}
                          title="Delete Post"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 />
                        </IconButton>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* AI Chat Widget */}
      {!isChatExpanded && (
        <AIChatWidget
          title="AI Writing Assistant"
          description="Get AI-powered suggestions for your blog posts, brainstorm ideas, and improve your writing"
        />
      )}

      {/* Expanded AI Chat */}
      {isChatExpanded && (
        <AIChat isExpanded={true} onToggleExpand={setIsChatExpanded} />
      )}
    </div>
  );
};