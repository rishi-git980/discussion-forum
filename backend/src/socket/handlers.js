export const setupSocketHandlers = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (userId) => {
      connectedUsers.set(socket.id, userId);
      socket.join(`user:${userId}`);
      io.emit('userOnline', userId);
    });

    // Handle new post
    socket.on('newPost', (post) => {
      io.emit('postCreated', post);
    });

    // Handle new comment
    socket.on('newComment', ({ postId, comment }) => {
      io.emit('commentAdded', { postId, comment });
    });

    // Handle post like
    socket.on('likePost', ({ postId, userId }) => {
      io.emit('postLiked', { postId, userId });
    });

    // Handle follow updates
    socket.on('followUpdate', ({ followerId, followingId, action }) => {
      io.emit('followUpdate', { followerId, followingId, action });
      
      // Emit to specific user's room
      io.to(`user:${followingId}`).emit('followerUpdate', {
        followerId,
        action
      });
    });

    // Handle user typing
    socket.on('typing', ({ postId, user }) => {
      socket.broadcast.emit('userTyping', { postId, user });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        io.emit('userOffline', userId);
        connectedUsers.delete(socket.id);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
}; 