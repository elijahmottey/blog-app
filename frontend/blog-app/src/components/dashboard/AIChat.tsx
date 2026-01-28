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
}

export const AIChat: React.FC<AIChatProps> = ({ isExpanded = false, onToggleExpand }) => {
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
    setIsMinimized(true);
    setLocalExpanded(false);
    onToggleExpand?.(false);
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

  if (isMinimized) {
    return (
        <Zoom in={true}>
          <Fab
              color="primary"
              onClick={handleToggle}
              sx={(theme) => ({
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${darken(theme.palette.secondary.main, 0.1)} 100%)`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${darken(theme.palette.primary.main, 0.05)} 0%, ${darken(theme.palette.secondary.main, 0.15)} 100%)`,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              })}
          >
            <Badge
                badgeContent={mutation.isPending ? '🤔' : messages.length}
                color="secondary"
            >
              <Bot />
            </Badge>
          </Fab>
        </Zoom>
    );
  }

  // @ts-ignore
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
              height: 550,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            })}
        >
          {/* Header */}
          <Box
              sx={(theme) => ({
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${darken(theme.palette.secondary.main, 0.1)} 100%)`,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    width: 32,
                    height: 32,
                  }}
              >
                <Bot size={20} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  LIV AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Powered by GPT-4
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Chat History">
                <IconButton
                    size="small"
                    onClick={handleHistoryClick}
                    sx={{ color: 'white' }}
                >
                  <History size={18} />
                </IconButton>
              </Tooltip>

              <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleHistoryClose}
                  PaperProps={{
                    sx: { width: 280, maxHeight: 300 }
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
                    sx={{ color: 'white' }}
                >
                  <Trash2 size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title={isMinimized ? "Maximize" : "Minimize"}>
                <IconButton
                    size="small"
                    onClick={handleMinimize}
                    sx={{ color: 'white' }}
                >
                  <Minimize2 size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Close">
                <IconButton
                    size="small"
                    onClick={handleMinimize}
                    sx={{ color: 'white' }}
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
                  <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        🚀 Quick Actions
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {quickActions.map((action) => (
                            <Chip
                                key={action.id}
                                label={action.title}
                                onClick={() => handleQuickAction(action.prompt)}
                                icon={action.icon}
                                sx={(theme) => {
                                  const main = theme.palette[action.palette].main;
                                  return {
                                    bgcolor: alpha(main, 0.08),
                                    color: main,
                                    border: `1px solid ${alpha(main, 0.2)}`,
                                    '&:hover': {
                                      bgcolor: alpha(main, 0.15),
                                    },
                                  };
                                }}
                                size="small"
                            />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
            )}

            {messages.map((message) => (
                <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '85%' }}>
                    {message.type === 'ai' && (
                        <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: 'primary.main',
                              mt: 0.5,
                            }}
                        >
                          <Bot size={16} />
                        </Avatar>
                    )}

                    <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          borderTopLeftRadius: message.type === 'ai' ? 4 : 16,
                          borderTopRightRadius: message.type === 'user' ? 4 : 16,
                          bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                          color: message.type === 'user' ? 'white' : 'text.primary',
                          position: 'relative',
                        }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {message.content}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </Typography>

                        {message.type === 'ai' && (
                            <>
                              <Tooltip title="Copy">
                                <IconButton
                                    size="small"
                                    onClick={() => handleCopyMessage(message.content, message.id)}
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      color: message.copied ? 'success.main' : 'inherit',
                                      opacity: 0.7,
                                      '&:hover': { opacity: 1 },
                                    }}
                                >
                                  <Copy size={12} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Helpful">
                                <IconButton
                                    size="small"
                                    onClick={() => handleRateMessage(message.id, true)}
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      color: message.liked === true ? 'success.main' : 'inherit',
                                      opacity: 0.7,
                                      '&:hover': { opacity: 1 },
                                    }}
                                >
                                  <ThumbsUp size={12} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Not helpful">
                                <IconButton
                                    size="small"
                                    onClick={() => handleRateMessage(message.id, false)}
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      color: message.liked === false ? 'error.main' : 'inherit',
                                      opacity: 0.7,
                                      '&:hover': { opacity: 1 },
                                    }}
                                >
                                  <ThumbsDown size={12} />
                                </IconButton>
                              </Tooltip>
                            </>
                        )}
                      </Box>
                    </Paper>

                    {message.type === 'user' && (
                        <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: 'secondary.main',
                              mt: 0.5,
                            }}
                        >
                          <User size={16} />
                        </Avatar>
                    )}
                  </Box>
                </Box>
            ))}

            {typingIndicator && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: 'primary.main',
                      }}
                  >
                    <Bot size={16} />
                  </Avatar>
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
            <form onSubmit={handleSendMessage}>
              <TextField
                  inputRef={inputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the AI assistant..."
                  disabled={mutation.isPending}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Voice Input">
                            <IconButton
                                size="small"
                                onClick={handleVoiceInput}
                                sx={{
                                  color: isRecording ? 'error.main' : 'inherit',
                                }}
                            >
                              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 2, pr: 1 }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Press Enter to send, Shift+Enter for new line
                </Typography>

                <Button
                    type="submit"
                    variant="contained"
                    disabled={mutation.isPending || !input.trim()}
                    startIcon={mutation.isPending ? <CircularProgress size={16} /> : <Send size={16} />}
                    sx={(theme) => ({
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${darken(theme.palette.secondary.main, 0.1)} 100%)`,
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 2,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${darken(theme.palette.primary.main, 0.05)} 0%, ${darken(theme.palette.secondary.main, 0.15)} 100%)`,
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground,
                      },
                    })}
                >
                  {mutation.isPending ? 'Thinking...' : 'Send'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Slide>
  );
};