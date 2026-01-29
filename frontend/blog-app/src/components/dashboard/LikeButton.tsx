import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import BackendApi from '../../service/BackendApi';

interface LikeButtonProps {
  postId: number;
  likes: number;
  isLiked: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ postId, likes, isLiked }) => {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => isLiked ? BackendApi.unlikePost(postId) : BackendApi.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to ${isLiked ? 'unlike' : 'like'} post: ${error.message}`);
    },
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={() => likeMutation.mutate()}
        disabled={likeMutation.isPending}
        sx={{
          color: isLiked ? 'error.main' : 'text.secondary',
          '&:hover': {
            color: 'error.main',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <Heart 
          size={20} 
          fill={isLiked ? 'currentColor' : 'none'}
        />
      </IconButton>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {likes}
      </Typography>
    </Box>
  );
};