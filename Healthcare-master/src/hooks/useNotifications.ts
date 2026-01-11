import { useState, useEffect } from 'react';
import { Notification } from '../types';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId,
        type: 'meeting_reminder',
        title: 'Meeting Reminder',
        message: 'Your appointment with Jane Doe starts in 15 minutes',
        read: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        userId,
        type: 'alert',
        title: 'Patient Alert',
        message: 'Critical heart rate reading for Jane Doe: 110 BPM',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        userId,
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from Jane Doe',
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
  };
}