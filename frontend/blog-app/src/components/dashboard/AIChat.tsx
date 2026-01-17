import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, MessageCircle, X, Minimize2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import BackendApi from '../../service/BackendApi';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isExpanded = true, onToggleExpand }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm the LIV Blog AI Assistant. I can help you brainstorm blog post ideas, improve your writing, or generate content suggestions. What would you like to ask?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (prompt: string) => BackendApi.askAi(prompt),
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.data || 'I could not generate a response. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error) => {
      console.error('AI request error:', error);
      toast.error('Failed to get AI response. Please try again.');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
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
    
    // Make API call
    mutation.mutate(input);
    setInput('');
  };

  const handleToggle = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    onToggleExpand?.(newExpanded);
  };

  if (!localExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleToggle}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-96 w-full md:w-96 fixed bottom-6 right-6 z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">LIV Blog AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-primary-foreground rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex items-center space-x-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI assistant..."
            disabled={mutation.isPending}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !input.trim()}
            className="p-2 bg-blue-600 text-primary-foreground rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};