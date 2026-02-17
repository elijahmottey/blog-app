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
  Tag,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button, IconButton, Typography, Box, Paper, TextField, Avatar, Chip, CircularProgress } from '@mui/material';
import BackendApi, { type CommentDto, type PostDto } from '../../service/BackendApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { downloadPost, downloadPostPdf } from '../../lib/download';
import { LikeButton } from './LikeButton';
import { LIVBlogCard, LIVBlogHeader, LIVBlogLayout } from '../ui';
import { useTheme, alpha } from '@mui/material/styles';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [readingSpeed, setReadingSpeed] = useState(0.8);
  const [alternateVoices, setAlternateVoices] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(-1);
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

  const handleReadPost = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      setCurrentParagraph(-1);
      return;
    }

    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('hazel')
    ) || voices[0];
    const maleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('mark')
    ) || voices[1] || voices[0];

    const paragraphs = [
      'Thank you for the opportunity to read to your hearing.',
      `The title of this post is: ${postData.title || 'Untitled Post'}.`,
      ...safePostContent.split('\n').filter(p => p.trim()),
      'Thank you once again for the opportunity to read for you. LIV Blog is here to serve you.'
    ];
    let currentIndex = 0;

    const readNextParagraph = () => {
      if (currentIndex >= paragraphs.length) {
        setIsReading(false);
        setCurrentParagraph(-1);
        return;
      }

      setCurrentParagraph(currentIndex - 2); // Adjust for intro and title messages
      const text = paragraphs[currentIndex].replace(/[#*]/g, '');
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (alternateVoices && currentIndex > 1 && currentIndex < paragraphs.length - 1) {
        utterance.voice = (currentIndex - 2) % 2 === 0 ? femaleVoice : maleVoice;
      } else {
        utterance.voice = voiceGender === 'female' ? femaleVoice : maleVoice;
      }
      
      utterance.rate = readingSpeed;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        currentIndex++;
        setTimeout(readNextParagraph, 500);
      };
      
      utterance.onerror = () => {
        setIsReading(false);
        setCurrentParagraph(-1);
      };
      
      speechSynthesis.speak(utterance);
    };

    setIsReading(true);
    readNextParagraph();
  };

  // Safe content formatting without dangerous HTML
  const renderContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');

    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Handle images
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        const [, altText, imageUrl] = imageMatch;
        return (
          <img 
            key={index}
            src={imageUrl} 
            alt={altText || 'Image'} 
            style={{
              maxWidth: '100%', 
              height: 'auto', 
              margin: '1rem 0', 
              borderRadius: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        );
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

      // Handle bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
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
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
            )}
          </Typography>
        );
      }

      // Handle italic text
      const italicRegex = /\*(.*?)\*/g;
      if (italicRegex.test(line)) {
        const parts = line.split(italicRegex);
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
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? <em key={partIndex}>{part}</em> : part
            )}
          </Typography>
        );
      }

      // Handle links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      if (linkRegex.test(line)) {
        const parts = line.split(linkRegex);
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
            {parts.map((part, partIndex) => {
              if (partIndex % 3 === 1) {
                const url = parts[partIndex + 1];
                return (
                  <a key={partIndex} href={url} target="_blank" rel="noopener noreferrer">
                    {part}
                  </a>
                );
              }
              if (partIndex % 3 === 2) return null;
              return part;
            })}
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
    <div style={{ 
      padding: window.innerWidth < 768 ? '16px' : '32px', 
      maxWidth: '1200px', 
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: window.innerWidth < 768 ? '20px' : '32px' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
          gap: window.innerWidth < 768 ? '12px' : '16px', 
          marginBottom: window.innerWidth < 768 ? '16px' : '24px'
        }}>
          <Button
            component={Link}
            to="/dashboard/posts"
            variant="outlined"
            startIcon={<ArrowLeft />}
            style={{
              borderRadius: '10px',
              padding: '8px 16px'
            }}
          >
            Back to Posts
          </Button>
          {canEditOrDelete && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px',
              width: '100%'
            }}>
              <Button
                component={Link}
                to={`/dashboard/posts/${postId}/edit`}
                variant="outlined"
                startIcon={<Edit />}
                size={window.innerWidth < 768 ? "small" : "medium"}
                style={{
                  borderRadius: '10px',
                  borderColor: theme.palette.warning.main,
                  color: theme.palette.warning.main,
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
                }}
              >
                Edit Post
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                variant="outlined"
                startIcon={<Trash2 />}
                size={window.innerWidth < 768 ? "small" : "medium"}
                style={{
                  borderRadius: '10px',
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
                }}
              >
                Delete Post
              </Button>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '1.875rem' : '2.5rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            margin: '0 0 12px 0',
            lineHeight: 1.2
          }}>
            {postData.title || 'Untitled Post'}
          </h1>
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
            gap: window.innerWidth < 768 ? '8px' : '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {(postData.user?.name || postAuthorName).charAt(0).toUpperCase()}
              </Avatar>
              <span style={{ 
                fontSize: '0.875rem', 
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}>
                By {postData.user?.name || postAuthorName}
              </span>
            </div>
            <span style={{ color: theme.palette.text.secondary }}>•</span>
            <span style={{ 
              fontSize: '0.875rem', 
              color: theme.palette.text.secondary 
            }}>
              {postData.createdAt ? format(new Date(postData.createdAt), 'MMM dd, yyyy') : 'Unknown'}
            </span>
            {postData.category && (
              <>
                <span style={{ color: theme.palette.text.secondary }}>•</span>
                <Chip 
                  icon={<Tag size={14} />}
                  label={postData.category}
                  variant="outlined"
                  size="small"
                  style={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontSize: '0.75rem'
                  }}
                />
              </>
            )}
          </div>
          
          {/* Audio Controls */}
          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                onClick={handleReadPost}
                startIcon={isReading ? <VolumeX /> : <Volume2 />}
                variant={isReading ? 'contained' : 'outlined'}
                size="small"
                style={{
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                {isReading ? 'Stop' : 'Listen'}
              </Button>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={alternateVoices}
                  onChange={(e) => setAlternateVoices(e.target.checked)}
                />
                Alternate Voices
              </label>
              
              {!alternateVoices && (
                <select
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value as 'male' | 'female')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.palette.divider}`,
                    fontSize: '0.75rem',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <option value="female">Female Voice</option>
                  <option value="male">Male Voice</option>
                </select>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>Speed:</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={readingSpeed}
                  onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                  style={{ width: '60px' }}
                />
                <span style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, minWidth: '30px' }}>
                  {readingSpeed}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <LIVBlogCard
        variant="elevated"
        padding={window.innerWidth < 768 ? "medium" : "large"}
        style={{ marginBottom: window.innerWidth < 768 ? '20px' : '32px' }}
      >
        {/* Post Body */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: theme.palette.text.primary
          }}>
            {renderContent(safePostContent)}
          </div>
        </div>

        {/* Post Actions */}
        <div 
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            justifyContent: window.innerWidth < 768 ? 'flex-start' : 'space-between',
            alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
            gap: window.innerWidth < 768 ? '16px' : '0px',
            paddingTop: window.innerWidth < 768 ? '16px' : '24px',
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: window.innerWidth < 768 ? '12px' : '16px'
          }}>
            <LikeButton 
              postId={postId}
              likes={postData.likes || 0}
              isLiked={postData.isLiked || false}
            />

            <Button
              onClick={() => setShowComments(!showComments)}
              startIcon={<MessageCircle />}
              variant="outlined"
              size={window.innerWidth < 768 ? "small" : "medium"}
              style={{
                borderRadius: '10px',
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                color: theme.palette.secondary.main,
                backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
              }}
            >
              {postComments.length} Comments
            </Button>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: window.innerWidth < 768 ? '8px' : '12px'
          }}>
            <Button
              onClick={handleReadPost}
              startIcon={isReading ? <VolumeX /> : <Volume2 />}
              variant="outlined"
              size={window.innerWidth < 768 ? "small" : "medium"}
              style={{
                borderRadius: '10px',
                borderColor: alpha(theme.palette.success.main, 0.3),
                color: theme.palette.success.main,
                backgroundColor: isReading ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
              }}
            >
              {isReading ? 'Stop Reading' : 'Read Aloud'}
            </Button>
            <Button
              onClick={() => downloadPost(postData)}
              startIcon={<Download />}
              variant="outlined"
              size={window.innerWidth < 768 ? "small" : "medium"}
              style={{
                borderRadius: '10px',
                borderColor: alpha(theme.palette.info.main, 0.3),
                color: theme.palette.info.main,
                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
              }}
            >
              {window.innerWidth < 768 ? 'TXT' : 'Download TXT'}
            </Button>
            <Button
              onClick={() => downloadPostPdf(postData)}
              variant="outlined"
              size={window.innerWidth < 768 ? "small" : "medium"}
              style={{
                borderRadius: '10px',
                borderColor: alpha(theme.palette.info.main, 0.3),
                color: theme.palette.info.main,
                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
              }}
            >
              {window.innerWidth < 768 ? 'PDF' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </LIVBlogCard>

      {/* Comments Section */}
      {showComments && (
        <LIVBlogCard
          title={`Comments (${postComments.length})`}
          subtitle="Join the conversation"
          variant="elevated"
          padding="xl"
        >
          {/* Add Comment Form */}
          {user ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px'
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <form onSubmit={handleComment}>
                    <TextField
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: alpha(theme.palette.background.paper, 0.5)
                        }
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={commentMutation.isPending || !commentText.trim()}
                        startIcon={<Send />}
                        size={window.innerWidth < 768 ? "small" : "medium"}
                        style={{
                          borderRadius: '10px',
                          padding: window.innerWidth < 768 ? '8px 16px' : '10px 24px',
                          fontWeight: 600,
                          fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem'
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
              style={{
                marginBottom: '32px',
                padding: '32px',
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1, 
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                Join the Discussion
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2, 
                  color: 'text.secondary'
                }}
              >
                Please login to share your thoughts and engage with other readers
              </Typography>
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
                size={window.innerWidth < 768 ? "medium" : "large"}
                style={{
                  borderRadius: '10px',
                  padding: window.innerWidth < 768 ? '10px 24px' : '12px 32px',
                  fontWeight: 600,
                  fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                }}
              >
                Login to Comment
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px'
          }}>
            {commentsLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                  Loading comments...
                </Typography>
              </div>
            ) : postComments.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: '12px',
                border: `1px dashed ${theme.palette.divider}`
              }}>
                <MessageCircle size={48} style={{ color: theme.palette.text.secondary, marginBottom: '16px' }} />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  No comments yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Be the first to share your thoughts on this post!
                </Typography>
              </div>
            ) : (
              postComments.map((comment: CommentDto, index: number) => {
                const commentData = getCommentData(comment);
                return (
                  <div key={commentData.id || index} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      {commentData.author.charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div 
                        style={{
                          padding: '20px',
                          borderRadius: '12px',
                          backgroundColor: alpha(theme.palette.background.paper, 0.7),
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.primary'
                            }}
                          >
                            {commentData.author}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            {commentData.createdAt ? format(new Date(commentData.createdAt), 'MMM dd, yyyy') : 'Recently'}
                          </Typography>
                        </div>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.primary',
                            lineHeight: 1.6
                          }}
                        >
                          {commentData.content}
                        </Typography>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingLeft: '4px' }}>
                        <Button
                          size="small"
                          startIcon={<ThumbsUp size={14} />}
                          style={{
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                            textTransform: 'none',
                            minWidth: 'auto',
                            padding: '4px 8px'
                          }}
                        >
                          Like
                        </Button>
                        <Button
                          size="small"
                          style={{
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                            textTransform: 'none',
                            minWidth: 'auto',
                            padding: '4px 8px'
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
    </div>
  );
};