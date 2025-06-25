import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';
import { useSocket } from '../contexts/SocketContext';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [searchParams] = useSearchParams();
  const { user, token, logout } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { socket } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const queryParams = new URLSearchParams();
        
        if (selectedCategory) {
          queryParams.append('category', selectedCategory);
        }
        if (searchQuery) queryParams.append('search', searchQuery);
        if (sortBy) queryParams.append('sort', sortBy);

        const queryString = queryParams.toString();
        console.log('Fetching posts with URL:', `${API_URL}/posts?${queryString}`);
        const response = await fetch(`${API_URL}/posts?${queryString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        console.log('Posts API Response:', data);
        
        // Handle both response formats (array or {success, data})
        const postsData = data.success ? data.data : (Array.isArray(data) ? data : []);
        console.log('Processed posts data:', postsData);
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch posts if categories are loaded
    if (!categoriesLoading) {
      fetchPosts();
    }
  }, [selectedCategory, searchQuery, sortBy, categories, categoriesLoading]);

  // Add socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for new comments
      socket.on('commentAdded', ({ postId, comment }) => {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                comments: [...post.comments, comment],
                commentCount: post.comments.length + 1
              };
            }
            return post;
          })
        );
      });

      // Listen for deleted comments
      socket.on('commentDeleted', ({ postId, commentId }) => {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              const updatedComments = post.comments.filter(comment => comment._id !== commentId);
              return {
                ...post,
                comments: updatedComments,
                commentCount: updatedComments.length
              };
            }
            return post;
          })
        );
      });

      return () => {
        socket.off('commentAdded');
        socket.off('commentDeleted');
      };
    }
  }, [socket]);

  // Get the selected category object
  const selectedCategoryObj = categories.find(cat => cat._id === selectedCategory);

  const pageTitle = selectedCategory
    ? `Posts in ${selectedCategoryObj?.name || 'Category'}`
    : sortBy === 'trending'
    ? 'Trending Posts'
    : 'All Posts';

  // Handle voting (upvote/downvote)
  const handleVote = async (postId, voteType) => {
    if (!user || !token) {
      setError('Please log in to vote');
      return;
    }

    if (!postId) {
      console.error('No post ID provided for voting');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/vote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error voting on post');
      }

      // Update posts state with the updated post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? data : post
        )
      );

      // Clear any existing error
      setError(null);
    } catch (err) {
      console.error('Error voting:', err);
      if (err.message.includes('expired')) {
        logout();
      }
      setError(err.message || 'Error voting on post');
    }
  };

  // Handle likes
  const handleLike = async (postId) => {
    if (!user || !token) {
      setError('Please log in to like posts');
      return;
    }

    if (!postId) {
      console.error('No post ID provided for liking');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error liking post');
      }

      // Handle both response formats
      const updatedPost = data.success ? data.data : data;

      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? updatedPost : post
        )
      );

    } catch (err) {
      console.error('Error liking post:', err);
      if (err.message.includes('expired')) {
        logout();
      }
      setError(err.message || 'Error liking post');
    }
  };

  // Handle post deletion
  const handleDelete = async (postId) => {
    if (!user || !token) {
      setError('Please log in to delete posts');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message || 'Failed to delete post');
    }
  };

  if (loading || categoriesLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {error && <Alert variant="danger">{error}</Alert>}
      <h2 className="mb-4">{pageTitle}</h2>
      {posts.length === 0 ? (
        <Alert variant="info">
          No posts found. {user ? (
            <>Be the first to <Link to="/create-post">create a post</Link>!</>
          ) : (
            <>Please <Link to="/login">log in</Link> to create a post.</>
          )}
        </Alert>
      ) : (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            handleVote={handleVote}
            handleLike={handleLike}
            onDelete={handleDelete}
          />
        ))
      )}
    </Container>
  );
};

export default Home; 