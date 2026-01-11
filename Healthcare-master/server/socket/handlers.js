export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join chat channels
    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });

    // Leave chat channels
    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
      console.log(`Socket ${socket.id} left channel ${channelId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.channelId).emit('user_typing', {
        userId: data.userId,
        channelId: data.channelId,
        typing: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.channelId).emit('user_typing', {
        userId: data.userId,
        channelId: data.channelId,
        typing: false
      });
    });

    // Handle presence updates
    socket.on('user_online', (userId) => {
      socket.broadcast.emit('presence_update', {
        userId,
        status: 'online'
      });
    });

    // Handle meeting join
    socket.on('join_meeting', (meetingId) => {
      socket.join(`meeting_${meetingId}`);
      console.log(`Socket ${socket.id} joined meeting ${meetingId}`);
    });

    socket.on('leave_meeting', (meetingId) => {
      socket.leave(`meeting_${meetingId}`);
      console.log(`Socket ${socket.id} left meeting ${meetingId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}