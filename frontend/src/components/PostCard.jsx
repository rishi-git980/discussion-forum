import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThumbsUp, 
  faThumbsDown, 
  faHeart,
  faComment,
  faTrash,
  faUserPlus,
  faUserMinus
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, getAvatarStyles } from '../utils/avatar';

const PostCard = ({ post, handleVote, handleLike, onDelete }) => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);

  // Listen for follow updates
  useEffect(() => {
    if (socket && post.userId) {
      const handleFollowUpdate = (data) => {
        if (data.followingId === post.userId._id) {
          setIsFollowing(data.action === 'follow');
        }
      };

      socket.on('followUpdate', handleFollowUpdate);

      return () => {
        socket.off('followUpdate', handleFollowUpdate);
      };
    }
  }, [socket, post.userId]);

  // Initialize follow status when component mounts
  useEffect(() => {
    if (user && post.userId && user._id !== post.userId._id) {
      fetch(`${API_URL}/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            setIsFollowing(data.data.following.includes(post.userId._id));
          }
        })
        .catch(error => {
          console.error('Error checking follow status:', error);
          setError('Failed to check follow status');
        });
    }
  }, [user, post.userId, API_URL, token]);

  if (!post || !post._id) {
    console.error('Invalid post data:', post);
    return null;
  }

  // Check if the current user can delete the post
  const canDelete = user && (
    // User is the post author
    (post.userId && user._id === post.userId._id) ||
    // User is an admin
    user.isAdmin === true
  );

  const handlePostVote = (voteType) => {
    if (!post._id) {
      console.error('Cannot vote: No post ID');
      return;
    }
    // Convert vote type to match backend expectation
    const backendVoteType = voteType === 'upvote' ? 'up' : 'down';
    handleVote(post._id, backendVoteType);
  };

  const handlePostLike = () => {
    if (!post._id) {
      console.error('Cannot like: No post ID');
      return;
    }
    handleLike(post._id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onDelete(post._id);
        // After successful deletion, navigate to home page
        window.location.href = '/';
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleFollow = async () => {
    if (!user || !post.userId || !token) return;

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${API_URL}/users/${post.userId._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update follow status');
      }

      setIsFollowing(!isFollowing);

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('followUpdate', {
          followerId: user._id,
          followingId: post.userId._id,
          action: endpoint
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      setError(error.message || 'Failed to update follow status');
    }
  };

  // Format date safely with date-fns
  const formatCreatedAt = (dateString) => {
    try {
      if (!dateString) return 'No date';
      const date = new Date(dateString);
      if (!(date instanceof Date) || isNaN(date)) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Get category name safely
  const getCategoryName = () => {
    if (!post.categoryId) return 'Uncategorized';
    return typeof post.categoryId === 'object' && post.categoryId.name ? post.categoryId.name : 'Uncategorized';
  };

  // Get category ID safely
  const getCategoryId = () => {
    if (!post.categoryId) return null;
    return typeof post.categoryId === 'object' ? post.categoryId._id : post.categoryId;
  };

  // Get username safely
  const getUsername = () => {
    if (!post.userId) return 'Unknown User';
    return typeof post.userId === 'object' ? post.userId.username : 'Unknown User';
  };

  // Get user ID safely
  const getUserId = () => {
    if (!post.userId) return null;
    return typeof post.userId === 'object' ? post.userId._id : post.userId;
  };

  // Get avatar URL safely
  const getPostAvatarUrl = () => {
    if (!post.userId) return getAvatarUrl('unknown');
    return getAvatarUrl(post.userId);
  };

  return (
    <Card className="post-card mb-4 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <Link to={`/profile/${getUserId()}`} className="text-decoration-none">
              <img
                src={getPostAvatarUrl()}
                alt={getUsername()}
                className="rounded-circle me-2"
                style={getAvatarStyles()}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getAvatarUrl(getUsername());
                }}
              />
            </Link>
            <div>
              <Link to={`/profile/${getUserId()}`} className="text-decoration-none">
                <span className="fw-bold text-primary">{getUsername()}</span>
              </Link>
              <div className="text-muted small">
                {formatCreatedAt(post.createdAt)}
              </div>
            </div>
          </div>
          {user && post.userId && user._id !== post.userId._id && (
            <Button
              variant={isFollowing ? "outline-secondary" : "outline-primary"}
              size="sm"
              onClick={handleFollow}
              disabled={!token}
            >
              <FontAwesomeIcon 
                icon={isFollowing ? faUserMinus : faUserPlus} 
                className="me-1"
              />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
        {error && (
          <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="w-100">
            <h5 className="mb-1">
              <Link 
                to={`/post/${post._id}`} 
                className="text-decoration-none"
                onClick={() => {
                  console.log('Navigating to post:', {
                    postId: post._id,
                    postTitle: post.title,
                    url: `/post/${post._id}`
                  });
                }}
              >
                {post.title}
              </Link>
            </h5>
          </div>
          {canDelete && (
            <Button 
              variant="link" 
              className="text-danger p-0" 
              onClick={handleDelete}
              title="Delete post"
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
        <Card.Text style={{ 
          userSelect: 'none',
          cursor: 'default',
          pointerEvents: 'none'
        }}>{post.content}</Card.Text>
        
        {post.media && post.media.length > 0 && (
          <Row className="mt-3">
            {post.media.map((media, index) => {
              // Ensure proper URL construction
              const mediaUrl = media.url.startsWith('http') 
                ? media.url 
                : `${API_URL.replace('/api', '')}${media.url}`;
              
              const thumbnailUrl = media.thumbnail
                ? `${API_URL.replace('/api', '')}${media.thumbnail}`
                : undefined;
              
              return (
                <Col key={index} xs={6} md={4} className="mb-3">
                  <div className="media-container" style={{ position: 'relative', paddingBottom: '75%', height: 0 }}>
                    {media.type === 'image' ? (
                      <img
                        src={mediaUrl}
                        alt={`Post media ${index + 1}`}
                        className="img-fluid rounded"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.error('Error loading image:', mediaUrl);
                          e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        className="img-fluid rounded"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        controls
                        poster={thumbnailUrl}
                        onError={(e) => {
                          console.error('Error loading video:', mediaUrl);
                        }}
                      />
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faThumbsUp} 
                className="interaction-icon me-1"
                onClick={() => handlePostVote('upvote')}
                style={{ 
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: post.upvotes?.includes(user?._id) ? '#1a73e8' : '#6c757d',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#1a73e8'}
                onMouseLeave={(e) => e.target.style.color = post.upvotes?.includes(user?._id) ? '#1a73e8' : '#6c757d'}
              />
              <span className="text-muted ms-1">{post.upvotes?.length || 0}</span>
            </div>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faThumbsDown} 
                className="interaction-icon me-1"
                onClick={() => handlePostVote('downvote')}
                style={{ 
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: post.downvotes?.includes(user?._id) ? '#9c27b0' : '#6c757d',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#9c27b0'}
                onMouseLeave={(e) => e.target.style.color = post.downvotes?.includes(user?._id) ? '#9c27b0' : '#6c757d'}
              />
              <span className="text-muted ms-1">{post.downvotes?.length || 0}</span>
            </div>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faHeart} 
                className="interaction-icon me-1"
                onClick={handlePostLike}
                style={{ 
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: post.likes?.includes(user?._id) ? '#ff4b4b' : '#6c757d',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ff4b4b'}
                onMouseLeave={(e) => e.target.style.color = post.likes?.includes(user?._id) ? '#ff4b4b' : '#6c757d'}
              />
              <span className="text-muted ms-1">{post.likes?.length || 0}</span>
            </div>
            <Link to={`/post/${post._id}`} className="text-decoration-none d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faComment} 
                className="interaction-icon me-1"
                style={{ 
                  fontSize: '1.2rem',
                  color: '#6c757d'
                }}
              />
              <span className="text-muted ms-1">{post.comments?.length || post.commentCount || 0}</span>
            </Link>
          </div>
          <Link 
            to={`/?category=${getCategoryId()}`} 
            className="text-decoration-none"
          >
            <Badge 
              bg="primary" 
              className="category-badge"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              {getCategoryName()}
            </Badge>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostCard;