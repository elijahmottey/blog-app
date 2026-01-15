import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Eye, Plus, Search, Filter } from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const PostsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();

  // Use localStorage to cache posts
  const [cachedPosts, setCachedPosts] = useLocalStorage<any>('user-posts-cache', null);
  const [lastFetchTime, setLastFetchTime] = useLocalStorage<number>('posts-last-fetch', 0);

  // Cache posts for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Fetch posts
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['user-posts-management', currentPage],
    queryFn: async () => {
      const now = Date.now();
      // Check if we have valid cached data
      if (cachedPosts &&
          lastFetchTime &&
          (now - lastFetchTime) < CACHE_DURATION &&
          cachedPosts.page === currentPage) {
        return cachedPosts.data;
      }

      // Fetch from API
      const result = await BackendApi.getAllPost(currentPage, 10);

      // Cache the result
      setCachedPosts({ page: currentPage, data: result });
      setLastFetchTime(now);

      return result;
    },
    staleTime: CACHE_DURATION,
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const posts = postsData?.data?.content || [];
  const totalPages = postsData?.data?.totalPages || 0;

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(postId);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load posts</div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['user-posts-management'] })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-gray-600">Manage your blog posts</p>
        </div>
        <Link
          to="/dashboard/posts/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? 'No posts found matching your search.' : 'No posts yet.'}
            </div>
            {!searchTerm && (
              <Link
                to="/dashboard/posts/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{truncateContent(post.content)}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>Created: {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                    <span>Updated: {format(new Date(post.updatedAt), 'MMM dd, yyyy')}</span>
                    {post.comments && (
                      <span>{post.comments.length} comments</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Post"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <Link
                    to={`/dashboard/posts/${post.id}/edit`}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Post"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id!)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`px-3 py-2 border rounded-lg ${
                currentPage === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{postsData?.data?.totalElements || 0}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(post => post.content && post.content.length > 100).length}
            </div>
            <div className="text-sm text-gray-600">Published Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {posts.filter(post => !post.content || post.content.length <= 100).length}
            </div>
            <div className="text-sm text-gray-600">Draft Posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};