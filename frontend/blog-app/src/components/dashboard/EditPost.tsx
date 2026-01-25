import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Loader, Calendar, User, FileText } from 'lucide-react';
import BackendApi, { type PostDto } from '../../service/BackendApi';
import { toast } from 'sonner';

// Material UI Components
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const EditorContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const EditorCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
  border: `1px solid ${theme.palette.divider}`,
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const EditorBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  overflow: 'auto',
  '& h1': {
    fontSize: '2rem',
    fontWeight: 700,
    margin: `${theme.spacing(2)} 0 ${theme.spacing(1)}`,
  },
  '& h2': {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: `${theme.spacing(2)} 0 ${theme.spacing(1)}`,
  },
  '& h3': {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: `${theme.spacing(1.5)} 0 ${theme.spacing(1)}`,
  },
  '& p': {
    marginBottom: theme.spacing(2),
    lineHeight: 1.6,
  },
  '& strong': {
    fontWeight: 600,
  },
  '& em': {
    fontStyle: 'italic',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledTextArea = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    fontFamily: '"Roboto Mono", "Courier New", monospace',
    fontSize: '0.875rem',
    '& textarea': {
      lineHeight: 1.6,
    },
  },
}));

// Types
interface PostFormData {
  title: string;
  content: string;
}

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
});

