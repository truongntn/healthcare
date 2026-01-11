import { expect } from '@jest/globals';

describe('Message Operations', () => {
  const mockMessage = {
    id: 'msg-123',
    channelId: 'channel-456',
    authorId: 'user-789',
    text: 'Original message text',
    edited: false,
    redacted: false,
    createdAt: '2025-01-01T10:00:00Z'
  };

  describe('Message Editing', () => {
    test('should allow author to edit message', () => {
      const canEdit = (message, editorId) => {
        return message.authorId === editorId;
      };

      expect(canEdit(mockMessage, 'user-789')).toBe(true);
      expect(canEdit(mockMessage, 'user-456')).toBe(false);
    });

    test('should preserve edit history', () => {
      const editHistory = [];
      
      const editMessage = (message, newText, editorId) => {
        editHistory.push({
          messageId: message.id,
          editorId,
          previousText: message.text,
          editedAt: new Date().toISOString()
        });
        
        return {
          ...message,
          text: newText,
          edited: true
        };
      };

      const edited = editMessage(mockMessage, 'Updated message text', 'user-789');
      
      expect(edited.text).toBe('Updated message text');
      expect(edited.edited).toBe(true);
      expect(editHistory).toHaveLength(1);
      expect(editHistory[0].previousText).toBe('Original message text');
    });
  });

  describe('Message Deletion/Redaction', () => {
    test('should support redaction vs deletion', () => {
      const redactMessage = (message) => ({
        ...message,
        text: '[Message redacted]',
        redacted: true
      });

      const deleteMessage = (message) => ({
        ...message,
        text: '[Message deleted]',
        redacted: true
      });

      const redacted = redactMessage(mockMessage);
      const deleted = deleteMessage(mockMessage);

      expect(redacted.text).toBe('[Message redacted]');
      expect(deleted.text).toBe('[Message deleted]');
      expect(redacted.redacted).toBe(true);
      expect(deleted.redacted).toBe(true);
    });
  });

  describe('Message Reactions', () => {
    test('should aggregate reaction totals', () => {
      const reactions = [
        { messageId: 'msg-123', userId: 'user-1', reaction: '👍' },
        { messageId: 'msg-123', userId: 'user-2', reaction: '👍' },
        { messageId: 'msg-123', userId: 'user-3', reaction: '❤️' }
      ];

      const aggregateReactions = (messageReactions) => {
        return messageReactions.reduce((totals, r) => {
          totals[r.reaction] = (totals[r.reaction] || 0) + 1;
          return totals;
        }, {});
      };

      const totals = aggregateReactions(reactions);
      
      expect(totals['👍']).toBe(2);
      expect(totals['❤️']).toBe(1);
    });

    test('should toggle reactions', () => {
      const existingReactions = [
        { messageId: 'msg-123', userId: 'user-1', reaction: '👍' }
      ];

      const toggleReaction = (reactions, messageId, userId, reaction) => {
        const existing = reactions.find(r => 
          r.messageId === messageId && 
          r.userId === userId && 
          r.reaction === reaction
        );

        if (existing) {
          return reactions.filter(r => r !== existing);
        } else {
          return [...reactions, { messageId, userId, reaction }];
        }
      };

      // Add new reaction
      let updated = toggleReaction(existingReactions, 'msg-123', 'user-2', '👍');
      expect(updated).toHaveLength(2);

      // Remove existing reaction  
      updated = toggleReaction(updated, 'msg-123', 'user-1', '👍');
      expect(updated).toHaveLength(1);
      expect(updated[0].userId).toBe('user-2');
    });
  });
});