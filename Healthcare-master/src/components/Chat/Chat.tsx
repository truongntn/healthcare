import React, { useState } from 'react';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { User, ChatChannel, AIDecision } from '../../types';
import ChannelList from './ChannelList';
import MessagePane from './MessagePane';

interface ChatProps {
  user: User | null;
  onAIDecision: (decision: AIDecision) => void;
}

export default function Chat({ user, onAIDecision }: ChatProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>('channel1');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock channels data
  const channels: ChatChannel[] = [
    {
      id: 'channel1',
      type: 'one-to-one',
      participants: ['doc1', 'pat1'],
      name: user?.role === 'clinician' ? 'Jane Doe' : 'Dr. Sarah Johnson',
      unreadCount: 2,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      lastMessage: {
        id: 'msg3',
        channelId: 'channel1',
        authorId: 'pat1',
        text: 'Thank you for the medication adjustment. I\'m feeling much better!',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: undefined,
        isEdited: false,
        isRedacted: false,
      },
    },
    {
      id: 'channel2',
      type: 'group',
      participants: ['doc1', 'nurse1', 'admin1'],
      name: 'Clinical Team',
      unreadCount: 0,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      lastMessage: {
        id: 'msg6',
        channelId: 'channel2',
        authorId: 'nurse1',
        text: 'Patient discharge ready for review',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: undefined,
        isEdited: false,
        isRedacted: false,
      },
    },
  ];

  const handleCreateChannel = () => {
    // Simulate channel creation
    console.log('Creating new channel...');
  };

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm border border-gray-200 flex">
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={handleCreateChannel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChannelList
            channels={channels}
            selectedChannelId={selectedChannel}
            onChannelSelect={setSelectedChannel}
            searchQuery={searchQuery}
            user={user}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <MessagePane
            channelId={selectedChannel}
            channel={channels.find(c => c.id === selectedChannel) || null}
            user={user}
            onAIDecision={onAIDecision}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}