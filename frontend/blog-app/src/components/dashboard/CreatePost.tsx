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
  Box,
  Paper,
  TextField,
  Tooltip,
  Chip,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { AIChat } from './AIChat';

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
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: { xs: 2, sm: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Go back">
              <IconButton
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    color: 'primary.main',
                    bgcolor: 'primary.50',
                    '&:hover': {
                      bgcolor: 'primary.100',
                      transform: 'translateX(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
              >
                <ArrowLeft />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mb: 0.5
                  }}
              >
                Create New Post
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Craft your story with our enhanced editor
              </Typography>
            </Box>
          </Box>
          <Button
              variant="outlined"
              startIcon={isPreview ? <EyeOff /> : <Eye />}
              onClick={() => setIsPreview(!isPreview)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
          >
            {isPreview ? 'Switch to Editor' : 'Live Preview'}
          </Button>
        </Box>

        {/* Stats Bar */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50', borderRadius: 2 }}>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>Words</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{wordCount}</Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50', borderRadius: 2 }}>
            <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600 }}>Characters</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{watchedContent.length}</Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', borderRadius: 2 }}>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>Paragraphs</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{paragraphCount}</Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', borderRadius: 2 }}>
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>Reading Time</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{readingTime} min</Typography>
          </Paper>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Title Input */}
          <Paper sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Post Title
            </Typography>
            <TextField
                {...register('title')}
                placeholder="Catchy title that grabs attention..."
                variant="standard"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    '& input': {
                      padding: 0,
                    }
                  }
                }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              Keep it concise and engaging (3-10 words)
            </Typography>
          </Paper>

          {/* Category Selection */}
          <Paper sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Category
            </Typography>
            <FormControl fullWidth variant="outlined">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as string)}
                sx={{ fontSize: '1rem' }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              Choose the most relevant category for your post
            </Typography>
          </Paper>

          {/* Content Section */}
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
            {/* Toolbar */}
            <Box sx={(theme) => ({
              bgcolor: theme.palette.action.hover,
              p: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              alignItems: 'center'
            })}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 2 }}>
                Formatting Tools:
              </Typography>

              <Tooltip title="Bold (Ctrl+B)">
                <IconButton onClick={applyBold} size="small" sx={{ borderRadius: 1 }}>
                  <Bold size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Italic (Ctrl+I)">
                <IconButton onClick={applyItalic} size="small" sx={{ borderRadius: 1 }}>
                  <Italic size={18} />
                </IconButton>
              </Tooltip>

              <Box sx={{ width: 1, borderLeft: 1, borderColor: 'divider', mx: 1, height: 24 }} />

              <Tooltip title="Heading 1">
                <IconButton onClick={() => applyHeading(1)} size="small" sx={{ borderRadius: 1 }}>
                  <Heading1 size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Heading 2">
                <IconButton onClick={() => applyHeading(2)} size="small" sx={{ borderRadius: 1 }}>
                  <Heading2 size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Heading 3">
                <IconButton onClick={() => applyHeading(3)} size="small" sx={{ borderRadius: 1 }}>
                  <Heading3 size={18} />
                </IconButton>
              </Tooltip>

              <Box sx={{ width: 1, borderLeft: 1, borderColor: 'divider', mx: 1, height: 24 }} />

              <Tooltip title="Bulleted List">
                <IconButton onClick={() => applyList(false)} size="small" sx={{ borderRadius: 1 }}>
                  <List size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Numbered List">
                <IconButton onClick={() => applyList(true)} size="small" sx={{ borderRadius: 1 }}>
                  <ListOrdered size={18} />
                </IconButton>
              </Tooltip>

              <Box sx={{ width: 1, borderLeft: 1, borderColor: 'divider', mx: 1, height: 24 }} />

              <Tooltip title="Insert Link">
                <IconButton onClick={insertLink} size="small" sx={{ borderRadius: 1 }}>
                  <Link size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Blockquote">
                <IconButton onClick={applyBlockquote} size="small" sx={{ borderRadius: 1 }}>
                  <Quote size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Code Block">
                <IconButton onClick={applyCode} size="small" sx={{ borderRadius: 1 }}>
                  <Code size={18} />
                </IconButton>
              </Tooltip>

              <Box sx={{ flexGrow: 1 }} />

              <Tooltip title={historyIndex <= 0 ? "No more actions to undo" : "Undo (Ctrl+Z)"}>
                <span>
                  <IconButton
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      size="small"
                      sx={{ borderRadius: 1 }}
                  >
                    <Undo size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={historyIndex >= formattingHistory.length - 1 ? "No more actions to redo" : "Redo (Ctrl+Y)"}>
                <span>
                  <IconButton
                      onClick={redo}
                      disabled={historyIndex >= formattingHistory.length - 1}
                      size="small"
                      sx={{ borderRadius: 1 }}
                  >
                    <Redo size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {/* Content Input/Preview */}
            <Box sx={{ minHeight: 500 }}>
              {isPreview ? (
                  <Box sx={{ p: 3 }}>
                    {watchedTitle && (
                        <Typography
                            variant="h1"
                            sx={{
                              fontSize: '2.5rem',
                              fontWeight: 800,
                              mb: 4,
                              color: 'text.primary',
                              lineHeight: 1.2
                            }}
                        >
                          {watchedTitle}
                        </Typography>
                    )}
                    <Box
                        dangerouslySetInnerHTML={{ __html: formatContent(watchedContent) }}
                        sx={{
                          '& h1': {
                            fontSize: '2rem !important',
                            fontWeight: 700,
                            mb: 3,
                            color: 'text.primary'
                          },
                          '& h2': {
                            fontSize: '1.75rem !important',
                            fontWeight: 600,
                            mb: 2,
                            color: 'text.primary'
                          },
                          '& h3': {
                            fontSize: '1.5rem !important',
                            fontWeight: 600,
                            mb: 1.5,
                            color: 'text.primary'
                          },
                          '& p': {
                            fontSize: '1.125rem',
                            lineHeight: 1.8,
                            mb: 2
                          },
                          '& a': {
                            color: 'primary.main',
                            textDecoration: 'none',
                            borderBottom: '1px dashed',
                            borderColor: 'primary.main',
                            '&:hover': { textDecoration: 'underline' }
                          },
                          '& code': {
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                            borderRadius: 1,
                            px: 0.5,
                            py: 0.25,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            fontSize: '0.875rem'
                          },
                          '& blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            pl: 2,
                            ml: 0,
                            my: 2,
                            color: 'text.secondary',
                            fontStyle: 'italic'
                          },
                          '& pre': {
                            bgcolor: 'grey.900',
                            color: 'common.white',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            my: 2
                          },
                          '& ul, & ol': {
                            pl: 3,
                            mb: 2
                          },
                          '& li': {
                            mb: 0.5
                          }
                        }}
                    />
                  </Box>
              ) : (
                  <TextField
                      {...register('content')}
                      inputRef={textareaRef}
                      multiline
                      rows={20}
                      placeholder={`Start writing your masterpiece here...

# Main Heading
Start with a compelling headline

## Subheading
Organize your content with headings

**Highlight important points** with bold text
*Add emphasis* with italic text

- Create bullet lists
- For easy reading

1. Or numbered lists
2. For step-by-step instructions

> Use blockquotes for important insights

\`\`\`
Add code snippets when needed
\`\`\`

[Add links](https://example.com) to reference sources`}
                      variant="outlined"
                      fullWidth
                      error={!!errors.content}
                      helperText={errors.content?.message}
                      InputProps={{
                        sx: {
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '1rem',
                          lineHeight: 1.7,
                          p: 2,
                          '& textarea': {
                            resize: 'vertical',
                            minHeight: '40px'
                          }
                        }
                      }}
                  />
              )}
            </Box>
          </Paper>

          {/* Validation Alert */}
          {watchedContent.length > 0 && watchedContent.length < 10 && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Content must be at least 10 characters. You need {10 - watchedContent.length} more characters.
              </Alert>
          )}

          {/* Keyboard Shortcuts Guide */}
          <Paper sx={(theme) => ({ p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` })}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              🎯 Quick Formatting Tips
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1
            }}>
              <Chip
                  label="Ctrl+B → Bold"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
              />

              <Chip
                  label="Ctrl+I → Italic"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
              />

              <Chip
                  label="Select text first"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
              />

              <Chip
                  label="Click icons to format"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            pt: 3,
            mt: 2,
            borderTop: 1,
            borderColor: 'divider',
            gap: { xs: 2, sm: 0 }
          }}>
            <Button
                variant="outlined"
                onClick={saveDraft}
                startIcon={<FileText />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
            >
              Save as Draft
            </Button>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                  variant="outlined"
                  onClick={() => setIsPreview(!isPreview)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3
                  }}
              >
                {isPreview ? 'Back to Editor' : 'Preview'}
              </Button>
              <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || createPostMutation.isPending || watchedContent.length < 10}
                  startIcon={createPostMutation.isPending ? <Loader className="animate-spin" /> : <Save />}
                  sx={(theme) => ({
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateY(-1px)',
                      boxShadow: 3
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground
                    }
                  })}
              >
                {createPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tips Section */}
        <Paper sx={{
          p: 3,
          mt: 4,
          bgcolor: 'primary.50',
          border: 2,
          borderColor: 'primary.100',
          borderRadius: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>
              <Type />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
              ✨ Pro Writing Tips
            </Typography>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            <Box sx={(theme) => ({
              bgcolor: theme.palette.background.paper,
              p: 2,
              borderRadius: 2,
              height: '100%',
              boxShadow: 1,
              border: `1px solid ${theme.palette.divider}`
            })}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                Structure & Formatting
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  Use <strong>headings</strong> to create a clear hierarchy
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  <strong>Bold key phrases</strong> for skimmers
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  Keep paragraphs under 4 lines
                </Typography>
              </Box>
            </Box>

            <Box sx={(theme) => ({
              bgcolor: theme.palette.background.paper,
              p: 2,
              borderRadius: 2,
              height: '100%',
              boxShadow: 1,
              border: `1px solid ${theme.palette.divider}`
            })}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                Engagement Boosters
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  Start with a question or surprising fact
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  Include <em>personal stories</em> or examples
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  End with a call-to-action
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        {/* AI Chat Assistant */}
        <AIChat isExpanded={false} />
      </Box>
  );
};

