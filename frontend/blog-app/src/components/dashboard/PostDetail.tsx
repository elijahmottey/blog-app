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
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Button, IconButton, Typography, Box, Paper, TextField, Avatar, Menu, MenuItem } from '@mui/material';
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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
    queryFn: () => BackendApi.getCommentsByPostId(postId),
    enabled: !!postId,
  });

  // Comments for this post
  const postComments = (commentsData?.data as any)?.content || [];

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => {
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      toast.success('Post liked!');
    },
  });

  // Comment mutation - FIXED
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
        BackendApi.createPostComment({
          content
        } as CommentDto, postId),
    onSuccess: () => {
      toast.success('Comment added!');
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
    onError: (error: any) => {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment: ' + (error.message || 'Unknown error'));
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

    commentMutation.mutate(commentText);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    navigate(`/dashboard/posts/${postId}/edit`);
    handleMenuClose();
  };

  const handleDeleteMenu = () => {
    handleDelete();
    handleMenuClose();
  };

  // FIXED: Safe content formatting without dangerous HTML
  const renderContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');

    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        return (
            <Typography key={index} variant="h4" component="h1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
              {line.substring(2)}
            </Typography>
        );
      }
      if (line.startsWith('## ')) {
        return (
            <Typography key={index} variant="h5" component="h2" sx={{ mt: 2, mb: 1.5, fontWeight: 'bold' }}>
              {line.substring(3)}
            </Typography>
        );
      }
      if (line.startsWith('### ')) {
        return (
            <Typography key={index} variant="h6" component="h3" sx={{ mt: 1.5, mb: 1, fontWeight: 'bold' }}>
              {line.substring(4)}
            </Typography>
        );
      }

      // Render regular text with preserved line breaks
      return (
          <Typography
              key={index}
              variant="body1"
              component="p"
              sx={{ mb: 1, lineHeight: 1.6 }}
          >
            {line}
          </Typography>
      );
    });
  };

  if (postLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </Box>
    );
  }

  if (postError || !post?.data) {
    return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Post not found
          </Typography>
          <Button
              component={Link}
              to="/dashboard/posts"
              variant="contained"
              startIcon={<ArrowLeft />}
          >
            Back to Posts
          </Button>
        </Box>
    );
  }

  const postData = post.data;


  const postAuthorName = postData.users || 'Anonymous';

  const isAuthor = user && postData && postData.users === user.name;

  // 🔹 SAFELY ENSURE POST CONTENT IS A STRING
  const safePostContent =
      typeof postData.content === 'string'
          ? postData.content
          : 'No content available';

  // 🔹 SAFELY EXTRACT COMMENT AUTHOR NAME HELPER
  const getCommentAuthorName = (users: any) => {
    return users && typeof users === 'object'
        ? users.name
        : 'Anonymous';
  };

  return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
              component={Link}
              to="/dashboard/posts"
              variant="contained"
              startIcon={<ArrowLeft />}
          >
            Back to Posts
          </Button>

          {user && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    onClick={handleMenuOpen}
                    sx={{ color: 'text.secondary' }}
                    title="More options"
                >
                  <MoreHorizontal />
                </IconButton>
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleEdit} disabled={!isAuthor}>
                    <Edit style={{ marginRight: 8 }} />
                    Edit Post
                  </MenuItem>
                  <MenuItem onClick={handleDeleteMenu} disabled={!isAuthor}>
                    <Trash2 style={{ marginRight: 8 }} />
                    Delete Post
                  </MenuItem>
                </Menu>
              </Box>
          )}
        </Box>

        {/* Post Content */}
        <Paper sx={{ overflow: 'hidden' }}>
          {/* Post Header */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
              {postData.title || 'Untitled Post'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', typography: 'body2', color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* 🔹 UPDATED: Safe author name display */}
                <Box>By {postAuthorName}</Box>

                <Box>Created: {postData.createdAt ? format(new Date(postData.createdAt), 'MMM dd, yyyy') : 'Unknown'}</Box>
                {postData.updatedAt && postData.updatedAt !== postData.createdAt && (
                    <Box>Updated: {format(new Date(postData.updatedAt), 'MMM dd, yyyy')}</Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Post Body - FIXED: No dangerouslySetInnerHTML */}
          <Box sx={{ p: 3 }}>
            {/* 🔹 UPDATED: Use safePostContent */}
            {renderContent(safePostContent) || (
                <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No content available
                </Typography>
            )}
          </Box>

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
                    postComments.map((comment: CommentDto, index: number) => (
                        <Box key={comment.id || index} sx={{ display: 'flex', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'grey.400' }}>
                            <User />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {/* 🔹 UPDATED: Safe comment author name display */}
                                  {getCommentAuthorName(comment.users)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd, yyyy') : 'Recently'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {comment.content || 'No content'}
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