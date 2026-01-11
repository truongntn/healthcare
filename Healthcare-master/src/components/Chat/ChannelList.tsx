import React from 'react';
import { Users, User as UserIcon, Clock } from 'lucide-react';
import { ChatChannel, User } from '../../types';

interface ChannelListProps {
  channels: ChatChannel[];
  selectedChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  searchQuery: string;
  user: User | null;
}

export default function ChannelList({ 
  channels, 
  selectedChannelId, 
  onChannelSelect, 
  searchQuery,
  user 
}: ChannelListProps) {
  const filteredChannels = channels.filter(channel =>
    channel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="divide-y divide-gray-200">
      {filteredChannels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onChannelSelect(channel.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
            selectedChannelId === channel.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${
              channel.type === 'group' ? 'bg-purple-100' : 'bg-green-100'
            }`}>
              {channel.type === 'group' ? (
                <Users className={`h-4 w-4 ${
                  channel.type === 'group' ? 'text-purple-600' : 'text-green-600'
                }`} />
              ) : (
                <UserIcon className="h-4 w-4 text-green-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className={`font-medium text-sm truncate ${
                  selectedChannelId === channel.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {channel.name}
                </p>
                <div className="flex items-center space-x-2">
                  {channel.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(channel.lastMessage.createdAt)}
                    </span>
                  )}
                  {channel.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {channel.lastMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {channel.lastMessage.isRedacted ? (
                    <em className="text-gray-400">Message redacted</em>
                  ) : (
                    channel.lastMessage.text
                  )}
                </p>
              )}

              <div className="flex items-center mt-1 space-x-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  channel.type === 'group' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {channel.type === 'group' ? 'Team' : '1:1'}
                </span>
                {channel.participants.length > 2 && (
                  <span className="text-xs text-gray-500">
                    {channel.participants.length} members
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}

      {filteredChannels.length === 0 && searchQuery && (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm">No conversations found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}         