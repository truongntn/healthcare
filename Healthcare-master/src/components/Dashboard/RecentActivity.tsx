import React from 'react';
import { Clock, MessageSquare, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { User } from '../../types';

interface RecentActivityProps {
  user: User | null;
}

interface ActivityItem {
  id: string;
  type: 'message' | 'meeting' | 'observation' | 'alert' | 'triage';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function RecentActivity({ user }: RecentActivityProps) {
  // Mock activity data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Critical Alert',
      description: 'High heart rate detected for Jane Doe (110 BPM)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      description: 'Patient sent a message about medication side effects',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Meeting Completed',
      description: 'Follow-up appointment with Jane Doe finished',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'observation',
      title: 'Health Data',
      description: 'Blood pressure reading: 125/80 mmHg',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'triage',
      title: 'Triage Assessment',
      description: 'Patient completed symptom assessment - Routine care',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'meeting':
        return Calendar;
      case 'observation':
        return Activity;
      case 'alert':
        return AlertTriangle;
      case 'triage':
        return MessageSquare;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string, priority?: string) => {
    if (priority === 'high' || type === 'alert') {
      return { bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-200' };
    }
    if (priority === 'medium') {
      return { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200' };
    }
    
    switch (type) {
      case 'message':
        return { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' };
      case 'meeting':
        return { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' };
      case 'observation':
        return { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' };
      default:
        return { bg: 'bg-gray-100', icon: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colors = getActivityColor(activity.type, activity.priority);
          
          return (
            <div
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${colors.border} hover:shadow-sm transition-shadow`}
            >
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}