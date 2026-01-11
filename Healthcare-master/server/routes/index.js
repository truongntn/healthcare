import authRoutes from './auth.js';
import triageRoutes from './triage.js';
import meetingRoutes from './meetings.js';
import chatRoutes from './chat.js';
import rpmRoutes from './rpm.js';
import notificationRoutes from './notifications.js';
import aiRoutes from './ai.js';
import attachmentRoutes from './attachments.js';

export function setupRoutes(app) {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      warning: 'PROTOTYPE ONLY - DO NOT USE WITH REAL PHI'
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/triage', triageRoutes);
  app.use('/api/meetings', meetingRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/messages', chatRoutes); // Message-specific endpoints
  app.use('/api/rpm', rpmRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/attachments', attachmentRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Endpoint not found',
      path: req.originalUrl 
    });
  });
}