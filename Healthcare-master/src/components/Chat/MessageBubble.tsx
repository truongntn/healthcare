import React, { useState } from 'react';
import { MoreVertical, Edit3, Trash2, Reply, Check, X } from 'lucide-react';
import { Message, User } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
  user: User | null;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string, redact?: boolean) => void;
  onReaction: (messageId: string, reaction: string) => void;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onEditSave: (text: string) => void;
  onEditCancel: () => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  user,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  isEditing,
  editText,
  onEditTextChange,
  onEditSave,
  onEditCancel,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getAuthorName = (authorId: string) => {
    if (authorId === 'doc1') return 'Dr. Johnson';
    if (authorId === 'pat1') return 'Jane Doe';
    return 'User';
  };

  const reactions = ['👍', '❤️', '😊', '👏', '🎉'];
  const reactionCounts = message.reactions?.reduce((acc, reaction) => {
    acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isEditing) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={onEditCancel}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEditSave(editText)}
                disabled={!editText.trim()}
                className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
      <div className="max-w-xs lg:max-w-md">
        {!isOwnMessage && showAvatar && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getAuthorName(message.authorId)[0]}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {getAuthorName(message.authorId)}
            </span>
          </div>
        )}

        <div
          className={`relative px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {message.isRedacted ? (
            <em className="text-gray-400 italic">Message redacted</em>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          )}

          {showActions && !message.isRedacted && (
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0' : 'right-0'} transform ${isOwnMessage ? '-translate-x-full' : 'translate-x-full'} flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-sm px-2 py-1`}>
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 text-gray-500 hover:text-gray-700 text-xs"
              >
                😊
              </button>
              <button
                onClick={() => onReply(message)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Reply"
              >
                <Reply className="h-3 w-3" />
              </button>
              {isOwnMessage && (
                <>
                  <button
                    onClick={() => onEdit(message)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Edit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(message.id, user?.role === 'clinician')}
                    className="p-1 text-gray-500 hover:text-red-600"
                    title={user?.role === 'clinician' ? 'Redact' : 'Delete'}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          )}

          {showReactions && (
            <div className={`absolute top-full mt-1 ${isOwnMessage ? 'right-0' : 'left-0'} bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1 flex space-x-1 z-10`}>
              {reactions.map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => {
                    onReaction(message.id, reaction);
                    setShowReactions(false);
                  }}
                  className="hover:bg-gray-100 rounded p-1 text-lg"
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}
        </div>

        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            {Object.entries(reactionCounts).map(([reaction, count]) => (
              <button
                key={reaction}
                onClick={() => onReaction(message.id, reaction)}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1 hover:bg-gray-200 transition-colors"
              >
                <span>{reaction}</span>
                <span>{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTimestamp(message.createdAt)}</span>
          {message.isEdited && <span>(edited)</span>}
        </div>
      </div>
    </div>
  );
}