import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
import BackendApi, { type PostDto } from '../../service/BackendApi';
import { toast } from 'sonner';

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
          return `<h1 class="text-2xl font-bold mb-4 mt-6">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mb-3 mt-5">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-medium mb-2 mt-4">${line.substring(4)}</h3>`;
        }

        // Handle bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

        // Handle italic text
        line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Handle links
        line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

        // Handle empty lines as paragraphs
        if (line.trim() === '') {
          return '<br>';
        }

        return `<p class="mb-3 leading-relaxed">${line}</p>`;
      })
      .join('');
  };

  const watchedContent = watch('content') || '';

  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!postData?.data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Post not found</div>
        <button
          onClick={() => navigate('/dashboard/posts')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/dashboard/posts/${postId}`)}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Post
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your post title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>

              {previewMode ? (
                <div className="min-h-96 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }}
                  />
                </div>
              ) : (
                <textarea
                  {...register('content')}
                  id="content"
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Write your post content here...&#10;&#10;You can use Markdown:&#10;# Header&#10;## Subheader&#10;**bold text**&#10;*italic text*&#10;[link](url)"
                />
              )}

              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* Character count */}
            <div className="text-sm text-gray-500">
              {watchedContent.length} characters
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || updatePostMutation.isPending}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updatePostMutation.isPending ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updatePostMutation.isPending ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};