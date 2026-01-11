import express from 'express';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user.userId;
    
    const { limit = 50, read } = req.query;
    
    const db = await getDb();
    let query = db('notifications')
      .where({ user_id: targetUserId })
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit));

    if (read !== undefined) {
      query = query.where({ read: read === 'true' });
    }

    const notifications = await query;

    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      payload: JSON.parse(notification.payload || '{}')
    }));

    res.json(formattedNotifications);

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Acknowledge notification
router.post('/:id/ack', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { userId } = req.body;

    const db = await getDb();
    
    // Verify notification belongs to user
    const notification = await db('notifications')
      .where({ id: notificationId })
      .first();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const targetUserId = userId || req.user.userId;
    if (notification.user_id !== targetUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark as read
    await db('notifications')
      .where({ id: notificationId })
      .update({ read: true });

    res.json({ ok: true });

  } catch (error) {
    console.error('Acknowledge notification error:', error);
    res.status(500).json({ error: 'Failed to acknowledge notification' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || req.user.userId;

    const db = await getDb();
    
    await db('notifications')
      .where({ user_id: targetUserId, read: false })
      .update({ read: true });

    res.json({ ok: true });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Get notification counts
router.get('/counts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user.userId;

    const db = await getDb();
    
    const counts = await db('notifications')
      .where({ user_id: targetUserId })
      .select('read', 'type')
      .count('* as count')
      .groupBy('read', 'type');

    const summary = {
      total: 0,
      unread: 0,
      byType: {}
    };

    counts.forEach(item => {
      summary.total += item.count;
      if (!item.read) {
        summary.unread += item.count;
      }
      
      if (!summary.byType[item.type]) {
        summary.byType[item.type] = { total: 0, unread: 0 };
      }
      
      summary.byType[item.type].total += item.count;
      if (!item.read) {
        summary.byType[item.type].unread += item.count;
      }
    });

    res.json(summary);

  } catch (error) {
    console.error('Get notification counts error:', error);
    res.status(500).json({ error: 'Failed to get notification counts' });
  }
});

export default router;