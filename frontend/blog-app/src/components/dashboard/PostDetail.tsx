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
  Tag
} from 'lucide-react';
import { Button, IconButton, Typography, Box, Paper, TextField, Avatar, Chip } from '@mui/material';
import BackendApi, { type CommentDto, type PostDto } from '../../service/BackendApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { downloadPost, downloadPostPdf } from '../../lib/download';
import { LikeButton } from './LikeButton';
import { LIVBlogCard, LIVBlogHeader, LIVBlogLayout } from '../ui';
import { useTheme } from '@mui/material/styles';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(true);
  const theme = useTheme();

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

  // Comment mutation
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
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 403) {
        toast.error('You are not authorized to delete this post.');
      } else if (status === 404) {
        toast.error('Post not found or already deleted.');
      } else {
        toast.error('Failed to delete post');
      }
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

  // Safe content formatting without dangerous HTML
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
          <Typography 
            key={index} 
            variant="h4" 
            component="h1" 
            sx={{ 
              mt: 3, 
              mb: 2, 
              fontWeight: 'bold',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {line.substring(2)}
          </Typography>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Typography 
            key={index} 
            variant="h5" 
            component="h2" 
            sx={{ 
              mt: 2, 
              mb: 1.5, 
              fontWeight: 'bold',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {line.substring(3)}
          </Typography>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Typography 
            key={index} 
            variant="h6" 
            component="h3" 
            sx={{ 
              mt: 1.5, 
              mb: 1, 
              fontWeight: 'bold',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
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
          sx={{ 
            mb: 1, 
            lineHeight: 1.6,
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {line}
        </Typography>
      );
    });
  };

  // Helper function to safely extract user name from user object
  const getUserName = (userObject: any): string => {
    if (!userObject) return 'Anonymous';

    // If it's already a string, return it
    if (typeof userObject === 'string') return userObject;

    // If it's an object with a name property
    if (typeof userObject === 'object' && userObject !== null) {
      // Try different possible name fields
      return userObject.name || userObject.username || userObject.email || 'Anonymous';
    }

    // Fallback
    return 'Anonymous';
  };

  if (postLoading) {
    return (
      <LIVBlogLayout.Container>
        <div className="aws-flex aws-items-center aws-justify-center" style={{ minHeight: '400px' }}>
          <div className="aws-spinner" style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </LIVBlogLayout.Container>
    );
  }

  if (postError || !post?.data) {
    return (
      <LIVBlogLayout.Container>
        <LIVBlogCard
          title="Post Not Found"
          variant="default"
          padding="large"
        >
          <div className="aws-text-center aws-py-6">
            <div 
              className="aws-text-red-600 aws-mb-3"
              style={{ 
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Post not found
            </div>
            <Button
              component={Link}
              to="/dashboard/posts"
              variant="contained"
              startIcon={<ArrowLeft />}
              className="aws-button aws-button-primary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Back to Posts
            </Button>
          </div>
        </LIVBlogCard>
      </LIVBlogLayout.Container>
    );
  }

  const postData = post.data as PostDto;

  // Safely get post author name
  const postAuthorName = getUserName(postData.users);

  // Determine if current user can edit/delete (author or admin)
  const canEditOrDelete = !!user && (postData.user?.id === user.id || user.roles?.includes('ADMIN' as any));

  // Safely ensure post content is a string
  const safePostContent = typeof postData.content === 'string'
      ? postData.content
      : 'No content available';

  // Helper to safely get comment data
  const getCommentData = (comment: CommentDto) => {
    return {
      id: comment.id,
      content: comment.content || 'No content',
      author: getUserName(comment.users),
      createdAt: comment.createdAt
    };
  };

  return (
    <LIVBlogLayout.Container>
      {/* Header */}
      <LIVBlogHeader
        title={postData.title || 'Untitled Post'}
        subtitle={`By ${postData.user?.name || postAuthorName} • ${postData.createdAt ? format(new Date(postData.createdAt), 'MMM dd, yyyy') : 'Unknown'}`}
        size="large"
        actions={
          <div className="aws-flex aws-gap-2">
            <Button
              component={Link}
              to="/dashboard/posts"
              variant="outlined"
              startIcon={<ArrowLeft />}
              className="aws-button aws-button-secondary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Back to Posts
            </Button>
            {canEditOrDelete && (
              <>
                <Button
                  component={Link}
                  to={`/dashboard/posts/${postId}/edit`}
                  variant="outlined"
                  startIcon={<Edit />}
                  className="aws-button aws-button-secondary"
                  style={{
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  variant="outlined"
                  startIcon={<Trash2 />}
                  className="aws-button"
                  style={{
                    color: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Post Content */}
      <LIVBlogCard
        variant="default"
        padding="large"
      >
        {/* Category */}
        {postData.category && (
          <div className="aws-mb-4">
            <Chip 
              icon={<Tag size={16} />}
              label={postData.category}
              variant="outlined"
              size="small"
              className="aws-chip"
              style={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </div>
        )}
        
        {/* Post Body */}
        <div className="aws-mb-6">
          {renderContent(safePostContent) || (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary', 
                fontStyle: 'italic',
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              No content available
            </Typography>
          )}
        </div>

        {/* Post Actions */}
        <div 
          className="aws-flex aws-justify-between aws-items-center aws-pt-4 aws-border-t"
          style={{ borderColor: theme.palette.divider }}
        >
          <div className="aws-flex aws-gap-2">
            <LikeButton 
              postId={postId}
              likes={postData.likes || 0}
              isLiked={postData.isLiked || false}
            />

            <Button
              onClick={() => setShowComments(!showComments)}
              startIcon={<MessageCircle />}
              size="small"
              className="aws-button aws-button-secondary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {postComments.length} Comments
            </Button>
          </div>

          <div className="aws-flex aws-gap-2">
            <Button
              onClick={() => downloadPost(postData)}
              startIcon={<Download />}
              size="small"
              className="aws-button aws-button-secondary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              TXT
            </Button>
            <Button
              onClick={() => downloadPostPdf(postData)}
              size="small"
              className="aws-button aws-button-secondary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              PDF
            </Button>
          </div>
        </div>
      </LIVBlogCard>

      {/* Comments Section */}
      {showComments && (
        <LIVBlogCard
          title={`Comments (${postComments.length})`}
          variant="default"
          padding="large"
        >
          {/* Add Comment Form */}
          {user ? (
            <div className="aws-mb-6">
              <div className="aws-flex aws-gap-3">
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                </Avatar>
                <div className="aws-flex-1">
                  <form onSubmit={handleComment}>
                    <TextField
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      multiline
                      rows={3}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        style: {
                          fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                      }}
                    />
                    <div className="aws-flex aws-justify-end aws-mt-2">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={commentMutation.isPending || !commentText.trim()}
                        startIcon={<Send />}
                        className="aws-button aws-button-primary"
                        style={{
                          fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="aws-mb-6 aws-p-4 aws-border aws-rounded-lg aws-text-center"
              style={{ 
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  color: 'text.secondary',
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Please login to comment on this post
              </Typography>
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
                className="aws-button aws-button-primary"
                style={{
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Login
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="aws-flex aws-flex-col aws-gap-4">
            {commentsLoading ? (
              <div className="aws-text-center aws-py-4">
                <div className="aws-spinner" style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
              </div>
            ) : postComments.length === 0 ? (
              <div 
                className="aws-text-center aws-py-8"
                style={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                No comments yet. Be the first to comment!
              </div>
            ) : (
              postComments.map((comment: CommentDto, index: number) => {
                const commentData = getCommentData(comment);
                return (
                  <div key={commentData.id || index} className="aws-flex aws-gap-3">
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      {commentData.author.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="aws-flex-1">
                      <div 
                        className="aws-p-4 aws-border aws-rounded-lg"
                        style={{ 
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider
                        }}
                      >
                        <div className="aws-flex aws-justify-between aws-items-center aws-mb-2">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'medium',
                              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}
                          >
                            {commentData.author}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}
                          >
                            {commentData.createdAt ? format(new Date(commentData.createdAt), 'MMM dd, yyyy') : 'Recently'}
                          </Typography>
                        </div>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.primary',
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}
                        >
                          {commentData.content}
                        </Typography>
                      </div>
                      <div className="aws-flex aws-gap-4 aws-mt-2">
                        <Button
                          size="small"
                          startIcon={<ThumbsUp />}
                          className="aws-button aws-button-secondary"
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}
                        >
                          Like
                        </Button>
                        <Button
                          size="small"
                          className="aws-button aws-button-secondary"
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                          }}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </LIVBlogCard>
      )}
    </LIVBlogLayout.Container>
  );
};