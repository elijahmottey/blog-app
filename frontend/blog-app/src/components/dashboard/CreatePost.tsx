import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
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
          return `<h1 class="text-2xl font-bold mb-4 mt-6">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mb-3 mt-5">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-medium mb-2 mt-4">${line.substring(4)}</h3>`;
        }

        // Handle bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Handle italic text
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Handle empty lines
        if (line.trim() === '') {
          return '<br>';
        }

        // Regular paragraphs
        return `<p class="mb-2">${line}</p>`;
      })
      .join('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600">Share your thoughts with the world</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Post Title
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            placeholder="Enter an engaging title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Content Input/Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="text-xs text-gray-500">
              Use **bold** and *italic* formatting
            </div>
          </div>

          {isPreview ? (
            <div className="min-h-96 p-6 border border-gray-300 rounded-lg bg-gray-50">
              <div className="prose prose-lg max-w-none">
                {watchedTitle && (
                  <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">
                    {watchedTitle}
                  </h1>
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }}
                  className="text-gray-800 leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <textarea
              {...register('content')}
              id="content"
              rows={20}
              placeholder="Write your post content here...

Use markdown-style formatting:
# Heading 1
## Heading 2
**bold text**
*italic text*

Separate paragraphs with empty lines."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          )}

          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Character Count */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {watchedContent.length} characters
            {watchedContent.length < 10 && (
              <span className="text-red-500 ml-1">(minimum 10 required)</span>
            )}
          </span>
          <span>
            {watchedContent.split('\n').filter(line => line.trim()).length} paragraphs
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createPostMutation.isPending}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createPostMutation.isPending ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Creating Post...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publish Post
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Writing Tips</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Start with a compelling title that captures attention
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Use headings (# ## ###) to organize your content
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            **Bold** important points and *emphasize* key ideas
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Keep paragraphs short and focused
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Preview your post before publishing to see the final result
          </li>
        </ul>
      </div>
    </div>
  );
};