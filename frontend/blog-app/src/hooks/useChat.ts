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
                const response = await BackendApi.getChatHistory(recipientId);
                setMessages(response.data);

                // Mark incoming messages as read
                await BackendApi.markChatAsRead(recipientId);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();

        // 2. Subscribe to new messages / read receipts
        const handleNewMessage = (message: any) => {
            if (message.type === 'READ_RECEIPT') {
                // If we get a read receipt indicating the recipient read our messages
                if (message.readerId === recipientId) {
                    setMessages(prev => prev.map(msg =>
                        (msg.senderId === currentUserId && !msg.isRead) ? { ...msg, isRead: true } : msg
                    ));
                }
            } else {
                // Normal chat message
                setMessages((prev) => [...prev, message]);

                // If message is from the person we are chatting with, immediately mark it read
                if (message.senderId === recipientId) {
                    BackendApi.markChatAsRead(recipientId).catch(console.error);
                }
            }
        };

        webSocketService.subscribeToChat(currentUserId, handleNewMessage);

        return () => {
            webSocketService.unsubscribeFromChat(currentUserId);
        };
    }, [currentUserId, recipientId]);

    const sendMessage = useCallback(async (content: string, postId?: number) => {
        // Optimistic update
        const tempId = Date.now();
        const optimisticMessage: ChatMessage = {
            id: tempId,
            senderId: currentUserId,
            recipientId,
            content,
            postId,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        // Send via REST endpoint for secure persistence
        try {
            const response = await BackendApi.sendChatMessage({
                recipientId,
                content,
                postId,
            });

            // Replace optimistic message with actual DB representation
            setMessages(prev => prev.map(msg => msg.id === tempId ? response.data : msg));
        } catch (error) {
            console.error("Failed to send message", error);
            // Optionally remove pessimistic message or mark as failed
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    }, [currentUserId, recipientId]);

    return { messages, sendMessage, isLoading };
};
