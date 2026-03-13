import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  MessageCircle,
  X,
  Minimize2,
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  History,
  Trash2,
  Mic,
  MicOff,
  Paperclip
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Badge,
  Chip,
  Tooltip,
  CircularProgress,
  ListItemText,
  Divider,
  Fab,
  Slide,
  Zoom,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { useTheme, alpha, darken } from '@mui/material/styles';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  liked?: boolean;
  copied?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  prompt: string;
  icon: React.ReactElement;
  palette: 'primary' | 'success' | 'warning' | 'secondary';
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

interface AIChatProps {
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  variant?: 'floating' | 'sidebar';
  onClose?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  isExpanded = false,
  onToggleExpand,
  variant = 'floating',
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm the LIV Blog AI Assistant. 🤖\n\nI can help you:\n• Brainstorm blog post ideas\n• Improve your writing\n• Generate content suggestions\n• Proofread your articles\n• Create outlines\n• Suggest titles\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const [isMinimized, setIsMinimized] = useState(!isExpanded);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick action prompts
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Brainstorm Ideas',
      prompt: 'Brainstorm 5 blog post ideas about technology trends for next year',
      icon: <Sparkles size={16} />,
      palette: 'primary'
    },
    {
      id: '2',
      title: 'Improve Writing',
      prompt: 'Help me improve this paragraph for better engagement:',
      icon: <Bot size={16} />,
      palette: 'success'
    },
    {
      id: '3',
      title: 'Generate Title',
      prompt: 'Generate 10 catchy titles for a post about AI in content creation',
      icon: <MessageCircle size={16} />,
      palette: 'warning'
    },
    {
      id: '4',
      title: 'Create Outline',
      prompt: 'Create a detailed outline for a beginner\'s guide to React',
      icon: <Paperclip size={16} />,
      palette: 'secondary'
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Speech recognition failed');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (prompt: string) => BackendApi.askAi(prompt),
    onMutate: () => {
      setTypingIndicator(true);
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.data || 'I could not generate a response. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setTypingIndicator(false);

      // Save to history
      const newHistory: ChatHistory = {
        id: Date.now().toString(),
        title: input.substring(0, 30) + '...',
        timestamp: new Date(),
        messages: [...messages, aiMessage]
      };
      setChatHistory(prev => [newHistory, ...prev.slice(0, 9)]); // Keep last 10 chats
    },
    onError: (error) => {
      console.error('AI request error:', error);
      toast.error('Failed to get AI response. Please try again.');
      setTypingIndicator(false);
    },
  });

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setShowQuickActions(false);

    // Make API call
    mutation.mutate(input);
    setInput('');
    inputRef.current?.focus();
  }, [input, mutation]);

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, copied: true } : msg
    ));
    toast.success('Copied to clipboard!');
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, copied: false } : msg
      ));
    }, 2000);
  };

  const handleRateMessage = (messageId: string, liked: boolean) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, liked } : msg
    ));
    toast.success(`Message ${liked ? 'liked' : 'disliked'}!`);
  };

  const handleToggle = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    setIsMinimized(!newExpanded);
    onToggleExpand?.(newExpanded);
  };

  const handleMinimize = () => {
    if (variant === 'sidebar' && onClose) {
      onClose();
    } else {
      setIsMinimized(true);
      setLocalExpanded(false);
      onToggleExpand?.(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "Hello! I'm the LIVBlog AI Assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setShowQuickActions(true);
    toast.success('Chat cleared!');
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleHistoryClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHistoryClose = () => {
    setAnchorEl(null);
  };

  const loadHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setAnchorEl(null);
    toast.success('Chat history loaded!');
  };

  if (isMinimized && variant === 'floating') {
    return (
      <Zoom in={true}>
        <Fab
          onClick={handleToggle}
          sx={(theme) => ({
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1A73E8 0%, #A142F4 50%, #E9429E 100%)',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(161, 66, 244, 0.39)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1765CC 0%, #8E3BD8 50%, #D4398D 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 20px rgba(161, 66, 244, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          })}
        >
          <Badge
            badgeContent={mutation.isPending ? '✨' : messages.length}
            color="error"
          >
            <Sparkles className="animate-pulse" />
          </Badge>
        </Fab>
      </Zoom>
    );
  }

  const containerContent = (
    <>
      <Box
        sx={(theme) => ({
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: theme.palette.text.primary,
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1A73E8 0%, #A142F4 50%, #E9429E 100%)',
              color: 'white',
            }}
          >
            <Sparkles size={18} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, background: 'linear-gradient(90deg, #1A73E8, #A142F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Help me write
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              LIV AI Assistant
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Chat History">
            <IconButton
              size="small"
              onClick={handleHistoryClick}
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              <History size={18} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleHistoryClose}
            PaperProps={{
              sx: { width: 280, maxHeight: 300, borderRadius: 2 }
            }}
          >
            <Typography sx={{ p: 2, fontWeight: 'bold' }}>
              Chat History
            </Typography>
            <Divider />
            {chatHistory.length === 0 ? (
              <Typography sx={{ p: 2, color: 'text.secondary' }}>
                No history yet
              </Typography>
            ) : (
              chatHistory.map((history) => (
                <MenuItem
                  key={history.id}
                  onClick={() => loadHistory(history)}
                  sx={{ py: 1 }}
                >
                  <ListItemText
                    primary={history.title}
                    secondary={formatDistanceToNow(history.timestamp, { addSuffix: true })}
                  />
                </MenuItem>
              ))
            )}
          </Menu>

          <Tooltip title="Clear Chat">
            <IconButton
              size="small"
              onClick={handleClearChat}
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isMinimized ? "Maximize" : "Minimize"}>
            <IconButton
              size="small"
              onClick={handleMinimize}
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              <Minimize2 size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={handleMinimize}
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
            >
              <X size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        {showQuickActions && (
          <Zoom in={true}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {quickActions.map((action) => (
                  <Chip
                    key={action.id}
                    label={action.title}
                    onClick={() => handleQuickAction(action.prompt)}
                    icon={action.icon}
                    sx={(theme) => ({
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '16px', // Pill shape
                      py: 2.5,
                      px: 1,
                      fontSize: '0.85rem',
                      '& .MuiChip-icon': {
                        color: 'transparent',
                        background: 'linear-gradient(135deg, #1A73E8 0%, #A142F4 100%)',
                        WebkitBackgroundClip: 'text',
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: theme.palette.text.disabled,
                      },
                      transition: 'all 0.2s',
                    })}
                    size="medium"
                  />
                ))}
              </Box>
            </Box>
          </Zoom>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, maxWidth: message.type === 'user' ? '85%' : '100%', width: message.type === 'ai' ? '100%' : 'auto' }}>
              {message.type === 'ai' && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1A73E8 0%, #A142F4 50%, #E9429E 100%)',
                    color: 'white',
                    mt: 0.5,
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={14} />
                </Box>
              )}

              <Box
                sx={{
                  p: message.type === 'user' ? 2 : 0,
                  pt: message.type === 'ai' ? 0.5 : 2,
                  borderRadius: message.type === 'user' ? '24px' : 0,
                  borderBottomRightRadius: message.type === 'user' ? '4px' : 0,
                  bgcolor: message.type === 'user' ? 'action.hover' : 'transparent',
                  color: 'text.primary',
                  position: 'relative',
                  width: message.type === 'ai' ? '100%' : 'auto'
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {message.content}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                  {message.type === 'ai' && (
                    <>
                      <Tooltip title="Copy">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          sx={{
                            width: 28,
                            height: 28,
                            color: message.copied ? 'success.main' : 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                          }}
                        >
                          <Copy size={16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Helpful">
                        <IconButton
                          size="small"
                          onClick={() => handleRateMessage(message.id, true)}
                          sx={{
                            width: 28,
                            height: 28,
                            color: message.liked === true ? 'success.main' : 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover', color: 'success.main' },
                          }}
                        >
                          <ThumbsUp size={16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Not helpful">
                        <IconButton
                          size="small"
                          onClick={() => handleRateMessage(message.id, false)}
                          sx={{
                            width: 28,
                            height: 28,
                            color: message.liked === false ? 'error.main' : 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover', color: 'error.main' },
                          }}
                        >
                          <ThumbsDown size={16} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}

        {typingIndicator && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1A73E8 0%, #A142F4 50%, #E9429E 100%)',
                color: 'white',
              }}
            >
              <Sparkles size={14} className="animate-pulse" />
            </Box>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderTopLeftRadius: 4,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <CircularProgress size={12} />
                <Typography variant="caption" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={mutation.isPending}
            variant="outlined"
            sx={(theme) => ({
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                pr: 10, // give space for absolute positioned buttons
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: theme.palette.divider,
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent', // We'll use box-shadow for glowing border
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px transparent, 0 0 0 4px ${alpha('#A142F4', 0.2)}`,
                  background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #1A73E8 0%, #A142F4 50%, #E9429E 100%) border-box`,
                  border: '1px solid transparent',
                }
              }
            })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          <Box sx={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Voice Input">
              <IconButton
                size="small"
                onClick={handleVoiceInput}
                sx={{
                  color: isRecording ? 'error.main' : 'text.secondary',
                  bgcolor: isRecording ? alpha('#f44336', 0.1) : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Send">
              <span>
                <IconButton
                  type="submit"
                  disabled={mutation.isPending || !input.trim()}
                  sx={{
                    color: (input.trim() || mutation.isPending) ? 'primary.main' : 'text.disabled',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {mutation.isPending ? <CircularProgress size={18} thickness={5} /> : <Send size={18} />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </form>
      </Box>
    </>
  );

  if (variant === 'sidebar') {
    return (
      <Box
        sx={(theme) => ({
          width: '100%',
          height: '100%', // Use full height from container
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.background.paper, 
          // Removed fixed positioning for sidebar variant
          borderLeft: `1px solid ${theme.palette.divider}`,
          // boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', // Removed shadow as it's now part of layout
        })}
      >
        {containerContent}
      </Box>
    );
  }

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        elevation={15}
        sx={(theme) => ({
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: { xs: 'calc(100vw - 50px)', sm: 420, md: 500 },
          height: 600,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
        })}
      >
        {containerContent}
      </Paper>
    </Slide>
  );
};