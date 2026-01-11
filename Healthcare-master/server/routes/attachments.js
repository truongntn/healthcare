import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types (extend as needed)
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload attachment
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { messageId, meetingId } = req.body;

    if (!messageId && !meetingId) {
      return res.status(400).json({ error: 'messageId or meetingId required' });
    }

    const db = await getDb();
    const attachmentId = uuidv4();
    const storageUrl = `/uploads/${req.file.filename}`;

    await db('attachments').insert({
      id: attachmentId,
      message_id: messageId || null,
      meeting_id: meetingId || null,
      filename: req.file.originalname,
      mime_type: req.file.mimetype,
      storage_url: storageUrl,
      file_size: req.file.size
    });

    res.status(201).json({
      attachmentId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageUrl
    });

  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

// Get attachment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const db = await getDb();

    const attachment = await db('attachments')
      .where({ id: attachmentId })
      .first();

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // TODO: Add access control based on message/meeting permissions
    
    const filePath = join(__dirname, '../..', attachment.storage_url);
    
    try {
      await fs.access(filePath);
      res.set({
        'Content-Type': attachment.mime_type,
        'Content-Disposition': `attachment; filename="${attachment.filename}"`
      });
      res.sendFile(filePath);
    } catch (fileError) {
      console.error('File not found:', filePath);
      res.status(404).json({ error: 'File not found on disk' });
    }

  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({ error: 'Failed to get attachment' });
  }
});

// Delete attachment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const db = await getDb();

    const attachment = await db('attachments')
      .where({ id: attachmentId })
      .first();

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // TODO: Add access control (only uploader or admin can delete)

    // Delete file from disk
    const filePath = join(__dirname, '../..', attachment.storage_url);
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('File deletion error:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db('attachments').where({ id: attachmentId }).del();

    res.json({ ok: true });

  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// List attachments for message or meeting
router.get('/list/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'message' or 'meeting'
    
    if (!['message', 'meeting'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const db = await getDb();
    const column = type === 'message' ? 'message_id' : 'meeting_id';
    
    const attachments = await db('attachments')
      .where({ [column]: id })
      .orderBy('created_at', 'desc');

    res.json(attachments);

  } catch (error) {
    console.error('List attachments error:', error);
    res.status(500).json({ error: 'Failed to list attachments' });
  }
});

export default router;