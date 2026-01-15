import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  User
} from 'lucide-react';
import BackendApi, { type CommentDto } from '../../service/BackendApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(true);

  const postId = parseInt(id || '0');

  // Fetch post details
  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => BackendApi.getPostById(postId),
    enabled: !!postId,
  });

  // Fetch comments for this post
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => BackendApi.getAllPostComment(0, 50), // Get all comments, we'll filter client-side
    enabled: !!postId,
  });

  // Filter comments for this post
  const postComments = commentsData?.data?.content?.filter(
    (comment: CommentDto) => comment.posts === post?.data?.id?.toString()
  ) || [];

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => {
      // This would be a like endpoint - for now we'll simulate
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      toast.success('Post liked!');
      // In a real app, you'd refetch the post data to update like count
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (commentData: { content: string; posts: string }) =>
      BackendApi.createPostComment({
        content: commentData.content,
        posts: commentData.posts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as CommentDto, postId),
    onSuccess: () => {
      toast.success('Comment added!');
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: () => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      navigate('/dashboard/posts');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    commentMutation.mutate({
      content: commentText,
      posts: postId.toString(),
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold mb-4 mt-8">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-semibold mb-3 mt-6">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-medium mb-2 mt-4">${line.substring(4)}</h3>`;
        }

        // Handle bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

        // Handle italic text
        line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Handle empty lines as paragraphs
        if (line.trim() === '') {
          return '<br>';
        }

        return `<p class="mb-3 leading-relaxed">${line}</p>`;
      })
      .join('');
  };

  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (postError || !post?.data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Post not found</div>
        <Link
          to="/dashboard/posts"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Link>
      </div>
    );
  }

  const postData = post.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/posts"
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Link>

        {user && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/dashboard/posts/${postId}/edit`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Post"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete Post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{postData.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>By {postData.users || 'Anonymous'}</span>
              <span>Created: {postData.createdAt ? format(new Date(postData.createdAt), 'MMM dd, yyyy') : 'Unknown'}</span>
              {postData.updatedAt && postData.updatedAt !== postData.createdAt && (
                <span>Updated: {format(new Date(postData.updatedAt), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Post Body */}
        <div
          className="p-6 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(postData.content) }}
        />

        {/* Post Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Heart className={`h-5 w-5 ${likeMutation.isPending ? 'fill-current' : ''}`} />
                <span>Like</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{postComments.length} Comments</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({postComments.length})</h3>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={commentMutation.isPending || !commentText.trim()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">Please login to comment on this post</p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : postComments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                postComments.map((comment: CommentDto) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {comment.users || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <div className="flex items-center mt-2 space-x-4">
                        <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600">
                          <ThumbsUp className="h-3 w-3" />
                          <span>Like</span>
                        </button>
                        <button className="text-xs text-gray-500 hover:text-blue-600">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};