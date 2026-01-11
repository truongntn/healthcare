import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
}

export default function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 text-gray-700 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">Someone is typing</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}