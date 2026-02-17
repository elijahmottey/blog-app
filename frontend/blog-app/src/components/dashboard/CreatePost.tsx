import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
  FileText
} from 'lucide-react';
import {
  Button,
  IconButton,
  Typography,
  TextField,
  Tooltip,
  Chip,
  Alert,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { AIChat } from './AIChat';
import { LIVBlogHeader, LIVBlogCard, LIVBlogLayout } from '../ui';
import { useTheme } from '@mui/material/styles';

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
});

type PostFormData = {
  title: string;
  content: string;
  category: string;
};

interface DraftPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const theme = useTheme();
  const [isPreview, setIsPreview] = useState(false);
  const [formattingHistory, setFormattingHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('TECHNOLOGY');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => BackendApi.getCategories(),
  });

  const categories = categoriesResponse?.data || ['General','Spiritual Life', 'Technology', 'Lifestyle', 'Business', 'Health', 'Education'];

  // Ensure selectedCategory defaults to the first available category when categories load
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (!selectedCategory || !categories.includes(selectedCategory)) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [categories]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: yupResolver(schema) as any,
  });

  // Load draft if passed via navigation state
  useEffect(() => {
    const draft = location.state?.draft as DraftPost;
    if (draft) {
      setValue('title', draft.title);
      setValue('content', draft.content);
      setCurrentDraftId(draft.id);
    }
  }, [location.state, setValue]);

  // Draft management functions
  const saveDraft = () => {
    const formData = getValues();
    if (!formData.title && !formData.content) return;

    const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
    const draftId = currentDraftId || Date.now().toString();
    const now = new Date().toISOString();
    
    const draft: DraftPost = {
      id: draftId,
      title: formData.title || 'Untitled Draft',
      content: formData.content || '',
      createdAt: currentDraftId ? drafts.find((d: DraftPost) => d.id === draftId)?.createdAt || now : now,
      updatedAt: now
    };

    const updatedDrafts = drafts.filter((d: DraftPost) => d.id !== draftId);
    updatedDrafts.unshift(draft);
    
    localStorage.setItem('blog_drafts', JSON.stringify(updatedDrafts));
    setCurrentDraftId(draftId);
    toast.success('Draft saved successfully!');
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = getValues();
      if (formData.title || formData.content) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentDraftId]);

  const deleteDraft = (draftId: string) => {
    const drafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
    const updatedDrafts = drafts.filter((d: DraftPost) => d.id !== draftId);
    localStorage.setItem('blog_drafts', JSON.stringify(updatedDrafts));
    
    if (currentDraftId === draftId) {
      setCurrentDraftId(null);
      setValue('title', '');
      setValue('content', '');
    }
  };

  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) => {
      return BackendApi.createPost({ 
        title: data.title, 
        content: data.content,
        category: data.category,
        users: user?.name || 'Anonymous'
      });
    },
    onSuccess: () => {
      toast.success('Post published successfully!');
      // Delete draft after successful publish
      if (currentDraftId) {
        deleteDraft(currentDraftId);
      }
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts-management'] });
      navigate('/dashboard/posts');
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast.error('Failed to publish post. Please try again.');
    },
  });

  const onSubmit = (data: PostFormData) => {
    const postData = { ...data, category: selectedCategory };
    createPostMutation.mutate(postData);
  };

  const watchedContent = watch('content', '');
  const watchedTitle = watch('title', '');

  // Function to get selected text from textarea
  const getSelectedText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { text: '', start: 0, end: 0 };

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end);

    return { text, start, end };
  };

  // Function to replace selected text
  const replaceSelectedText = (replacement: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getSelectedText();
    const currentContent = getValues('content');

    // Save to history before making changes
    const newHistory = [...formattingHistory.slice(0, historyIndex + 1), currentContent];
    setFormattingHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    const newContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);
    setValue('content', newContent, { shouldValidate: true });

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // Formatting functions
  const applyBold = () => {
    const { text } = getSelectedText();
    if (text) {
      replaceSelectedText(`**${text}**`);
    } else {
      insertAtCursor('**bold text**');
    }
  };

  const applyItalic = () => {
    const { text } = getSelectedText();
    if (text) {
      replaceSelectedText(`*${text}*`);
    } else {
      insertAtCursor('*italic text*');
    }
  };

  const applyHeading = (level: number) => {
    const { text } = getSelectedText();
    const headingPrefix = '#'.repeat(level) + ' ';
    if (text) {
      replaceSelectedText(`${headingPrefix}${text}`);
    } else {
      insertAtCursor(`${headingPrefix}Heading`);
    }
  };

  const applyList = (ordered: boolean) => {
    const { text } = getSelectedText();
    if (text) {
      const lines = text.split('\n');
      const formattedLines = lines.map((line, index) => {
        if (ordered) {
          return `${index + 1}. ${line}`;
        }
        return `- ${line}`;
      });
      replaceSelectedText(formattedLines.join('\n'));
    } else {
      insertAtCursor(ordered ? '1. List item\n2. List item\n3. List item' : '- List item\n- List item\n- List item');
    }
  };

  const insertLink = () => {
    const { text } = getSelectedText();
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      const linkText = text || 'link text';
      replaceSelectedText(`[${linkText}](${url})`);
    }
  };

  const applyBlockquote = () => {
    const { text } = getSelectedText();
    if (text) {
      const lines = text.split('\n');
      const formattedLines = lines.map(line => `> ${line}`);
      replaceSelectedText(formattedLines.join('\n'));
    } else {
      insertAtCursor('> Blockquote text');
    }
  };

  const applyCode = () => {
    const { text } = getSelectedText();
    if (text) {
      replaceSelectedText(`\`\`\`\n${text}\n\`\`\``);
    } else {
      insertAtCursor('```\ncode here\n```');
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = getValues('content');

    // Save to history
    const newHistory = [...formattingHistory.slice(0, historyIndex + 1), currentContent];
    setFormattingHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
    setValue('content', newContent, { shouldValidate: true });

    // Position cursor in the middle of inserted text for easy editing
    const cursorPos = start + text.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const previousContent = formattingHistory[historyIndex - 1];
      setValue('content', previousContent, { shouldValidate: true });
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < formattingHistory.length - 1) {
      const nextContent = formattingHistory[historyIndex + 1];
      setValue('content', nextContent, { shouldValidate: true });
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Initialize history
  useEffect(() => {
    if (watchedContent && formattingHistory.length === 0) {
      setFormattingHistory([watchedContent]);
      setHistoryIndex(0);
    }
  }, [watchedContent]);

  const formatContent = (content: string) => {
    return content
        .split('\n')
        .map((line, index) => {
          // Handle blockquotes
          if (line.trim().startsWith('>')) {
            return `<blockquote>${line.substring(1).trim()}</blockquote>`;
          }

          // Handle code blocks
          if (line.trim().startsWith('```')) {
            return '<pre><code>';
          }
          if (line.trim() === '```') {
            return '</code></pre>';
          }

          // Handle headers
          if (line.startsWith('# ')) {
            return `<h1 style="font-size: 1.875rem; font-weight: 800; margin-bottom: 1.5rem; margin-top: 2rem; padding-bottom: 0.5rem;">${line.substring(2)}</h1>`;
          }
          if (line.startsWith('## ')) {
            return `<h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; margin-top: 1.5rem;">${line.substring(3)}</h2>`;
          }
          if (line.startsWith('### ')) {
            return `<h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.25rem;">${line.substring(4)}</h3>`;
          }

          // Handle bold text
          line = line.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');

          // Handle italic text
          line = line.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');

          // Handle inline code
          line = line.replace(/`([^`]+)`/g, '<code>$1</code>');

          // Handle links
          line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

          // Handle ordered lists
          if (/^\d+\.\s/.test(line)) {
            return `<li style="margin-left: 1.5rem; margin-bottom: 0.25rem; list-style-type: decimal;">${line.substring(line.indexOf('.') + 2)}</li>`;
          }

          // Handle unordered lists
          if (/^-\s/.test(line) || /^\*\s/.test(line)) {
            return `<li style="margin-left: 1.5rem; margin-bottom: 0.25rem; list-style-type: disc;">${line.substring(2)}</li>`;
          }

          // Handle empty lines
          if (line.trim() === '') {
            return '<br>';
          }

          // Check if previous line was a list item
          const prevLine = content.split('\n')[index - 1];
          const isInList = prevLine && (/^\d+\.\s/.test(prevLine) || /^-\s/.test(prevLine) || /^\*\s/.test(prevLine));

          if (isInList) {
            return `<li style="margin-left: 1.5rem; margin-bottom: 0.25rem; list-style-type: disc;">${line}</li>`;
          }

          // Regular paragraphs
          return `<p style="margin-bottom: 1rem; line-height: 1.8; font-size: 1.125rem;">${line}</p>`;
        })
        .join('');
  };

  // Calculate statistics
  const wordCount = watchedContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const paragraphCount = watchedContent.split('\n').filter(line => line.trim().length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="aws-spacing-y-lg">
      <LIVBlogHeader
        title="Create New Post"
        subtitle="Craft your story with our enhanced editor"
        size="large"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/dashboard')} variant="outlined" className="aws-button aws-button-secondary">
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Back
            </Button>
            <Button
              onClick={() => setIsPreview(!isPreview)}
              variant="outlined"
              className="aws-button aws-button-secondary"
            >
              {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span style={{ marginLeft: '8px' }}>{isPreview ? 'Editor' : 'Preview'}</span>
            </Button>
          </div>
        }
      />

      <LIVBlogLayout.Grid cols={4} gap="md" className="aws-margin-b-lg">
        <LIVBlogCard title="Words" padding="small" className="text-center">
          <div className="aws-header-md" style={{ color: theme.palette.primary.main, margin: 0 }}>
            {wordCount}
          </div>
        </LIVBlogCard>
        <LIVBlogCard title="Characters" padding="small" className="text-center">
          <div className="aws-header-md" style={{ color: theme.palette.secondary.main, margin: 0 }}>
            {watchedContent.length}
          </div>
        </LIVBlogCard>
        <LIVBlogCard title="Paragraphs" padding="small" className="text-center">
          <div className="aws-header-md" style={{ color: theme.palette.success.main, margin: 0 }}>
            {paragraphCount}
          </div>
        </LIVBlogCard>
        <LIVBlogCard title="Reading Time" padding="small" className="text-center">
          <div className="aws-header-md" style={{ color: theme.palette.warning.main, margin: 0 }}>
            {readingTime} min
          </div>
        </LIVBlogCard>
      </LIVBlogLayout.Grid>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <LIVBlogCard title="Post Title" padding="medium">
          <TextField
            {...register('title')}
            placeholder="Catchy title that grabs attention..."
            variant="outlined"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
            className="aws-font"
            InputProps={{
              style: {
                fontSize: '1.25rem',
                fontWeight: 600,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }
            }}
          />
          <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0', fontSize: '0.75rem' }}>
            Keep it concise and engaging (3-10 words)
          </p>
        </LIVBlogCard>

        <LIVBlogCard title="Category" padding="medium">
          <FormControl fullWidth>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as string)}
              className="aws-font"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: '8px 0 0 0', fontSize: '0.75rem' }}>
            Choose the most relevant category for your post
          </p>
        </LIVBlogCard>

        <LIVBlogCard padding="none">
          <div className="aws-spacing-md" style={{ backgroundColor: theme.palette.action.hover, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.secondary, marginRight: '16px', fontSize: '0.75rem' }}>
                Formatting:
              </span>
              <Tooltip title="Bold">
                <IconButton onClick={applyBold} size="small" className="aws-button">
                  <Bold size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic">
                <IconButton onClick={applyItalic} size="small" className="aws-button">
                  <Italic size={16} />
                </IconButton>
              </Tooltip>
              <div style={{ width: '1px', height: '20px', backgroundColor: theme.palette.divider, margin: '0 8px' }} />
              <Tooltip title="Heading 1">
                <IconButton onClick={() => applyHeading(1)} size="small" className="aws-button">
                  <Heading1 size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Heading 2">
                <IconButton onClick={() => applyHeading(2)} size="small" className="aws-button">
                  <Heading2 size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Heading 3">
                <IconButton onClick={() => applyHeading(3)} size="small" className="aws-button">
                  <Heading3 size={16} />
                </IconButton>
              </Tooltip>
              <div style={{ width: '1px', height: '20px', backgroundColor: theme.palette.divider, margin: '0 8px' }} />
              <Tooltip title="List">
                <IconButton onClick={() => applyList(false)} size="small" className="aws-button">
                  <List size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Numbered List">
                <IconButton onClick={() => applyList(true)} size="small" className="aws-button">
                  <ListOrdered size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Link">
                <IconButton onClick={insertLink} size="small" className="aws-button">
                  <Link size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Quote">
                <IconButton onClick={applyBlockquote} size="small" className="aws-button">
                  <Quote size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Code">
                <IconButton onClick={applyCode} size="small" className="aws-button">
                  <Code size={16} />
                </IconButton>
              </Tooltip>
              <div style={{ flexGrow: 1 }} />
              <Tooltip title="Undo">
                <IconButton onClick={undo} disabled={historyIndex <= 0} size="small" className="aws-button">
                  <Undo size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Redo">
                <IconButton onClick={redo} disabled={historyIndex >= formattingHistory.length - 1} size="small" className="aws-button">
                  <Redo size={16} />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <div style={{ minHeight: '500px' }}>
            {isPreview ? (
              <div className="aws-spacing-lg">
                {watchedTitle && (
                  <h1 className="aws-header-xl" style={{ color: theme.palette.text.primary }}>
                    {watchedTitle}
                  </h1>
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }}
                  className="aws-font"
                  style={{ color: theme.palette.text.primary }}
                />
              </div>
            ) : (
              <TextField
                {...register('content')}
                inputRef={textareaRef}
                multiline
                rows={20}
                placeholder="Start writing your masterpiece here..."
                variant="outlined"
                fullWidth
                error={!!errors.content}
                helperText={errors.content?.message}
                className="aws-font"
                InputProps={{
                  style: {
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    padding: '16px'
                  }
                }}
              />
            )}
          </div>
        </LIVBlogCard>

        {watchedContent.length > 0 && watchedContent.length < 10 && (
          <Alert severity="warning" className="aws-font">
            Content must be at least 10 characters. You need {10 - watchedContent.length} more characters.
          </Alert>
        )}

        <LIVBlogCard title="Quick Tips" padding="medium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="aws-text-body" style={{ fontWeight: 600, margin: '0 0 8px 0', color: theme.palette.primary.main }}>
                Structure & Formatting
              </h4>
              <ul className="aws-text-body" style={{ margin: 0, paddingLeft: '16px', color: theme.palette.text.primary }}>
                <li style={{ marginBottom: '4px' }}>Use headings to create hierarchy</li>
                <li style={{ marginBottom: '4px' }}>Bold key phrases for emphasis</li>
                <li style={{ marginBottom: '4px' }}>Keep paragraphs under 4 lines</li>
              </ul>
            </div>
            <div>
              <h4 className="aws-text-body" style={{ fontWeight: 600, margin: '0 0 8px 0', color: theme.palette.success.main }}>
                Engagement Boosters
              </h4>
              <ul className="aws-text-body" style={{ margin: 0, paddingLeft: '16px', color: theme.palette.text.primary }}>
                <li style={{ marginBottom: '4px' }}>Start with a question or fact</li>
                <li style={{ marginBottom: '4px' }}>Include personal stories</li>
                <li style={{ marginBottom: '4px' }}>End with a call-to-action</li>
              </ul>
            </div>
          </div>
        </LIVBlogCard>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t" style={{ borderColor: theme.palette.divider }}>
          <Button
            onClick={saveDraft}
            variant="outlined"
            className="aws-button aws-button-secondary"
          >
            <FileText size={16} style={{ marginRight: '8px' }} />
            Save Draft
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsPreview(!isPreview)}
              variant="outlined"
              className="aws-button aws-button-secondary"
            >
              {isPreview ? 'Editor' : 'Preview'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || createPostMutation.isPending || watchedContent.length < 10}
              className="aws-button aws-button-primary"
            >
              {createPostMutation.isPending ? (
                <Loader size={16} style={{ marginRight: '8px' }} className="animate-spin" />
              ) : (
                <Save size={16} style={{ marginRight: '8px' }} />
              )}
              {createPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </div>
      </form>

      <AIChat isExpanded={false} />
    </div>
  );
};