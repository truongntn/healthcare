import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// Create chat channel
router.post('/channels', authenticateToken, async (req, res) => {
  try {
    const { type, participants, meta = {} } = req.body;

    if (!type || !['one-to-one', 'group'].includes(type)) {
      return res.status(400).json({ error: 'Invalid channel type' });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants required' });
    }

    const db = await getDb();
    const channelId = uuidv4();

    await db('chat_channels').insert({
      id: channelId,
      type,
      participants: JSON.stringify(participants),
      meta: JSON.stringify(meta)
    });

    res.status(201).json({ channelId });

  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Get chat channels for user
router.get('/channels', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user.userId;
    
    const db = await getDb();
    
    // Get channels where user is participant
    const channels = await db('chat_channels')
      .whereRaw('JSON_EXTRACT(participants, "$") LIKE ?', [`%${targetUserId}%`])
      .orderBy('updated_at', 'desc');

    // Get last message and unread count for each channel
    const enrichedChannels = await Promise.all(
      channels.map(async (channel) => {
        const lastMessage = await db('messages')
          .where({ channel_id: channel.id })
          .orderBy('created_at', 'desc')
          .first();

        const readRecord = await db('message_reads')
          .where({ 
            user_id: targetUserId, 
            channel_id: channel.id 
          })
          .first();

        let unreadCount = 0;
        if (readRecord && readRecord.last_read_message_id) {
          unreadCount = await db('messages')
            .where({ channel_id: channel.id })
            .where('created_at', '>', 
              await db('messages')
                .where({ id: readRecord.last_read_message_id })
                .select('created_at')
                .first()
                .then(msg => msg?.created_at || '1970-01-01')
            )
            .count('id as count')
            .first()
            .then(result => result.count || 0);
        } else {
          unreadCount = await db('messages')
            .where({ channel_id: channel.id })
            .count('id as count')
            .first()
            .then(result => result.count || 0);
        }

        return {
          ...channel,
          participants: JSON.parse(channel.participants),
          meta: JSON.parse(channel.meta),
          lastMessage,
          unreadCount
        };
      })
    );

    res.json(enrichedChannels);

  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
});

// Send message
router.post('/channels/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { authorId, text, attachments = [], replyToMessageId } = req.body;
    const channelId = req.params.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const db = await getDb();
    const messageId = uuidv4();

    // Verify channel exists and user has access
    const channel = await db('chat_channels').where({ id: channelId }).first();
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const participants = JSON.parse(channel.participants);
    if (!participants.includes(authorId) && !participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const createdAt = new Date().toISOString();

    await db('messages').insert({
      id: messageId,
      channel_id: channelId,
      author_id: authorId,
      text: text.trim(),
      reply_to_message_id: replyToMessageId || null,
      created_at: createdAt
    });

    // Handle attachments (simplified)
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        await db('attachments').insert({
          id: uuidv4(),
          message_id: messageId,
          filename: attachment.filename,
          mime_type: attachment.mime,
          storage_url: `/uploads/${uuidv4()}-${attachment.filename}`, // Simplified
          file_size: attachment.size || 0
        });
      }
    }

    // Update channel timestamp
    await db('chat_channels').where({ id: channelId }).update({
      updated_at: createdAt
    });

    // Broadcast via Socket.io
    req.io.to(channelId).emit('message:new', {
      id: messageId,
      channelId,
      authorId,
      text: text.trim(),
      replyToMessageId,
      createdAt
    });

    res.status(201).json({ messageId, createdAt });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for channel
router.get('/channels/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const channelId = req.params.id;
    const db = await getDb();

    // Verify access
    const channel = await db('chat_channels').where({ id: channelId }).first();
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const participants = JSON.parse(channel.participants);
    if (!participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = db('messages')
      .leftJoin('users', 'messages.author_id', 'users.id')
      .leftJoin('message_reactions', 'messages.id', 'message_reactions.message_id')
      .select(
        'messages.*',
        'users.first_name as author_first_name',
        'users.last_name as author_last_name',
        db.raw('GROUP_CONCAT(message_reactions.reaction) as reactions')
      )
      .where('messages.channel_id', channelId)
      .groupBy('messages.id')
      .orderBy('messages.created_at', 'desc')
      .limit(parseInt(limit));

    if (before) {
      const beforeMessage = await db('messages').where({ id: before }).first();
      if (beforeMessage) {
        query = query.where('messages.created_at', '<', beforeMessage.created_at);
      }
    }

    const messages = await query;

    const formattedMessages = messages.map(msg => ({
      ...msg,
      author_name: `${msg.author_first_name} ${msg.author_last_name}`,
      reactions: msg.reactions ? msg.reactions.split(',').reduce((acc, reaction) => {
        acc[reaction] = (acc[reaction] || 0) + 1;
        return acc;
      }, {}) : {}
    }));

    res.json(formattedMessages.reverse()); // Return in chronological order

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Edit message
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { editorId, newText } = req.body;
    const messageId = req.params.messageId;

    if (!newText || newText.trim().length === 0) {
      return res.status(400).json({ error: 'New text required' });
    }

    const db = await getDb();
    const message = await db('messages').where({ id: messageId }).first();
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only author or admin can edit
    if (message.author_id !== editorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Store edit history
    await db('message_edits').insert({
      id: uuidv4(),
      message_id: messageId,
      editor_id: editorId,
      previous_text: message.text,
      edited_at: new Date().toISOString()
    });

    // Update message
    const editedAt = new Date().toISOString();
    await db('messages').where({ id: messageId }).update({
      text: newText.trim(),
      edited: true,
      updated_at: editedAt
    });

    // Broadcast edit
    req.io.to(message.channel_id).emit('message:edited', {
      messageId,
      newText: newText.trim(),
      editedAt
    });

    res.json({ messageId, editedAt });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete/redact message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { requestedById, redact = true } = req.body;
    const messageId = req.params.messageId;

    const db = await getDb();
    const message = await db('messages').where({ id: messageId }).first();
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only author or admin can delete
    if (message.author_id !== requestedById && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (redact) {
      // Redact content but keep record
      await db('messages').where({ id: messageId }).update({
        text: '[Message redacted]',
        redacted: true,
        updated_at: new Date().toISOString()
      });
    } else {
      // Soft delete (mark as deleted but keep in DB for audit)
      await db('messages').where({ id: messageId }).update({
        text: '[Message deleted]',
        redacted: true,
        updated_at: new Date().toISOString()
      });
    }

    // Broadcast deletion
    req.io.to(message.channel_id).emit('message:deleted', {
      messageId,
      redacted: redact
    });

    res.json({ ok: true });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// React to message
router.post('/:messageId/react', authenticateToken, async (req, res) => {
  try {
    const { userId, reaction } = req.body;
    const messageId = req.params.messageId;

    if (!reaction || reaction.trim().length === 0) {
      return res.status(400).json({ error: 'Reaction required' });
    }

    const db = await getDb();
    
    // Check if reaction already exists
    const existingReaction = await db('message_reactions')
      .where({ message_id: messageId, user_id: userId, reaction })
      .first();

    if (existingReaction) {
      // Remove reaction if it exists
      await db('message_reactions')
        .where({ message_id: messageId, user_id: userId, reaction })
        .del();
    } else {
      // Add new reaction
      await db('message_reactions').insert({
        id: uuidv4(),
        message_id: messageId,
        user_id: userId,
        reaction: reaction.trim()
      });
    }

    // Get updated reaction totals
    const reactions = await db('message_reactions')
      .where({ message_id: messageId })
      .select('reaction')
      .count('* as count')
      .groupBy('reaction');

    const totals = reactions.reduce((acc, r) => {
      acc[r.reaction] = r.count;
      return acc;
    }, {});

    // Get message for channel broadcasting
    const message = await db('messages').where({ id: messageId }).first();
    
    // Broadcast reaction update
    req.io.to(message.channel_id).emit('message:reaction', {
      messageId,
      totals
    });

    res.json({ 
      reactionId: existingReaction ? null : uuidv4(),
      totals 
    });

  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({ error: 'Failed to react to message' });
  }
});

// Mark messages as read
router.post('/channels/:id/read', authenticateToken, async (req, res) => {
  try {
    const { userId, uptoMessageId } = req.body;
    const channelId = req.params.id;

    const db = await getDb();
    
    // Update or insert read receipt
    await db('message_reads')
      .insert({
        id: uuidv4(),
        user_id: userId,
        channel_id: channelId,
        last_read_message_id: uptoMessageId,
        read_at: new Date().toISOString()
      })
      .onConflict(['user_id', 'channel_id'])
      .merge({
        last_read_message_id: uptoMessageId,
        read_at: new Date().toISOString()
      });

    // Broadcast read receipt
    req.io.to(channelId).emit('presence:read', {
      userId,
      channelId,
      uptoMessageId
    });

    res.json({ ok: true });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Set typing indicator
router.post('/channels/:id/typing', authenticateToken, async (req, res) => {
  try {
    const { userId, typing } = req.body;
    const channelId = req.params.id;

    // Broadcast typing indicator
    req.io.to(channelId).emit('presence:typing', {
      userId,
      channelId,
      typing
    });

    res.json({ ok: true });

  } catch (error) {
    console.error('Typing indicator error:', error);
    res.status(500).json({ error: 'Failed to set typing indicator' });
  }
});

// Summarize conversation
router.post('/channels/:id/summarize', authenticateToken, async (req, res) => {
  try {
    const { from, to } = req.body;
    const channelId = req.params.id;
    const db = await getDb();

    // Verify access
    const channel = await db('chat_channels').where({ id: channelId }).first();
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const participants = JSON.parse(channel.participants);
    if (!participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages in date range
    let query = db('messages')
      .leftJoin('users', 'messages.author_id', 'users.id')
      .select(
        'messages.*',
        'users.first_name as author_first_name',
        'users.last_name as author_last_name'
      )
      .where('messages.channel_id', channelId)
      .orderBy('messages.created_at', 'asc');

    if (from) {
      query = query.where('messages.created_at', '>=', from);
    }
    if (to) {
      query = query.where('messages.created_at', '<=', to);
    }

    const messages = await query;
    
    if (messages.length === 0) {
      return res.json({
        summary: 'No messages found in specified range',
        actionItems: [],
        confidence: 1.0,
        provenance: ['No messages to analyze']
      });
    }

    const formattedMessages = messages.map(msg => ({
      author_name: `${msg.author_first_name} ${msg.author_last_name}`,
      author_id: msg.author_id,
      text: msg.text,
      created_at: msg.created_at
    }));

    const summary = await aiService.summarizeChat(formattedMessages, { channelType: channel.type });

    res.json(summary);

  } catch (error) {
    console.error('Chat summarize error:', error);
    res.status(500).json({ error: 'Failed to summarize conversation' });
  }
});

export default router;