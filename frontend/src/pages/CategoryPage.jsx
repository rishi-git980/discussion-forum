import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';
import PostCard from '../components/PostCard';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:5000/api/posts?category=${categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const { success, data } = await response.json();
        if (!success) {
          throw new Error('Failed to fetch posts');
        }

        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchPosts();
    }
  }, [categoryId]);

  // Get category details
  const category = categories.find(cat => cat._id === categoryId);

  if (loading) {
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

  if (!category) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Category not found
          <div className="mt-3">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Go Back Home
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>{category.name}</h2>
        <p className="text-muted">
          Explore discussions about {category.name}
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {posts.length === 0 ? (
        <Alert variant="info">
          No posts in this category yet. {user ? (
            <>Be the first to <button className="btn btn-link p-0" onClick={() => navigate('/create-post')}>create a post</button>!</>
          ) : (
            <>Please <button className="btn btn-link p-0" onClick={() => navigate('/login')}>log in</button> to create a post.</>
          )}
        </Alert>
      ) : (
        <div className="d-flex flex-column gap-4">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default CategoryPage; 