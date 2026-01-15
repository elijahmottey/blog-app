import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
import { Button, IconButton, Typography, Box, Paper, TextField } from '@mui/material';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
});

type PostFormData = {
  title: string;
  content: string;
};

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPreview, setIsPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: yupResolver(schema),
  });

  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) => BackendApi.createPost({ title: data.title, content: data.content }),
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      navigate('/dashboard/posts');
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast.error('Failed to create post. Please try again.');
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const watchedContent = watch('content', '');
  const watchedTitle = watch('title', '');

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return `<h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; margin-top: 1.5rem; color: #1a1a1a;">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.25rem; color: #1a1a1a;">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 style="font-size: 1.125rem; font-weight: 500; margin-bottom: 0.5rem; margin-top: 1rem; color: #1a1a1a;">${line.substring(4)}</h3>`;
        }

        // Handle bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1a1a1a;">$1</strong>');

        // Handle italic text
        line = line.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #666666;">$1</em>');

        // Handle empty lines
        if (line.trim() === '') {
          return '<br>';
        }

        // Regular paragraphs
        return `<p style="margin-bottom: 0.5rem; color: #1a1a1a; line-height: 1.6;">${line}</p>`;
      })
      .join('');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ArrowLeft />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Create New Post
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Share your thoughts with the world
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={isPreview ? <EyeOff /> : <Eye />}
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Title Input */}
        <TextField
          {...register('title')}
          label="Post Title"
          placeholder="Enter an engaging title..."
          variant="outlined"
          fullWidth
          error={!!errors.title}
          helperText={errors.title?.message}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '1.125rem',
              fontWeight: 500,
            }
          }}
        />

        {/* Content Input/Preview */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Content
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Use **bold** and *italic* formatting
            </Typography>
          </Box>

          {isPreview ? (
            <Paper sx={{ minHeight: 400, p: 3, bgcolor: 'grey.50' }}>
              <Box sx={{ '& h1': { typography: 'h3', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' } }}>
                {watchedTitle && (
                  <Typography variant="h3" sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider', fontWeight: 'bold' }}>
                    {watchedTitle}
                  </Typography>
                )}
                <Box
                  dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }}
                  sx={{ color: 'text.primary', lineHeight: 1.6 }}
                />
              </Box>
            </Paper>
          ) : (
            <TextField
              {...register('content')}
              multiline
              rows={20}
              placeholder={`Write your post content here...

Use markdown-style formatting:
# Heading 1
## Heading 2
**bold text**
*italic text*

Separate paragraphs with empty lines.`}
              variant="outlined"
              fullWidth
              error={!!errors.content}
              helperText={errors.content?.message}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }
              }}
            />
          )}
        </Box>

        {/* Character Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', typography: 'body2', color: 'text.secondary' }}>
          <Box>
            {watchedContent.length} characters
            {watchedContent.length < 10 && (
              <Box component="span" sx={{ color: 'error.main', ml: 1 }}>
                (minimum 10 required)
              </Box>
            )}
          </Box>
          <Box>
            {watchedContent.split('\n').filter(line => line.trim()).length} paragraphs
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || createPostMutation.isPending}
            startIcon={createPostMutation.isPending ? <Loader /> : <Save />}
          >
            {createPostMutation.isPending ? 'Creating Post...' : 'Publish Post'}
          </Button>
        </Box>
      </Box>

      {/* Tips Section */}
      <Paper sx={{ p: 3, bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'info.dark', fontWeight: 'bold' }}>
          Writing Tips
        </Typography>
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', '& li': { mb: 1, display: 'flex', alignItems: 'flex-start' } }}>
          <Box component="li" sx={{ color: 'info.dark' }}>
            <Box component="span" sx={{ color: 'info.main', mr: 1 }}>•</Box>
            Start with a compelling title that captures attention
          </Box>
          <Box component="li" sx={{ color: 'info.dark' }}>
            <Box component="span" sx={{ color: 'info.main', mr: 1 }}>•</Box>
            Use headings (# ## ###) to organize your content
          </Box>
          <Box component="li" sx={{ color: 'info.dark' }}>
            <Box component="span" sx={{ color: 'info.main', mr: 1 }}>•</Box>
            **Bold** important points and *emphasize* key ideas
          </Box>
          <Box component="li" sx={{ color: 'info.dark' }}>
            <Box component="span" sx={{ color: 'info.main', mr: 1 }}>•</Box>
            Keep paragraphs short and focused
          </Box>
          <Box component="li" sx={{ color: 'info.dark' }}>
            <Box component="span" sx={{ color: 'info.main', mr: 1 }}>•</Box>
            Preview your post before publishing to see the final result
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};