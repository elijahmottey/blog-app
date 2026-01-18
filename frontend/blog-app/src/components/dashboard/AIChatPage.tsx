import React from 'react';
import { AIChat } from './AIChat';

export const AIChatPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Chat</h1>
            <p className="text-gray-600 mb-6">
                Use the AI assistant to help you with your writing, brainstorm ideas, or get insights on your content.
            </p>
            <AIChat isExpanded={true} onToggleExpand={() => {}} />
        </div>
    );
};
