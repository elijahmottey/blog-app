import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { AIChat } from './AIChat';

interface AIChatWidgetProps {
  title?: string;
  description?: string;
  floating?: boolean;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  title = 'AI Writing Assistant',
  description = 'Get AI-powered suggestions for your blog posts',
  floating = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (floating) {
    return (
      <>
        {/* Floating Button */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="AI Chat Assistant"
          >
            <Zap className="h-6 w-6" />
          </button>
        )}

        {/* Expanded Chat - Modal style */}
        {isExpanded && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <AIChat isExpanded={true} onToggleExpand={setIsExpanded} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

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
                  className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-primary-foreground rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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