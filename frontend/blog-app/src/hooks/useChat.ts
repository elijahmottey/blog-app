import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from '../service/WebSocketService';
import BackendApi from '../service/BackendApi';

export interface ChatMessage {
    id: number;
    senderId: number;
    recipientId: number;
    content: string;
    postId?: number;
    timestamp: string;
    isRead?: boolean;
}

export const useChat = (currentUserId: number, recipientId: number) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch historical messages
        const fetchHistory = async () => {
            try {
                // Ensure we pass the correct recipientId to fetch history with that specific user
                const response = await BackendApi.getChatHistory(recipientId);
                // The backend likely returns a list of messages. Ensure we handle potential data wrapping.
                // @ts-ignore
                const history = Array.isArray(response) ? response : (response.data || []);
                setMessages(history);

                // Mark incoming messages from this recipient as read
                if (history.length > 0) {
                    // Use WebSocket for read receipt if connected, else fallback to REST in BackendApi (not implemented there yet for pure WS transition)
                    // For now, let's assume we want to use WS for this too if possible.
                    webSocketService.markMessagesAsRead(recipientId);
                }
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (recipientId) {
            fetchHistory();
        } else {
            setIsLoading(false);
        }

        // 2. Subscribe to new messages / read receipts
        const handleNewMessage = (message: any) => {
            // Check if this message belongs to the current conversation
            const isRelevantMessage = 
                (message.senderId === recipientId && message.recipientId === currentUserId) ||
                (message.senderId === currentUserId && message.recipientId === recipientId);

            if (!isRelevantMessage) return;

            if (message.type === 'READ_RECEIPT') {
                // If we get a read receipt indicating the recipient read our messages
                if (message.readerId === recipientId) {
                    setMessages(prev => prev.map(msg =>
                        (msg.senderId === currentUserId && !msg.isRead) ? { ...msg, isRead: true } : msg
                    ));
                }
            } else {
                // Normal chat message
                // Check if message is already in state (prevent duplicates from WS + optimistic update)
                setMessages((prev) => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });

                // If message is from the person we are chatting with, immediately mark it read
                if (message.senderId === recipientId) {
                    webSocketService.markMessagesAsRead(recipientId);
                }
            }
        };

        // Subscribe to messages for the current user
        webSocketService.subscribeToChat(currentUserId, handleNewMessage);

        return () => {
            // We might not want to unsubscribe globally if other components use this subscription
            // But for this hook instance, we stop listening. 
            // In a real app, you might want a more robust subscription manager.
            webSocketService.unsubscribeFromChat(currentUserId);
        };
    }, [currentUserId, recipientId]);

    const sendMessageViaWS = useCallback((content: string, postId?: number) => {
        webSocketService.sendChatMessage({
            recipientId,
            content,
            postId,
        });
    }, [recipientId]);

    return { messages, sendMessage: sendMessageViaWS, isLoading };
};
