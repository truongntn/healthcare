export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large',
      maxSize: '10MB'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file field'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ error: 'Database constraint violation' });
  }

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err.details.map(d => d.message)
    });
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}