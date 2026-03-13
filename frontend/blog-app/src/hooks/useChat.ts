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

        // Send via WebSocket
        try {
            webSocketService.sendChatMessage({
                recipientId,
                content,
                postId,
            });
            // We rely on the WebSocket server to echo back the message or send a confirmation if needed.
            // For now, we keep the optimistic update. Ideally, the server sends back the saved message with the real ID.
            // Since we subscribe to our own topic, we will receive our own message back if the server echoes it (which it does in ChatService).
            // The handleNewMessage function will handle deduping based on ID if the server returns the same tempId (unlikely) or we need a way to reconcile.
            // Currently, ChatService returns a new ID. The optimistic message will stay until we refresh or we implement a reconciliation strategy.
            // A simple strategy is to let the incoming WS message replace the optimistic one if we can match them (e.g. by a temporary client-generated UUID sent to server).
            // For this simple implementation, we'll accept seeing the message appear "again" or we can remove optimistic update logic if WS is fast enough.
            // However, to avoid complexity, let's just use WS send. The incoming message handler will add the real message.
            // We should remove the optimistic one when the real one arrives? Or just not add optimistic?
            // Let's keep optimistic for responsiveness, but we might see duplication if not careful. 
            // Ideally, we send a client-side ID (uuid) and the server returns it.
            
            // Refined approach: Don't add optimistic message here since we don't have a robust way to dedupe without a shared ID.
            // Let's rely on the speed of WS for now, or just add it and filter duplicates in `handleNewMessage` if possible.
            // BUT `handleNewMessage` receives a message with a REAL DB ID. `optimisticMessage` has `tempId`.
            // They won't match. So we'd get duplicates.
            // Solution for this request: Remove optimistic update here and rely on the server echo.
            
             setMessages((prev) => prev.filter(msg => msg.id !== tempId)); // Revert optimistic add for now to avoid duplication
             // Actually, wait. If I remove it immediately, it flashes.
             // Better: The ChatService echoes the message back to sender's topic.
             // So we will receive it via WS. 
             // So we should NOT add it optimistically if we want to avoid duplicates without complex matching logic.
             // OR we add it, and when the WS message comes, we try to match it (hard without unique ID).
             
             // Decision: Remove optimistic update code block entirely from here for the "fully websocket" transition request to keep it simple and consistent.
             // The UI will update when the server processes and broadcasts the message.
             
        } catch (error) {
            console.error("Failed to send message via WebSocket", error);
            // Optionally show error toast
        }
    }, [currentUserId, recipientId]);

    // Redefine sendMessage to NOT do optimistic updates for now to prevent duplication with the echoed WS message
    const sendMessageViaWS = useCallback((content: string, postId?: number) => {
        webSocketService.sendChatMessage({
            recipientId,
            content,
            postId,
        });
    }, [recipientId]);

    return { messages, sendMessage: sendMessageViaWS, isLoading };
};
