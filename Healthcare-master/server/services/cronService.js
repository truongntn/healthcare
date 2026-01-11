import cron from 'node-cron';
import { getDb } from '../database/connection.js';

export function setupCron() {
  // Check for due reminders every minute (simplified for demo)
  cron.schedule('* * * * *', async () => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();

      // Find notifications that should trigger reminders
      const dueReminders = await db('notifications')
        .where('type', 'meeting_reminder')
        .where('read', false)
        .whereRaw("JSON_EXTRACT(payload, '$.scheduledFor') <= ?", [now]);

      for (const reminder of dueReminders) {
        const payload = JSON.parse(reminder.payload);
        
        // In production, this would trigger actual email/SMS notifications
        console.log(`⏰ Reminder due for user ${reminder.user_id}: Meeting ${payload.meetingId}`);
        
        // Mark as processed by marking read
        await db('notifications')
          .where({ id: reminder.id })
          .update({ read: true });
      }

    } catch (error) {
      console.error('Cron reminder error:', error);
    }
  });

  console.log('📅 Cron jobs scheduled');
}