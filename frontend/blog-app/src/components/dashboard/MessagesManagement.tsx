import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Badge, CircularProgress, Divider, Paper } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { MessageSquare, User as UserIcon } from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { useAuth } from '../../context/AuthContext';
import { ChatWindow } from '../chat/ChatWindow';
import { webSocketService } from '../../service/WebSocketService';

interface ConversationPartner {
    id: number;
    name: string;
    email: string;
    avatar: string;
    unreadCount: number;
}

export const MessagesManagement: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [selectedUser, setSelectedUser] = useState<ConversationPartner | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['chat', 'conversations'],
        queryFn: () => BackendApi.getChatConversations(),
        enabled: !!user,
        refetchInterval: 10000, // Refetch every 10s as a fallback, WS handles real-time mostly
    });

    // Set up WebSocket listener to refresh conversations list if a new message comes in
    // from someone not currently selected or to update unread counts.
    useEffect(() => {
        if (!user) return;

        const handleNewMessage = (msg: any) => {
            if (msg.type !== 'READ_RECEIPT') {
                // If it's a new message, refetch the conversation list to update unread counts
                refetch();
            }
        };

        // We can subscribe here as well just to trigger refetches for the list
        webSocketService.subscribeToChat(user.id, handleNewMessage);

        return () => {
            // Note: unsubscribing here might affect ChatWindow if it uses the same ID.
            // A more robust pub/sub system on the frontend would be better for multiple listeners.
            // For now, we rely on the refetchInterval or the user clicking to refresh.
        };
    }, [user, refetch]);

    const conversations = data?.data || [];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: 'calc(100vh - 120px)' }}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Messages</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your conversations with other users.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, gap: 3, overflow: 'hidden' }}>
                {/* Conversation List */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        width: { xs: '100%', md: '350px' }, 
                        display: { xs: selectedUser ? 'none' : 'flex', md: 'flex' },
                        flexDirection: 'column',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                        <Typography variant="subtitle1" fontWeight="bold">Recent Conversations</Typography>
                    </Box>
                    
                    <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                        {conversations.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <MessageSquare size={48} color={theme.palette.text.disabled} style={{ margin: '0 auto', marginBottom: 16 }} />
                                <Typography color="text.secondary">No conversations yet.</Typography>
                            </Box>
                        ) : (
                            conversations.map((partner: ConversationPartner, index: number) => (
                                <React.Fragment key={partner.id}>
                                    <ListItem 
                                        button 
                                        onClick={() => setSelectedUser(partner)}
                                        sx={{ 
                                            bgcolor: selectedUser?.id === partner.id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge color="error" badgeContent={partner.unreadCount} overlap="circular">
                                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                                    {partner.avatar ? (
                                                        <img src={partner.avatar} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        partner.name ? partner.name.charAt(0).toUpperCase() : <UserIcon size={20} />
                                                    )}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={
                                                <Typography variant="subtitle2" fontWeight={partner.unreadCount > 0 ? 'bold' : 'normal'}>
                                                    {partner.name}
                                                </Typography>
                                            } 
                                            secondary={
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {partner.email}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < conversations.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>

                {/* Chat Area */}
                <Box 
                    sx={{ 
                        flex: 1, 
                        display: { xs: selectedUser ? 'flex' : 'none', md: 'flex' },
                        position: 'relative'
                    }}
                >
                    {selectedUser ? (
                        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                             {/* Reusing ChatWindow but overriding its fixed positioning via CSS if possible, 
                                 or we just let it float. For a seamless dashboard experience, it's better to render it inline.
                                 Since ChatWindow has fixed classes, we'll wrap it in a container that forces it to behave.
                             */}
                             <style>{`
                                .embedded-chat-window .fixed {
                                    position: absolute !important;
                                    bottom: 0 !important;
                                    right: 0 !important;
                                    width: 100% !important;
                                    height: 100% !important;
                                    max-height: none !important;
                                    border-radius: 8px !important;
                                }
                             `}</style>
                             <div className="embedded-chat-window" style={{ width: '100%', height: '100%' }}>
                                <ChatWindow
                                    recipientId={selectedUser.id}
                                    recipientName={selectedUser.name}
                                    onClose={() => {
                                        setSelectedUser(null);
                                        refetch(); // Refetch to update unread counts
                                    }}
                                />
                             </div>
                        </Box>
                    ) : (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                width: '100%', 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center', 
                                justifyContent: 'center',
                                border: `1px dashed ${theme.palette.divider}`,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.paper, 0.5)
                            }}
                        >
                            <MessageSquare size={64} color={theme.palette.divider} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" color="text.secondary">Select a conversation</Typography>
                            <Typography variant="body2" color="text.disabled">Choose a user from the list to start chatting.</Typography>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
};