export const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const postId = parseInt(id || '0');

  // Fetch post data
  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => BackendApi.getPostById(postId),
    enabled: !!postId,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: yupResolver(schema),
  });

  // Set form values when post data loads
  useEffect(() => {
    if (postData?.data) {
      setValue('title', postData.data.title);
      setValue('content', postData.data.content);
    }
  }, [postData, setValue]);

  const updatePostMutation = useMutation({
    mutationFn: (data: PostFormData) => BackendApi.updatePost({
      ...postData?.data,
      title: data.title,
      content: data.content,
      updatedAt: new Date().toISOString(),
    } as PostDto, postId),
    onSuccess: () => {
      toast.success('Post updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      navigate(`/dashboard/posts/${postId}`);
    },
    onError: () => {
      toast.error('Failed to update post. Please try again.');
    },
  });

  const onSubmit = (data: PostFormData) => {
    updatePostMutation.mutate(data);
  };

  const formatContent = (content: string) => {
    return content
        .split('\n')
        .map((line) => {
          // Handle headers
          if (line.startsWith('# ')) {
            return `<h1>${line.substring(2)}</h1>`;
          }
          if (line.startsWith('## ')) {
            return `<h2>${line.substring(3)}</h2>`;
          }
          if (line.startsWith('### ')) {
            return `<h3>${line.substring(4)}</h3>`;
          }

          // Handle bold text
          line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

          // Handle italic text
          line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

          // Handle links
          line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

          // Handle empty lines as paragraphs
          if (line.trim() === '') {
            return '<br>';
          }

          return `<p>${line}</p>`;
        })
        .join('');
  };

  const watchedContent = watch('content') || '';
  watch('title') || '';
// Loading state
  if (postLoading) {
    return (
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 'calc(100vh - 200px)',
            }}
        >
          <CircularProgress size={60} />
        </Box>
    );
  }

  // Error state - post not found
  if (!postData?.data) {
    return (
        <EditorContainer>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Post not found
            </Alert>
            <Button
                variant="contained"
                onClick={() => navigate('/dashboard/posts')}
                startIcon={<ArrowLeft />}
            >
              Back to Posts
            </Button>
          </Box>
        </EditorContainer>
    );
  }

  return (
      <EditorContainer maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink
              component="button"
              onClick={() => navigate('/dashboard')}
              color="inherit"
              sx={{ cursor: 'pointer' }}
          >
            Dashboard
          </MuiLink>
          <MuiLink
              component="button"
              onClick={() => navigate('/dashboard/posts')}
              color="inherit"
              sx={{ cursor: 'pointer' }}
          >
            Posts
          </MuiLink>
          <Typography color="text.primary">Edit Post</Typography>
        </Breadcrumbs>

        <EditorCard>
          <EditorHeader>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Edit Post
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Update your blog post content and title
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={previewMode ? "Switch to edit mode" : "Preview your post"}>
                  <Button
                      variant="outlined"
                      onClick={() => setPreviewMode(!previewMode)}
                      startIcon={previewMode ? <EyeOff size={20} /> : <Eye size={20} />}
                      size={isMobile ? "small" : "medium"}
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </Tooltip>

                <Button
                    variant="outlined"
                    onClick={() => navigate(`/dashboard/posts/${postId}`)}
                    startIcon={<ArrowLeft size={20} />}
                    size={isMobile ? "small" : "medium"}
                >
                  Back
                </Button>
              </Box>
            </Box>

            {/* Post Metadata - Replaced Grid with div */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '8px',
              width: '100%'
            }}>
              <div style={{
                flex: '1 1 calc(25% - 16px)',
                minWidth: isMobile ? '100%' : '200px'
              }}>
                <Chip
                    icon={<User size={16} />}
                    label="Author"
                    variant="outlined"
                    size="small"
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                />
              </div>
              <div style={{
                flex: '1 1 calc(25% - 16px)',
                minWidth: isMobile ? '100%' : '200px'
              }}>
                <Chip
                    icon={<Calendar size={16} />}
                    label={new Date(postData.data.createdAt || new Date()).toLocaleDateString()}
                    variant="outlined"
                    size="small"
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                />
              </div>
              <div style={{
                flex: '1 1 calc(25% - 16px)',
                minWidth: isMobile ? '100%' : '200px'
              }}>
                <Chip
                    icon={<FileText size={16} />}
                    label={`${watchedContent.length} chars`}
                    variant="outlined"
                    size="small"
                    color={watchedContent.length < 10 ? 'error' : 'default'}
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                />
              </div>
              <div style={{
                flex: '1 1 calc(25% - 16px)',
                minWidth: isMobile ? '100%' : '200px'
              }}>
                <Chip
                    label={previewMode ? "Preview Mode" : "Edit Mode"}
                    variant="filled"
                    size="small"
                    color={previewMode ? "info" : "primary"}
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                />
              </div>
            </div>
          </EditorHeader>

          <EditorBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                {/* Title Section */}
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="medium">
                    Post Title
                  </Typography>
                  <StyledTextField
                      {...register('title')}
                      fullWidth
                      placeholder="Enter a compelling title for your post..."
                      variant="outlined"
                      disabled={previewMode}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      InputProps={{
                        sx: { fontSize: '1.125rem', fontWeight: 500 },
                      }}
                  />
                </Box>

                <Divider />

                {/* Content Section */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="medium">
                      Content
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {previewMode ? 'Preview' : 'Markdown supported'}
                    </Typography>
                  </Box>

                  {previewMode ? (
                      <PreviewContainer>
                        {watchedContent ? (
                            <div dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }} />
                        ) : (
                            <Typography color="text.secondary" fontStyle="italic">
                              No content to preview. Start typing in edit mode.
                            </Typography>
                        )}
                      </PreviewContainer>
                  ) : (
                      <>
                        <StyledTextArea
                            {...register('content')}
                            fullWidth
                            multiline
                            rows={isMobile ? 12 : 18}
                            placeholder={`Write your post content here...

# Markdown Tips:
## Use headers
**Bold text**
*Italic text*
[Links](https://example.com)

Your content will be beautifully formatted!`}
                            variant="outlined"
                            error={!!errors.content}
                            helperText={errors.content?.message}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color={errors.content ? 'error' : 'text.secondary'}>
                            Minimum 10 characters required
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {watchedContent.length} characters
                          </Typography>
                        </Box>
                      </>
                  )}
                </Box>

                <Divider />

                {/* Action Buttons */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard/posts')}
                      size="large"
                      sx={{ minWidth: isMobile ? '100%' : 150 }}
                  >
                    Cancel
                  </Button>

                  <Box sx={{
                    display: 'flex',
                    gap: 2,
                    width: isMobile ? '100%' : 'auto'
                  }}>
                    <Button
                        variant="outlined"
                        onClick={() => setPreviewMode(!previewMode)}
                        startIcon={previewMode ? <EyeOff /> : <Eye />}
                        size="large"
                        sx={{ flex: isMobile ? 1 : 'none' }}
                    >
                      {previewMode ? 'Edit' : 'Preview'}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={updatePostMutation.isPending || isSubmitting}
                        startIcon={updatePostMutation.isPending ? <Loader className="animate-spin" /> : <Save />}
                        size="large"
                        sx={{
                          flex: isMobile ? 1 : 'none',
                          minWidth: 150
                        }}
                    >
                      {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </form>
          </EditorBody>
        </EditorCard>

        {/* Stats Footer */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary" align="center">
            Last updated: {new Date(postData.data.updatedAt || new Date()).toLocaleString()}
          </Typography>
        </Box>
      </EditorContainer>
  );
};