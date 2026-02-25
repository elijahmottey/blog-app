import React from 'react';
import { IconButton, Typography, Box, Tooltip } from '@mui/material';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import BackendApi from '../../service/BackendApi';

interface CommentReactionButtonProps {
  commentId: number;
  likes?: number;
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  // Optional: which queries to invalidate after a reaction
  invalidateKeys?: { queryKey: any[] }[];
}

export const CommentReactionButton: React.FC<CommentReactionButtonProps> = ({
  commentId,
  likes = 0,
  dislikes = 0,
  isLiked = false,
  isDisliked = false,
  invalidateKeys = [
    { queryKey: ['comments'] },
  ],
}) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    invalidateKeys.forEach(k => queryClient.invalidateQueries(k));
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) return BackendApi.unlikeComment(commentId);
      // switching from dislike to like should first clear dislike implicitly by backend setReaction
      return BackendApi.likeComment(commentId);
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (error: any) => {
      toast.error(`Failed to ${isLiked ? 'unlike' : 'like'} comment: ${error.message}`);
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      if (isDisliked) return BackendApi.undislikeComment(commentId);
      return BackendApi.dislikeComment(commentId);
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (error: any) => {
      toast.error(`Failed to ${isDisliked ? 'remove dislike' : 'dislike'} comment: ${error.message}`);
    },
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
          <IconButton
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending || dislikeMutation.isPending}
            sx={{
              color: isLiked ? 'primary.main' : 'text.secondary',
              '&:hover': { color: 'primary.main', transform: 'scale(1.05)' },
              transition: 'all 0.15s ease',
            }}
          >
            <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 12, textAlign: 'center' }}>
          {likes}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={isDisliked ? 'Remove dislike' : 'Dislike'}>
          <IconButton
            onClick={() => dislikeMutation.mutate()}
            disabled={likeMutation.isPending || dislikeMutation.isPending}
            sx={{
              color: isDisliked ? 'error.main' : 'text.secondary',
              '&:hover': { color: 'error.main', transform: 'scale(1.05)' },
              transition: 'all 0.15s ease',
            }}
          >
            <ThumbsDown size={18} fill={isDisliked ? 'currentColor' : 'none'} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 12, textAlign: 'center' }}>
          {dislikes}
        </Typography>
      </Box>
    </Box>
  );
};

export default CommentReactionButton;
