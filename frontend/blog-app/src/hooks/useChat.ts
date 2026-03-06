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
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();

        // 2. Subscribe to new messages
        const handleNewMessage = (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        };

        webSocketService.subscribeToChat(currentUserId, handleNewMessage);

        return () => {
            webSocketService.unsubscribeFromChat(currentUserId);
        };
    }, [currentUserId, recipientId]);

    const sendMessage = useCallback((content: string, postId?: number) => {
        webSocketService.sendChatMessage({
            recipientId,
            content,
            postId,
        });

        // Optimistic update isn't strictly necessary as the backend will broadcast it back to the sender
        // but usually, it's pushed to the recipient. Wait, let's see backend ChatService.
        // The backend only sends to recipientId!
        // So the sender MUST optimistic update, or the backend must send to both.
        // Given our backend sends to `recipientId`, we will optimistic update here.
        const optimisticMessage: ChatMessage = {
            id: Date.now(), // Temp ID
            senderId: currentUserId,
            recipientId,
            content,
            postId,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
    }, [currentUserId, recipientId]);

    return { messages, sendMessage, isLoading };
};
