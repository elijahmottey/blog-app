import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { AIChat } from './AIChat';

interface AIChatWidgetProps {
  title?: string;
  description?: string;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  title = 'AI Writing Assistant',
  description = 'Get AI-powered suggestions for your blog posts',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Inline Widget */}
      {!isExpanded && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Chatting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chat */}
      {isExpanded && (
        <AIChat isExpanded={true} onToggleExpand={setIsExpanded} />
      )}
    </>
  );
};