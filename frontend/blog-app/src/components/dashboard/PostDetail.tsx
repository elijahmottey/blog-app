import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MessageCircle,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  User,
  Download,
  Tag,
  Volume2,
  VolumeX,
  Flag,
  MoreVertical,
  Bookmark,
  Highlighter,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  Share2,
  Maximize,
  Minimize,
  Twitter,
  Smartphone
} from 'lucide-react';
import { Button, Typography, TextField, Avatar, Chip, CircularProgress, IconButton, Menu, MenuItem, Box, Tooltip } from '@mui/material';
import BackendApi, { type CommentDto, type PostDto } from '../../service/BackendApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { downloadPost, downloadPostPdf } from '../../lib/download';
import { LikeButton } from './LikeButton';
import { LIVBlogCard, LIVBlogLayout } from '../ui';
import { useTheme, alpha } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";
import { useNotifications } from '../../hooks/useNotifications';
import { ChatWindow } from '../chat/ChatWindow';

// CommentThread component for nested replies
const CommentThread: React.FC<{
  comment: any;
  level: number;
  theme: any;
  user: any;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReply: (id: number) => void;
  replyMutation: any;
  onLike: (commentId: number) => void;
  onDislike: (commentId: number) => void;
}> = ({ comment, level, theme, user, replyingTo, setReplyingTo, replyText, setReplyText, handleReply, replyMutation, onLike, onDislike }) => {
  const indent = level * 32;
  const colors = [
    { bg: alpha(theme.palette.background.paper, 0.7), border: alpha(theme.palette.divider, 0.5), avatar: theme.palette.primary.main, size: 40 },
    { bg: alpha(theme.palette.secondary.main, 0.08), border: alpha(theme.palette.secondary.main, 0.3), avatar: theme.palette.secondary.main, size: 36 },
    { bg: alpha(theme.palette.info.main, 0.06), border: alpha(theme.palette.info.main, 0.25), avatar: theme.palette.info.main, size: 32 }
  ];
  const style = colors[Math.min(level, 2)];

  return (
    <div style={{ marginLeft: `${indent}px`, position: 'relative' }}>
      {level > 0 && (
        <div style={{
          position: 'absolute',
          left: '-16px',
          top: '20px',
          width: '2px',
          height: 'calc(100% - 20px)',
          backgroundColor: style.border
        }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <Avatar sx={{ bgcolor: style.avatar, width: style.size, height: style.size }}>
          {comment.author.charAt(0).toUpperCase()}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={{
            padding: level === 0 ? '20px' : level === 1 ? '16px' : '12px',
            borderRadius: '12px',
            backgroundColor: style.bg,
            border: `1px solid ${style.border}`,
            borderLeft: level > 0 ? `3px solid ${style.avatar}` : `1px solid ${style.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: level > 1 ? '0.8rem' : '0.875rem' }}>
                {comment.author}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd, yyyy') : 'Recently'}
              </Typography>
            </div>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, fontSize: level > 1 ? '0.8rem' : '0.875rem' }}>
              {comment.content}
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingLeft: '4px' }}>
            <Button
              size="small"
              startIcon={<ThumbsUp size={12} />}
              onClick={() => onLike(comment.id)}
              style={{
                fontSize: '0.7rem',
                color: comment.isLiked ? theme.palette.success.main : theme.palette.text.secondary,
                textTransform: 'none',
                minWidth: 'auto',
                padding: '4px 8px',
                fontWeight: comment.isLiked ? 600 : 400
              }}
            >
              {comment.likes || 0}
            </Button>
            <Button
              size="small"
              startIcon={<ThumbsUp size={12} style={{ transform: 'rotate(180deg)' }} />}
              onClick={() => onDislike(comment.id)}
              style={{
                fontSize: '0.7rem',
                color: comment.isDisliked ? theme.palette.error.main : theme.palette.text.secondary,
                textTransform: 'none',
                minWidth: 'auto',
                padding: '4px 8px',
                fontWeight: comment.isDisliked ? 600 : 400
              }}
            >
              {comment.dislikes || 0}
            </Button>
            <Button size="small" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} style={{ fontSize: '0.7rem', color: theme.palette.text.secondary, textTransform: 'none', minWidth: 'auto', padding: '4px 8px' }}>
              {replyingTo === comment.id ? 'Cancel' : 'Reply'}
            </Button>
          </div>
          {replyingTo === comment.id && user && (
            <div style={{ marginTop: '12px', paddingLeft: '4px' }}>
              <TextField value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." multiline rows={2} fullWidth variant="outlined" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.8rem' } }} />
              <Button onClick={() => handleReply(comment.id!)} disabled={replyMutation.isPending || !replyText.trim()} variant="contained" size="small" startIcon={<Send size={12} />} style={{ marginTop: '8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {comment.replies.map((reply: any, idx: number) => (
            <CommentThread key={reply.id || idx} comment={reply} level={level + 1} theme={theme} user={user} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyText={replyText} setReplyText={setReplyText} handleReply={handleReply} replyMutation={replyMutation} onLike={onLike} onDislike={onDislike} />
          ))}
        </div>
      )}
    </div>
  );
};

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { markPostAsRead } = useNotifications(isAdmin);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [voiceTone, setVoiceTone] = useState<'clear' | 'power'>('power');
  const [voicePreset, setVoicePreset] = useState<'podcastA' | 'podcastB'>('podcastA');
  const [readingSpeed, setReadingSpeed] = useState(0.8);
  const [alternateVoices, setAlternateVoices] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(-1);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // View mode state
  const [isBookMode, setIsBookMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const postContainerRef = useRef<HTMLDivElement>(null);

  // Share state
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const openShare = Boolean(shareAnchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const postId = parseInt(id || '0');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      postContainerRef.current?.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = post?.data?.title || 'Check out this post!';
    const text = encodeURIComponent(title);

    if (platform === 'native' && navigator.share) {
      navigator.share({ title: title, url: window.location.href }).catch(console.error);
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
    handleShareClose();
  };
  const isUsingSpeechRef = useRef<boolean>(false);

  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight === 'true') {
      setIsHighlighted(true);
      markPostAsRead(postId);
      setTimeout(() => setIsHighlighted(false), 30000);
    }
  }, [searchParams, postId, markPostAsRead]);

  // Fetch post details
  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => BackendApi.getPostById(postId),
    enabled: !!postId,
    retry: 1,
  });

  useDocumentTitle(`LIVBlog | ${post?.data?.title || 'Untitled Post'}`);

  // Fetch comments for this post
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => BackendApi.getCommentsByPostId(postId),
    enabled: !!postId,
  });

  // Fetch highlights
  const { data: highlightsData } = useQuery({
    queryKey: ['highlights', postId],
    queryFn: () => BackendApi.getHighlights(postId),
    enabled: !!postId && !!user,
  });

  const highlights = highlightsData?.data || [];


  // Comments for this post
  const postComments = (commentsData?.data as any)?.content || [];

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

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ parentId, content }: { parentId: number; content: string }) =>
      BackendApi.replyToComment(postId, parentId, { content } as CommentDto),
    onSuccess: () => {
      toast.success('Reply added!');
      setReplyText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
    onError: (error: any) => {
      toast.error('Failed to add reply: ' + (error.message || 'Unknown error'));
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: number) => BackendApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
    onError: () => toast.error('Failed to like comment'),
  });

  // Dislike comment mutation
  const dislikeCommentMutation = useMutation({
    mutationFn: (commentId: number) => BackendApi.dislikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
    onError: () => toast.error('Failed to dislike comment'),
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

  // Report post mutation
  const reportMutation = useMutation({
    mutationFn: (reason: string) => BackendApi.reportPost(postId, reason),
    onSuccess: () => {
      toast.success('Post reported successfully');
    },
    onError: (err: any) => {
      if (err?.message?.includes('already reported')) {
        toast.error('You have already reported this post');
      } else {
        toast.error('Failed to report post');
      }
    },
  });

  // LIVMark mutation
  const livMarkMutation = useMutation({
    mutationFn: () => BackendApi.toggleLIVMark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success(postData.isSaved ? 'Removed from LIVSave' : 'Saved to LIVSave');
    },
    onError: () => toast.error('Failed to update bookmark'),
  });

  // Highlight mutation
  const highlightMutation = useMutation({
    mutationFn: (data: any) => BackendApi.addHighlight(postId, data),
    onSuccess: () => {
      toast.success('Highlight added');
      queryClient.invalidateQueries({ queryKey: ['highlights', postId] });
    },
    onError: () => toast.error('Failed to add highlight'),
  });

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

  const handleReply = (parentId: number) => {
    if (!user) {
      toast.error('Please login to reply');
      return;
    }
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    replyMutation.mutate({ parentId, content: replyText });
  };

  const handleLikeComment = (commentId: number) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const handleDislikeComment = (commentId: number) => {
    if (!user) {
      toast.error('Please login to dislike comments');
      return;
    }
    dislikeCommentMutation.mutate(commentId);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleReport = () => {
    const reason = prompt('Why are you reporting this post?');
    if (reason && reason.trim()) {
      reportMutation.mutate(reason.trim());
    }
  };

  const handleTextSelection = () => {
    if (!user) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString();
    if (!text.trim()) return;

    // Simple check to ensure we are selecting inside the post content
    // This is a basic implementation.

    const start = safePostContent.indexOf(text);
    if (start === -1) return;

    // Confirm adding highlight
    if (window.confirm('Do you want to highlight this text and add a note?')) {
      const note = prompt("Add a note (optional):");
      highlightMutation.mutate({
        selectedText: text,
        note: note,
        startOffset: start,
        endOffset: start + text.length,
        color: 'yellow'
      });
      selection.removeAllRanges();
    }
  };

  const handleReadPost = () => {
    // If already reading, stop appropriately (audio element or speechSynthesis)
    if (isReading) {
      if (audioRef.current) {
        // stop HTMLAudioElement playback
        try { audioRef.current.pause(); } catch (e) { /* ignore */ }
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      }

      // If speechSynthesis is speaking/paused, cancel it
      if (speechSynthesis.speaking || speechSynthesis.paused) {
        try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      }

      setIsReading(false);
      setCurrentParagraph(-1);
      setIsPaused(false);
      return;
    }

    // Ensure any in-progress speechSynthesis is canceled to avoid overlapping audio
    try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }

    // Try backend TTS first (not all environments support speechSynthesis reliably)
    const doBackendTts = async () => {
      try {
        const textToRead = safePostContent || '';
        if (!textToRead) {
          toast.error('No content to read');
          return;
        }
        setGeneratingAudio(true);
        isUsingSpeechRef.current = false;
        const blob = await BackendApi.generateTts({ text: textToRead, gender: voiceGender, tone: voiceTone, rate: readingSpeed, alternate: alternateVoices, preset: voicePreset });
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.playbackRate = readingSpeed;
        audio.onplay = () => { setIsPaused(false); setIsReading(true); };
        audio.onpause = () => { setIsPaused(true); };
        audio.onended = () => {
          setIsReading(false);
          setIsPaused(false);
          setCurrentParagraph(-1);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          audioRef.current = null;
        };
        audio.onerror = () => {
          // fallback to speechSynthesis
          console.warn('Backend TTS failed, falling back to speechSynthesis');
          setIsReading(false);
          audioRef.current = null;
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          setGeneratingAudio(false);
          isUsingSpeechRef.current = true;
          startSpeechSynthesis();
        };
        await audio.play();
        setIsReading(true);
        setIsPaused(false);
        setGeneratingAudio(false);
      } catch (err) {
        console.warn('Backend TTS error', err);
        setGeneratingAudio(false);
        isUsingSpeechRef.current = true;
        startSpeechSynthesis();
      }
    };

    const startSpeechSynthesis = () => {
      if (isReading) return;

      const voices = speechSynthesis.getVoices();

      const choosePreferred = (gender: 'male' | 'female') => {
        // Preset-aware preference lists tuned for podcast-style voices
        const podcastAPrefer = gender === 'male'
          ? ['matthew', 'david', 'mark', 'alloy', 'brian']
          : ['zira', 'amy', 'samantha', 'joanna'];

        const podcastBPrefer = gender === 'male'
          ? ['david', 'mark', 'alloy']
          : ['samantha', 'joanna', 'kendra', 'zira', 'amy'];

        const tonePrefer = voiceTone === 'power'
          ? ['david', 'matthew', 'mark', 'alloy', 'google', 'neural']
          : ['samantha', 'joanna', 'zira', 'amy', 'alloy', 'google', 'neural'];

        const basePrefer = voicePreset === 'podcastA' ? podcastAPrefer : podcastBPrefer;

        // Try preset list first
        for (const p of basePrefer) {
          const found = voices.find(v => v.name.toLowerCase().includes(p));
          if (found) return found;
        }

        // Then try tone-preferred list
        for (const p of tonePrefer) {
          const found = voices.find(v => v.name.toLowerCase().includes(p));
          if (found) return found;
        }

        // fallback by simple gender keyword in name
        const byGender = voices.find(v => (gender === 'female' ? /female|female voice|samantha|joanna|zira|amy/.test(v.name.toLowerCase()) : /male|male voice|david|mark|matthew|brian/.test(v.name.toLowerCase())));
        if (byGender) return byGender;
        return voices[0];
      };

      const femaleVoice = choosePreferred('female');
      const maleVoice = choosePreferred('male');

      const paragraphs = [
        'Thank you for the opportunity to read to your hearing.',
        `The title of this post is: ${postData.title || 'Untitled Post'}.`,
        `Category: ${postData.category || 'Uncategorized'}.`,
        `Author: ${postData.user?.name || postAuthorName}.`,
        ...safePostContent.split('\n').filter(p => p.trim()),
        'Thank you once again for the opportunity to read for you, God loves you. Stay blessed. LIV Blog is here to serve you.'
      ];
      let currentIndex = 0;

      const readNextParagraph = () => {
        if (currentIndex >= paragraphs.length) {
          setIsReading(false);
          setCurrentParagraph(-1);
          return;
        }

        setCurrentParagraph(currentIndex >= 4 ? currentIndex - 4 : -1);
        const text = paragraphs[currentIndex].replace(/[#*]/g, '');
        const utterance = new SpeechSynthesisUtterance(text);

        if (alternateVoices && currentIndex > 3 && currentIndex < paragraphs.length - 1) {
          utterance.voice = (currentIndex - 4) % 2 === 0 ? femaleVoice : maleVoice;
        } else {
          utterance.voice = voiceGender === 'female' ? femaleVoice : maleVoice;
        }

        // Tone + preset adjustments (tune rate/pitch for podcast-like delivery)
        const presetRateMultiplier = voicePreset === 'podcastA' ? 0.94 : 1.02;
        const presetPitch = voicePreset === 'podcastA' ? 0.95 : 1.03;
        const toneRateMultiplier = voiceTone === 'power' ? 0.92 : 1.02;

        utterance.rate = Math.max(0.5, Math.min(2, readingSpeed * toneRateMultiplier * presetRateMultiplier));
        utterance.pitch = Math.max(0.5, Math.min(2, presetPitch));
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

    // Kick off backend TTS; on failure, fallback to speechSynthesis
    doBackendTts();
  };

  const handlePauseResume = () => {
    // If using backend audio element
    if (!isUsingSpeechRef.current && audioRef.current) {
      try {
        if (audioRef.current.paused) {
          audioRef.current.play();
          // set states; verify shortly
          setIsPaused(false);
          setIsReading(true);
          setTimeout(() => {
            setIsPaused(audioRef.current ? audioRef.current.paused : false);
            setIsReading(!!audioRef.current && !audioRef.current.paused);
          }, 150);
        } else {
          audioRef.current.pause();
          setIsPaused(true);
          setIsReading(true);
          setTimeout(() => {
            setIsPaused(audioRef.current ? audioRef.current.paused : true);
          }, 150);
        }
      } catch (e) {
        console.warn('Audio pause/resume failed', e);
        // fallback: toggle state
        setIsPaused((p) => !p);
      }
      return;
    }

    // Otherwise control speechSynthesis
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      try { speechSynthesis.pause(); } catch (e) { /* ignore */ }
      setIsPaused(true);
      setIsReading(true);
      return;
    }

    if (speechSynthesis.paused) {
      try { speechSynthesis.resume(); } catch (e) { /* ignore */ }
      setIsPaused(false);
      setIsReading(true);
      return;
    }
    // nothing to pause/resume
  };

  useEffect(() => {
    return () => {
      // cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      speechSynthesis.cancel();
    };
  }, []);

  // Sync playbackRate when readingSpeed changes
  useEffect(() => {
    if (audioRef.current) {
      try { audioRef.current.playbackRate = readingSpeed; } catch (e) { /* ignore */ }
    }
  }, [readingSpeed]);

  // Safe content formatting without dangerous HTML
  const renderContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');

    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Handle markdown images
      const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      if (mdImageRegex.test(line)) {
        const parts = line.split(mdImageRegex);
        return (
          <Typography key={index} variant="body1" component="div" sx={{ mb: 1, textAlign: 'center' }}>
            {parts.map((part, partIndex) => {
              if (partIndex % 3 === 1) return null; // alt text (we use it in the next step)
              if (partIndex % 3 === 2) {
                let imageUrl = part.trim();
                let altText = parts[partIndex - 1] || 'Image';

                // Support optional title after the url: ![alt](url "title")
                const titleMatch = imageUrl.match(/^([^\s"]+)(?:\s+"([^"]+)")?$/);
                if (titleMatch) {
                  imageUrl = titleMatch[1];
                  if (titleMatch[2]) altText = titleMatch[2];
                }

                let src = imageUrl;
                if (!/^https?:\/\//i.test(src) && !/^data:|^blob:/i.test(src)) {
                  const base = (import.meta.env.VITE_API_BASE_URL || '').toString();
                  if (base) {
                    src = base.replace(/\/$/, '') + '/' + src.replace(/^\//, '');
                  }
                }

                return (
                  <img
                    key={partIndex}
                    src={src}
                    alt={altText}
                    loading="lazy"
                    onError={(e) => { try { (e.currentTarget as HTMLImageElement).style.display = 'none'; } catch { } }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '600px',
                      height: 'auto',
                      margin: '1rem 0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                );
              }
              // Regular text
              return part ? <span key={partIndex}>{part}</span> : null;
            })}
          </Typography>
        );
      }

      // Handle raw image URLs that aren't inside markdown links
      const rawImageRegex = /(https?:\/\/[^\s"'>]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s"'>]*)?)/i;
      if (rawImageRegex.test(line) && !line.includes('](')) {
        const parts = line.split(new RegExp(rawImageRegex, 'gi'));
        return (
          <Typography key={index} variant="body1" component="div" sx={{ mb: 1, textAlign: 'center' }}>
            {parts.map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                return (
                  <img
                    key={partIndex}
                    src={part}
                    alt="Embedded"
                    loading="lazy"
                    onError={(e) => { try { (e.currentTarget as HTMLImageElement).style.display = 'none'; } catch { } }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '600px',
                      height: 'auto',
                      margin: '1rem 0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                );
              }
              return part ? <span key={partIndex}>{part}</span> : null;
            })}
          </Typography>
        );
      }

      // Handle headers
      if (line.startsWith('# ')) {
        const text = line.substring(2);
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <Typography
            key={index}
            id={id}
            variant="h4"
            component="h1"
            sx={{
              mt: 3,
              mb: 2,
              fontWeight: 'bold',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {text}
          </Typography>
        );
      }
      if (line.startsWith('## ')) {
        const text = line.substring(3);
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <Typography
            key={index}
            id={id}
            variant="h5"
            component="h2"
            sx={{
              mt: 2,
              mb: 1.5,
              fontWeight: 'bold',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {text}
          </Typography>
        );
      }
      if (line.startsWith('### ')) {
        const text = line.substring(4);
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <Typography
            key={index}
            id={id}
            variant="h6"
            component="h3"
            sx={{
              mt: 1.5,
              mb: 1,
              fontWeight: 'bold',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {text}
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
      const linkRegex = /\[([^]]+)]\(([^)]+)\)/g;
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
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: currentParagraph === index ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            padding: currentParagraph === index ? '8px' : '0',
            borderRadius: currentParagraph === index ? '4px' : '0',
            transition: 'all 0.3s ease'
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
    if (typeof userObject === 'object') {
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
    const errorMessage = (postError as any)?.status === 500
      ? 'Server error loading this post. The post may not exist or there was a database issue.'
      : 'Post not found';

    return (
      <LIVBlogLayout.Container>
        <LIVBlogCard
          title="Error Loading Post"
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
              {errorMessage}
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

  const getPages = (content: string) => {
    const blocks = content.split(/\n\s*\n/);
    const pages: string[] = [];
    let currentPageContent = '';
    const CHAR_LIMIT = 950;

    for (const block of blocks) {
      if ((currentPageContent.length + block.length) > CHAR_LIMIT && currentPageContent.length > 0) {
        pages.push(currentPageContent);
        currentPageContent = block;
      } else {
        currentPageContent += (currentPageContent ? '\n\n' : '') + block;
      }
    }
    if (currentPageContent) {
      pages.push(currentPageContent);
    }
    return pages.length > 0 ? pages : ['No content available'];
  };

  const pages = getPages(safePostContent);

  // Helper to safely get comment data
  const getCommentData = (comment: CommentDto) => {
    return {
      id: comment.id,
      content: comment.content || 'No content',
      author: getUserName(comment.users),
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      isLiked: comment.isLiked || false,
      isDisliked: comment.isDisliked || false
    };
  };

  // Organize comments into parent-child structure
  const organizeComments = (comments: CommentDto[]) => {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      const data = getCommentData(comment);
      commentMap.set(data.id, { ...data, replies: [] });
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      const data = getCommentData(comment);
      const commentWithReplies = commentMap.get(data.id);

      if (data.parentId && commentMap.has(data.parentId)) {
        commentMap.get(data.parentId).replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const extractHeadings = (content: string) => {
    const lines = content.split('\n');
    const headings = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.*)/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        headings.push({ id, text, level });
      }
    }
    return headings;
  };

  const postHeadings = extractHeadings(safePostContent);

  // @ts-ignore
  return (
    <motion.div
      ref={postContainerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        padding: isMobile ? '8px' : '16px',
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: isFullscreen ? theme.palette.background.default : 'transparent',
        overflowY: isFullscreen ? 'auto' : 'visible'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          marginBottom: isMobile ? '12px' : '16px'
        }}>
          <Button
            component={Link}
            to="/dashboard/posts"
            variant="text"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            style={{
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              textTransform: 'none',
              color: theme.palette.text.secondary
            }}
          >
            Back
          </Button>
          <div style={{ marginLeft: 'auto' }}>
            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertical />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {canEditOrDelete && (
                <MenuItem component={Link} to={`/dashboard/posts/${postId}/edit`} onClick={() => handleClose()}>
                  <Edit size={16} style={{ marginRight: '8px', color: theme.palette.warning.main }} />
                  <span style={{ color: theme.palette.warning.main }}>Edit Post</span>
                </MenuItem>
              )}
              {canEditOrDelete && (
                <MenuItem onClick={() => { handleDelete(); handleClose(); }} disabled={deleteMutation.isPending}>
                  <Trash2 size={16} style={{ marginRight: '8px', color: theme.palette.error.main }} />
                  <span style={{ color: theme.palette.error.main }}>Delete Post</span>
                </MenuItem>
              )}
              {canEditOrDelete && <div style={{ height: '1px', backgroundColor: theme.palette.divider, margin: '4px 0' }} />}
              <MenuItem onClick={() => { handleReadPost(); handleClose(); }}>
                <Volume2 size={16} style={{ marginRight: '8px' }} />
                {isReading ? 'Stop Reading' : 'Read Aloud'}
              </MenuItem>
              <MenuItem onClick={() => { downloadPost(postData, isAuthenticated); handleClose(); }}>
                <Download size={16} style={{ marginRight: '8px' }} />
                Download TXT
              </MenuItem>
              <MenuItem onClick={() => { downloadPostPdf(postData, isAuthenticated); handleClose(); }}>
                <Download size={16} style={{ marginRight: '8px' }} />
                Download PDF
              </MenuItem>
              {user && !canEditOrDelete && (
                <MenuItem onClick={() => { handleReport(); handleClose(); }} disabled={reportMutation.isPending}>
                  <Flag size={16} style={{ marginRight: '8px' }} />
                  Report
                </MenuItem>
              )}
            </Menu>
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <h1 style={{
            fontSize: isMobile ? '1.875rem' : '2.5rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            margin: '0 0 8px 0',
            lineHeight: 1.2
          }}>
            {postData.title || 'Untitled Post'}
          </h1>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '8px' : '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to={`/dashboard/profile/${postData.user?.name || postAuthorName}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  {(postData.user?.name || postAuthorName).charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  component="span"
                  style={{ fontSize: '0.875rem' }}
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  By {postData.user?.name || postAuthorName}
                </Box>
              </Link>
              {user && user.id !== postData.user?.id && postData.user?.id && (
                <Button
                  onClick={() => setIsChatOpen(true)}
                  size="small"
                  variant="outlined"
                  sx={{
                    ml: 1,
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    padding: '2px 8px',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  }}
                  startIcon={<MessageCircle size={12} />}
                >
                  Chat with Author
                </Button>
              )}
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
                disabled={generatingAudio}
                style={{
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                {generatingAudio ? 'Generating...' : (isReading ? 'Stop' : 'Listen')}
              </Button>
              {isReading && (
                <Button
                  onClick={handlePauseResume}
                  startIcon={isPaused ? <Volume2 /> : <VolumeX />}
                  variant="outlined"
                  size="small"
                  style={{ marginLeft: 8, borderRadius: '6px', fontSize: '0.75rem' }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}

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
              {/* Voice tone selector */}
              <select
                value={voiceTone}
                onChange={(e) => setVoiceTone(e.target.value as 'clear' | 'power')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.75rem',
                  backgroundColor: theme.palette.background.paper,
                  marginLeft: 8
                }}
              >
                <option value="power">Power</option>
                <option value="clear">Clear</option>
              </select>




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

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Button
          onClick={toggleFullscreen}
          startIcon={isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          variant="outlined"
          size="small"
          style={{
            borderRadius: '20px',
            textTransform: 'none',
            color: theme.palette.text.secondary,
            borderColor: alpha(theme.palette.text.secondary, 0.5)
          }}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
        <Button
          onClick={() => {
            setIsBookMode(!isBookMode);
            setCurrentPage(0);
          }}
          startIcon={isBookMode ? <FileText size={18} /> : <BookOpen size={18} />}
          variant="outlined"
          size="small"
          style={{
            borderRadius: '20px',
            textTransform: 'none',
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main
          }}
        >
          {isBookMode ? 'Switch to Scroll View' : 'Book View'}
        </Button>
      </div>

      {/* Post Content */}
      <LIVBlogCard
        variant="default"
        padding={isMobile ? "small" : "medium"}
        style={{
          marginBottom: isMobile ? '8px' : '16px',
          backgroundColor: isHighlighted ? alpha(theme.palette.success.main, 0.15) : 'transparent',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          transition: 'background-color 1s ease',
          minHeight: isBookMode ? '400px' : 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Post Body */}
        <div style={{ marginBottom: '32px', flex: 1 }} onMouseUp={handleTextSelection}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: theme.palette.text.primary
          }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isBookMode ? `page-${currentPage}` : 'scroll'}
                  initial={{ opacity: 0, x: isBookMode ? 10 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isBookMode ? -10 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isBookMode ? renderContent(pages[currentPage]) : renderContent(safePostContent)}
                </motion.div>
              </AnimatePresence>
            </Box>

            {postHeadings.length > 0 && (
              <Box sx={{
                display: { xs: 'none', md: 'block' },
                width: '280px',
                flexShrink: 0
              }}>
                <Box sx={{
                  position: { md: 'sticky' },
                  top: { md: '24px' },
                  p: { xs: 2, md: 3 },
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  maxHeight: { md: 'calc(100vh - 100px)' },
                  overflowY: 'auto'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    <ListIcon size={20} /> Table of Contents
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {postHeadings.map((h, i) => (
                      <Box component="li" key={i} sx={{ ml: (h.level - 1) * 2, mb: 1 }}>
                        <a
                          href={`#${h.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const scrollToTarget = () => {
                              const el = document.getElementById(h.id);
                              if (el) {
                                el.style.scrollMarginTop = '100px';
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            };

                            if (isBookMode) {
                              const escapedText = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                              const regex = new RegExp(`^#{${h.level}}\\s+.*${escapedText}.*$`, 'm');
                              let pageIdx = pages.findIndex((page: string) => regex.test(page));

                              if (pageIdx === -1) {
                                pageIdx = pages.findIndex((page: string) => page.includes(h.text));
                              }

                              if (pageIdx !== -1) {
                                setCurrentPage(pageIdx);
                                setTimeout(scrollToTarget, 150);
                              } else {
                                setIsBookMode(false);
                                setTimeout(scrollToTarget, 150);
                              }
                            } else {
                              scrollToTarget();
                            }
                          }}
                          style={{
                            textDecoration: 'none',
                            color: theme.palette.text.secondary,
                            transition: 'color 0.2s',
                            display: 'inline-block',
                            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.9rem',
                            lineHeight: 1.4
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = theme.palette.primary.main}
                          onMouseOut={(e) => e.currentTarget.style.color = theme.palette.text.secondary}
                        >
                          {h.text}
                        </a>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </div>

        {isBookMode && pages.length > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '20px',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}>
            <Button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              startIcon={<ChevronLeft />}
              variant="text"
              style={{ textTransform: 'none' }}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage + 1} of {pages.length}
            </Typography>
            <Button
              disabled={currentPage === pages.length - 1}
              onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
              endIcon={<ChevronRight />}
              variant="text"
              style={{ textTransform: 'none' }}
            >
              Next
            </Button>
          </div>
        )}

        {/* Highlights Display */}
        {highlights.length > 0 && (
          <Box sx={{ mb: 4, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Highlighter size={16} /> Your Highlights & Notes
            </Typography>
            {highlights.map((highlight: any) => (
              <Box key={highlight.id} sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, borderLeft: `3px solid ${theme.palette.warning.main}` }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 0.5 }}>
                  "{highlight.selectedText}"
                </Typography>
                {highlight.note && (
                  <Typography variant="caption" color="text.secondary">
                    Note: {highlight.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Post Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            paddingTop: isMobile ? '12px' : '20px',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}
        >
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Engagement Pills */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: '24px',
              padding: '2px 6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <LikeButton
                postId={postId}
                likes={postData.likes || 0}
                isLiked={postData.isLiked || false}
              />
              <div style={{ width: '1px', height: '24px', backgroundColor: alpha(theme.palette.divider, 0.5), margin: '0 4px' }} />
              <Button
                onClick={() => setShowComments(!showComments)}
                startIcon={<MessageCircle size={18} />}
                variant="text"
                size="small"
                style={{
                  borderRadius: '20px',
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  padding: '4px 12px'
                }}
              >
                {postComments.length}
              </Button>
            </Box>

            <Tooltip title={postData.isSaved ? "Remove from LIVSave" : "Save to LIVSave"}>
              <IconButton
                onClick={() => livMarkMutation.mutate()}
                disabled={livMarkMutation.isPending}
                color={postData.isSaved ? "primary" : "default"}
                sx={{
                  backgroundColor: postData.isSaved ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${postData.isSaved ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: '50%',
                  padding: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <Bookmark size={18} fill={postData.isSaved ? "currentColor" : "none"} />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={handleShareClick}
              startIcon={<Share2 size={16} />}
              variant="contained"
              size="small"
              disableElevation
              style={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                padding: '6px 16px',
                fontSize: '0.8rem'
              }}
            >
              Share
            </Button>
            <Menu
              anchorEl={shareAnchorEl}
              open={openShare}
              onClose={handleShareClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              PaperProps={{ style: { borderRadius: '12px', minWidth: '180px', marginTop: '-8px' } }}
            >
              <Typography variant="caption" sx={{ px: 3, py: 1, color: 'text.secondary', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>SHARE VIA</Typography>
              <div style={{ height: '1px', backgroundColor: theme.palette.divider, margin: '4px 0' }} />
              {navigator.share && (
                <MenuItem onClick={() => handleShare('native')}>
                  <Smartphone size={16} style={{ marginRight: '12px', color: theme.palette.text.primary }} />
                  Native Share
                </MenuItem>
              )}
              <MenuItem onClick={() => handleShare('x')}>
                <Twitter size={16} style={{ marginRight: '12px', color: '#1DA1F2' }} />
                X (Twitter)
              </MenuItem>
              <MenuItem onClick={() => handleShare('whatsapp')}>
                <MessageCircle size={16} style={{ marginRight: '12px', color: '#25D366' }} />
                WhatsApp
              </MenuItem>
              <MenuItem onClick={() => handleShare('telegram')}>
                <Send size={16} style={{ marginRight: '12px', color: '#0088cc' }} />
                Telegram
              </MenuItem>
              <MenuItem onClick={() => handleShare('copy')}>
                <FileText size={16} style={{ marginRight: '12px', color: theme.palette.text.secondary }} />
                Copy Link
              </MenuItem>
            </Menu>
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
                        size={isMobile ? "small" : "medium"}
                        style={{
                          borderRadius: '10px',
                          padding: isMobile ? '8px 16px' : '10px 24px',
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
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
                size={isMobile ? "medium" : "large"}
                style={{
                  borderRadius: '10px',
                  padding: isMobile ? '10px 24px' : '12px 32px',
                  fontWeight: 600,
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                Login to Comment
              </Button>
            </div>
          )}

          {/* Comments List */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
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
              organizeComments(postComments).map((commentData: any, index: number) => (
                <CommentThread
                  key={commentData.id || index}
                  comment={commentData}
                  level={0}
                  theme={theme}
                  user={user}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handleReply={handleReply}
                  replyMutation={replyMutation}
                  onLike={handleLikeComment}
                  onDislike={handleDislikeComment}
                />
              ))
            )}
          </motion.div>
        </LIVBlogCard>
      )}

      {/* Chat Window */}
      {isChatOpen && postData.user?.id && (
        <ChatWindow
          recipientId={postData.user.id}
          recipientName={postData.user.name || postAuthorName}
          postId={postId}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </motion.div>
  );
};