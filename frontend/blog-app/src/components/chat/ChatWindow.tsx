import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Check, CheckCheck } from 'lucide-react';

interface ChatWindowProps {
    recipientId: number;
    recipientName: string;
    postId?: number;
    onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ recipientId, recipientName, postId, onClose }) => {
    const { user } = useAuth();
    const currentUserId = user?.id;

    const { messages, sendMessage, isLoading } = useChat(currentUserId || 0, recipientId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserId) return;

        sendMessage(newMessage, postId);
        setNewMessage('');
    };

    if (!currentUserId) {
        return null; // Don't render chat if not logged in
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[500px] max-h-[80vh] z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Chat with {recipientName}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Real-time chat
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="text-gray-500 text-sm">Loading history...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="text-gray-500 text-sm text-center">
                            No messages yet.<br />Start the conversation!
                        </span>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div
                                key={msg.id || idx}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-bl-none border border-gray-100 dark:border-gray-600'
                                        }`}
                                >
                                    <p className="text-sm break-words">{msg.content}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-1 mx-1">
                                    <span className="text-[10px] text-gray-500">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        msg.isRead ? (
                                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                            <Check className="w-3 h-3 text-gray-400" />
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white p-2 text-sm rounded-full transition-colors flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};
