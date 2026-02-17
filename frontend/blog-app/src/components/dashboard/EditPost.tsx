import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Loader, Calendar, User, FileText } from 'lucide-react';
import BackendApi, { type PostDto } from '../../service/BackendApi';
import { toast } from 'sonner';
import { LIVBlogCard, LIVBlogHeader, LIVBlogLayout } from '../ui';
import { Button, TextField, Chip, useTheme } from '@mui/material';

interface PostFormData {
  title: string;
  content: string;
  category: string;
}

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
  category: yup.string().required('Category is required'),
});

export const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);
  const theme = useTheme();
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
    resolver: yupResolver(schema) as any,
  });

  // Set form values when post data loads
  useEffect(() => {
    if (postData?.data) {
      setValue('title', postData.data.title);
      setValue('content', postData.data.content);
      setValue('category', postData.data.category || '');
    }
  }, [postData, setValue]);

  const updatePostMutation = useMutation({
    mutationFn: (data: PostFormData) => BackendApi.updatePost({
      ...postData?.data,
      title: data.title,
      content: data.content,
      category: data.category,
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
  const watchedTitle = watch('title') || '';

  // Loading state
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

  // Error state - post not found
  if (!postData?.data) {
    return (
      <LIVBlogLayout.Container>
        <LIVBlogCard
          title="Post Not Found"
          variant="default"
          padding="large"
        >
          <div className="aws-text-center aws-py-8">
            <div 
              className="aws-text-red-600 aws-mb-3"
              style={{ 
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Post not found
            </div>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard/posts')}
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

  return (
    <LIVBlogLayout.Container>
      {/* Header */}
      <LIVBlogHeader
        title="Edit Post"
        subtitle="Update your blog post content and title"
        size="large"
        actions={
          <div className="aws-flex aws-gap-2">
            <Button
              variant="outlined"
              onClick={() => setPreviewMode(!previewMode)}
              startIcon={previewMode ? <EyeOff size={20} /> : <Eye size={20} />}
              className="aws-button aws-button-secondary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/dashboard/posts/${postId}`)}
              startIcon={<ArrowLeft size={20} />}
              className="aws-button aws-button-secondary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Back
            </Button>
          </div>
        }
      />

      {/* Post Metadata */}
      <LIVBlogLayout.Grid cols={4} gap="sm">
        <Chip
          icon={<User size={16} />}
          label="Author"
          variant="outlined"
          size="small"
          className="aws-chip"
          style={{
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
        <Chip
          icon={<Calendar size={16} />}
          label={new Date(postData.data.createdAt || new Date()).toLocaleDateString()}
          variant="outlined"
          size="small"
          className="aws-chip"
          style={{
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
        <Chip
          icon={<FileText size={16} />}
          label={`${watchedContent.length} chars`}
          variant="outlined"
          size="small"
          color={watchedContent.length < 10 ? 'error' : 'default'}
          className="aws-chip"
          style={{
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
        <Chip
          label={previewMode ? "Preview Mode" : "Edit Mode"}
          variant="filled"
          size="small"
          color={previewMode ? "info" : "primary"}
          className="aws-chip"
          style={{
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
      </LIVBlogLayout.Grid>

      {/* Editor Card */}
      <LIVBlogCard
        variant="default"
        padding="large"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="aws-flex aws-flex-col aws-gap-6">
            {/* Title Section */}
            <div>
              <h3 
                className="aws-text-lg aws-font-medium aws-mb-2"
                style={{ 
                  color: theme.palette.text.primary,
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Post Title
              </h3>
              <TextField
                {...register('title')}
                fullWidth
                placeholder="Enter a compelling title for your post..."
                variant="outlined"
                disabled={previewMode}
                error={!!errors.title}
                helperText={errors.title?.message}
                InputProps={{
                  style: { 
                    fontSize: '1.125rem', 
                    fontWeight: 500,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                }}
              />
            </div>

            {/* Category Section */}
            <div>
              <h3 
                className="aws-text-lg aws-font-medium aws-mb-2"
                style={{ 
                  color: theme.palette.text.primary,
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Category
              </h3>
              <TextField
                {...register('category')}
                select
                fullWidth
                disabled={previewMode}
                error={!!errors.category}
                helperText={errors.category?.message}
                SelectProps={{ native: true }}
                InputProps={{
                  style: { 
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                }}
              >
                <option value="">Select a category</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="SPIRITUAL">Spiritual</option>
                <option value="POLITICS">Politics</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="CULTURE">Culture</option>
                <option value="HEALTH">Health</option>
                <option value="BUSINESS">Business</option>
                <option value="EDUCATION">Education</option>
                <option value="SPORTS">Sports</option>
              </TextField>
            </div>

            {/* Content Section */}
            <div>
              <div className="aws-flex aws-justify-between aws-items-center aws-mb-2">
                <h3 
                  className="aws-text-lg aws-font-medium"
                  style={{ 
                    color: theme.palette.text.primary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Content
                </h3>
                <span 
                  className="aws-text-sm"
                  style={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {previewMode ? 'Preview' : 'Markdown supported'}
                </span>
              </div>

              {previewMode ? (
                <div 
                  className="aws-min-h-96 aws-p-6 aws-border aws-rounded-lg aws-overflow-auto"
                  style={{
                    backgroundColor: theme.palette.grey[50],
                    borderColor: theme.palette.divider,
                  }}
                >
                  {watchedContent ? (
                    <div dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }} />
                  ) : (
                    <div 
                      className="aws-text-gray-500 aws-italic"
                      style={{ 
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      No content to preview. Start typing in edit mode.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <TextField
                    {...register('content')}
                    fullWidth
                    multiline
                    rows={18}
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
                    InputProps={{
                      style: { 
                        fontFamily: '"Roboto Mono", "Courier New", monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.6
                      },
                    }}
                  />
                  <div className="aws-flex aws-justify-between aws-items-center aws-mt-1">
                    <span 
                      className="aws-text-sm"
                      style={{ 
                        color: errors.content ? theme.palette.error.main : theme.palette.text.secondary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      Minimum 10 characters required
                    </span>
                    <span 
                      className="aws-text-sm"
                      style={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      {watchedContent.length} characters
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="aws-flex aws-justify-between aws-items-center aws-pt-4 aws-border-t" style={{ borderColor: theme.palette.divider }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/posts')}
                size="large"
                className="aws-button aws-button-secondary"
                style={{
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Cancel
              </Button>

              <div className="aws-flex aws-gap-2">
                <Button
                  variant="outlined"
                  onClick={() => setPreviewMode(!previewMode)}
                  startIcon={previewMode ? <EyeOff /> : <Eye />}
                  size="large"
                  className="aws-button aws-button-secondary"
                  style={{
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={updatePostMutation.isPending || isSubmitting}
                  startIcon={updatePostMutation.isPending ? <Loader className="animate-spin" /> : <Save />}
                  size="large"
                  className="aws-button aws-button-primary"
                  style={{
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </LIVBlogCard>

      {/* Stats Footer */}
      <div className="aws-text-center">
        <span 
          className="aws-text-sm"
          style={{ 
            color: theme.palette.text.secondary,
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Last updated: {new Date(postData.data.updatedAt || new Date()).toLocaleString()}
        </span>
      </div>
    </LIVBlogLayout.Container>
  );
};