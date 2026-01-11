import React, { useState } from 'react';
import { Send, Bot, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { User as UserType, TriageResponse, AIDecision } from '../../types';

interface TriageProps {
  user: UserType | null;
  onAIDecision: (decision: AIDecision) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  triageData?: TriageResponse;
}

export default function Triage({ user, onAIDecision }: TriageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to IntelliHealth AI Triage. Please describe your symptoms or health concerns.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI triage response
    setTimeout(() => {
      const mockTriage: TriageResponse = {
        disposition: 'routine',
        text: 'Based on your symptoms, this appears to be a routine matter that can be addressed with scheduled care.',
        explanation: 'The symptoms you described are common and typically not urgent. However, monitoring is recommended.',
        recommendations: [
          'Schedule a routine appointment with your primary care provider',
          'Monitor symptoms for any changes',
          'Stay hydrated and get adequate rest',
        ],
        confidence: 0.85,
        provenance: [
          'Clinical symptom database',
          'Evidence-based triage protocols',
          'Patient history analysis',
        ],
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: mockTriage.text,
        timestamp: new Date().toISOString(),
        triageData: mockTriage,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Trigger AI decision modal
      const decision: AIDecision = {
        id: aiMessage.id,
        type: 'triage',
        content: mockTriage,
        timestamp: aiMessage.timestamp,
      };

      setTimeout(() => onAIDecision(decision), 1000);
    }, 2000);
  };

  const getDispositionStyle = (disposition: string) => {
    switch (disposition) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'self-care':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDispositionIcon = (disposition: string) => {
    switch (disposition) {
      case 'emergency':
        return AlertCircle;
      case 'urgent':
        return Clock;
      case 'routine':
        return CheckCircle;
      case 'self-care':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Triage Assistant</h1>
        <p className="text-gray-600">
          Describe your symptoms for an AI-powered health assessment
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This is an AI assistant for informational purposes only. 
              In case of emergency, call 911 immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'ai'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                  {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    
                    {message.triageData && (
                      <div className="mt-3 space-y-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDispositionStyle(message.triageData.disposition)}`}>
                          {React.createElement(getDispositionIcon(message.triageData.disposition), {
                            className: 'h-3 w-3 mr-1',
                          })}
                          {message.triageData.disposition.toUpperCase()}
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          Confidence: {Math.round(message.triageData.confidence * 100)}%
                        </div>
                        
                        {message.triageData.recommendations.length > 0 && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <h4 className="text-xs font-medium text-gray-900 mb-2">Recommendations:</h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                              {message.triageData.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}