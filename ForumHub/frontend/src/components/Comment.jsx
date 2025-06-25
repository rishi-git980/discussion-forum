import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarUrl, getAvatarStyles } from '../utils/avatar';

const Comment = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const canDelete = user && (user._id === comment.userId?._id || user.isAdmin);

  if (!comment) return null;

  return (
    <div className="card shadow-sm border-0 mb-2">
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <Link to={`/profile/${comment.userId?._id}`} className="text-decoration-none">
            <div className="d-flex align-items-center gap-2">
              <img
                src={getAvatarUrl(comment.author, { size: 40 })}
                alt={`${comment.author?.username || 'User'}'s avatar`}
                style={getAvatarStyles({ size: 40 })}
                className="rounded-circle me-2"
              />
              <span className="text-dark fw-medium">
                {comment.userId?.username || 'Unknown User'}
              </span>
            </div>
          </Link>
          <small className="text-muted">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </small>
        </div>
        <p className="mb-0">{comment.content}</p>
        {canDelete && (
          <button
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={() => onDelete(comment._id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default Comment; 