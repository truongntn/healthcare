import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Edit3, Trash2, Reply, FileText } from 'lucide-react';
import { ChatChannel, User, Message, AIDecision } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessagePaneProps {
  channelId: string;
  channel: ChatChannel | null;
  user: User | null;
  onAIDecision: (decision: AIDecision) => void;
}

export default function MessagePane({ channelId, channel, user, onAIDecision }: MessagePaneProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      channelId,
      authorId: 'doc1',
      text: 'Hi Jane, I hope you\'re doing well today. I wanted to follow up on how you\'re feeling after our last appointment.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isEdited: false,
      isRedacted: false,
    },
    {
      id: 'msg2',
      channelId,
      authorId: 'pat1',
      text: 'Hello Dr. Johnson! I\'ve been feeling much better since we adjusted my medication. The side effects have really decreased.',
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isEdited: false,
      isRedacted: false,
      reactions: [
        { id: 'r1', messageId: 'msg2', userId: 'doc1', reaction: '👍', createdAt: new Date().toISOString() },
      ],
    },
    {
      id: 'msg3',
      channelId,
      authorId: 'pat1',
      text: 'Thank you for the medication adjustment. I\'m feeling much better! Should I continue with the same dosage?',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isEdited: true,
      isRedacted: false,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      authorId: user.id,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      isEdited: false,
      isRedacted: false,
      replyToMessageId: replyToMessage?.id,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setReplyToMessage(null);
    setIsTyping(false);

    // Simulate real-time response for demo
    if (user.role === 'patient') {
      setTimeout(() => {
        const responseMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          channelId,
          authorId: 'doc1',
          text: 'Thanks for the update! I\'m glad to hear you\'re feeling better. Please continue with the current dosage and let me know if you experience any changes.',
          createdAt: new Date().toISOString(),
          isEdited: false,
          isRedacted: false,
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: newText, isEdited: true, updatedAt: new Date().toISOString() }
        : msg
    ));
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId: string, redact: boolean = false) => {
    if (redact) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: '[Message redacted by user]', isRedacted: true, updatedAt: new Date().toISOString() }
          : msg
      ));
    } else {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.userId === user?.id);
        if (existingReaction) {
          // Remove existing reaction
          return {
            ...msg,
            reactions: msg.reactions?.filter(r => r.userId !== user?.id) || []
          };
        } else {
          // Add new reaction
          const newReaction = {
            id: `r-${Date.now()}`,
            messageId,
            userId: user?.id || '',
            reaction,
            createdAt: new Date().toISOString(),
          };
          return {
            ...msg,
            reactions: [...(msg.reactions || []), newReaction]
          };
        }
      }
      return msg;
    }));
  };

  const handleSummarizeConversation = async () => {
    // Simulate AI conversation summary
    const mockSummary = {
      text: 'Conversation summary: Patient reports significant improvement in symptoms after medication adjustment. Side effects have decreased substantially. Patient inquiring about continuing current dosage. Doctor recommends maintaining current treatment plan.',
      actionItems: [
        'Continue current medication dosage',
        'Monitor for any changes in symptoms',
        'Schedule follow-up in 2 weeks',
      ],
      confidence: 0.92,
      provenance: [
        'Message thread analysis',
        'Clinical context extraction',
        'Treatment plan identification',
      ],
    };

    const decision: AIDecision = {
      id: `summary-${Date.now()}`,
      type: 'chat_summary',
      content: mockSummary,
      timestamp: new Date().toISOString(),
    };

    onAIDecision(decision);
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
            <p className="text-sm text-gray-600">
              {channel.type === 'group' ? `${channel.participants.length} members` : 'Direct message'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSummarizeConversation}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Summarize conversation"
            >
              <FileText className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.authorId === user?.id;
          const showAvatar = index === 0 || messages[index - 1].authorId !== message.authorId;
          
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={isOwnMessage}
              showAvatar={showAvatar}
              user={user}
              onReply={setReplyToMessage}
              onEdit={(msg) => {
                setEditingMessage(msg.id);
                setEditText(msg.text);
              }}
              onDelete={handleDeleteMessage}
              onReaction={handleReaction}
              isEditing={editingMessage === message.id}
              editText={editText}
              onEditTextChange={setEditText}
              onEditSave={(newText) => handleEditMessage(message.id, newText)}
              onEditCancel={() => {
                setEditingMessage(null);
                setEditText('');
              }}
            />
          );
        })}
        <TypingIndicator isTyping={isTyping} />
        <div ref={messagesEndRef} />
      </div>

      {replyToMessage && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Replying to: {replyToMessage.text.substring(0, 50)}...
              </span>
            </div>
            <button
              onClick={() => setReplyToMessage(null)}
              className="text-blue-600 hover:text-blue-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log('File selected:', file.name);
                // Handle file attachment
              }
            }}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>

          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}