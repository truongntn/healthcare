import React from 'react';
import { X, Bell, Calendar, MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationsProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

export default function Notifications({ notifications, onClose, onMarkAsRead }: NotificationsProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting_reminder':
        return Calendar;
      case 'message':
        return MessageSquare;
      case 'alert':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'meeting_reminder':
        return 'text-blue-600 bg-blue-100';
      case 'message':
        return 'text-green-600 bg-green-100';
      case 'alert':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg border-l border-gray-200 z-40 transform transition-transform">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {notifications.filter(n => !n.read).length} unread notifications
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Bell className="h-12 w-12 mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-2"></div>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        !notification.read ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(notification.createdAt)}</span>
                      </div>
                      
                      {notification.actionUrl && (
                        <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Take Action →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notifications.some(n => !n.read) && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.read) onMarkAsRead(n.id);
              });
            }}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark All as Read</span>
          </button>
        </div>
      )}
    </div>
  );
}