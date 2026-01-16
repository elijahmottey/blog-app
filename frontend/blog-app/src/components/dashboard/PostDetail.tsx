import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  User,
  Download
} from 'lucide-react';
import { Button, IconButton, Typography, Box, Paper, TextField, Avatar } from '@mui/material';
import BackendApi, { type CommentDto } from '../../service/BackendApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { downloadPost, downloadPostPdf } from '../../lib/download';

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
    queryFn: () => BackendApi.getCommentsByPostId(postId, 0, 1000), // Fetch comments for this specific post
    enabled: !!postId,
  });

  // Comments for this post
  const postComments = (commentsData?.data as any)?.content || [];

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
          return `<h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; margin-top: 2rem; color: #1a1a1a;">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.5rem; color: #1a1a1a;">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 style="font-size: 1.25rem; font-weight: 500; margin-bottom: 0.5rem; margin-top: 1rem; color: #1a1a1a;">${line.substring(4)}</h3>`;
        }

        // Handle bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1a1a1a;">$1</strong>');

        // Handle italic text
        line = line.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #666666;">$1</em>');

        // Handle empty lines as paragraphs
        if (line.trim() === '') {
          return '<br>';
        }

        return `<p style="margin-bottom: 0.75rem; line-height: 1.6; color: #1a1a1a;">${line}</p>`;
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
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/dashboard/posts"
          variant="outlined"
          startIcon={<ArrowLeft />}
        >
          Back to Posts
        </Button>

        {user && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              component={Link}
              to={`/dashboard/posts/${postId}/edit`}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
              title="Edit Post"
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' }, '&:disabled': { opacity: 0.5 } }}
              title="Delete Post"
            >
              <Trash2 />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Post Content */}
      <Paper sx={{ overflow: 'hidden' }}>
        {/* Post Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {postData.title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', typography: 'body2', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box>By {postData.users || 'Anonymous'}</Box>
              <Box>Created: {postData.createdAt ? format(new Date(postData.createdAt), 'MMM dd, yyyy') : 'Unknown'}</Box>
              {postData.updatedAt && postData.updatedAt !== postData.createdAt && (
                <Box>Updated: {format(new Date(postData.updatedAt), 'MMM dd, yyyy')}</Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Post Body */}
        <Box
          sx={{ p: 3, typography: 'body1', lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: formatContent(postData.content) }}
        />

        {/* Post Actions */}
        <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                startIcon={<Heart />}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}
              >
                Like
              </Button>

              <Button
                onClick={() => setShowComments(!showComments)}
                startIcon={<MessageCircle />}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
              >
                {postComments.length} Comments
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => downloadPost(postData)}
                  startIcon={<Download />}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: 'success.light' } }}
                >
                  TXT
                </Button>
                <Button
                  onClick={() => downloadPostPdf(postData)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: 'success.light' } }}
                >
                  PDF
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Comments Section */}
      {showComments && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Comments ({postComments.length})
          </Typography>

          {/* Add Comment Form */}
          {user ? (
            <Box component="form" onSubmit={handleComment} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <User />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={commentMutation.isPending || !commentText.trim()}
                      startIcon={<Send />}
                    >
                      {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Please login to comment on this post
              </Typography>
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
              >
                Login
              </Button>
            </Box>
          )}

          {/* Comments List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {commentsLoading ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ width: 24, height: 24, border: 2, borderColor: 'primary.main', borderTopColor: 'transparent', borderRadius: '50%', mx: 'auto', animation: 'spin 1s linear infinite' }} />
              </Box>
            ) : postComments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body2">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            ) : (
              postComments.map((comment: CommentDto) => (
                <Box key={comment.id} sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'grey.400' }}>
                    <User />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {comment.users || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {comment.content}
                      </Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ThumbsUp />}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, typography: 'caption' }}
                      >
                        Like
                      </Button>
                      <Button
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, typography: 'caption' }}
                      >
                        Reply
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};