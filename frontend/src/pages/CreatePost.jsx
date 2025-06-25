import React, { useState, useRef } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeading, 
  faAlignLeft, 
  faLayerGroup,
  faImage,
  faVideo,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Add debug logging
  console.log('Categories from context:', categories);
  console.log('Categories loading:', categoriesLoading);
  console.log('Categories error:', categoriesError);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMediaFiles = [...mediaFiles];
    const newMediaPreviews = [...mediaPreviews];

    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newMediaFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newMediaPreviews.push({
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: e.target.result
          });
          setMediaPreviews([...newMediaPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });

    setMediaFiles(newMediaFiles);
  };

  const removeMedia = (index) => {
    const newMediaFiles = [...mediaFiles];
    const newMediaPreviews = [...mediaPreviews];
    newMediaFiles.splice(index, 1);
    newMediaPreviews.splice(index, 1);
    setMediaFiles(newMediaFiles);
    setMediaPreviews(newMediaPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      // Validate required fields
      if (!title.trim() || !content.trim() || !categoryId) {
        throw new Error('Please fill in all required fields');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('categoryId', categoryId);
      
      // Log the media files being sent
      console.log('Media files to upload:', mediaFiles);
      
      mediaFiles.forEach((file, index) => {
        formData.append('media', file);
      });

      // Log the form data
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      // Get the post ID from the response
      const postId = data.data?._id || data._id;
      if (!postId) {
        throw new Error('No post ID received from server');
      }

      // Navigate to the post detail page
      navigate(`/post/${postId}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in, show message
  if (!user) {
    return (
      <Container className="d-flex align-items-center justify-content-center py-5">
        <Alert variant="warning">
          Please <a href="/login">log in</a> to create a post.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="d-flex align-items-center justify-content-center py-5">
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <h2 className="text-center mb-4 fw-bold">Create New Post</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="title">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faHeading} className="me-2" />
                  Title
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your post title here..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="category">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                  Category
                </Form.Label>
                {categoriesLoading ? (
                  <div className="text-center py-2">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading categories...</span>
                    </div>
                  </div>
                ) : categoriesError ? (
                  <Alert variant="danger">
                    Error loading categories: {categoriesError}
                  </Alert>
                ) : categories && categories.length > 0 ? (
                  <Form.Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="form-control-lg"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option 
                        key={category._id} 
                        value={category._id}
                      >
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Alert variant="warning">
                    No categories available. Please try again later.
                  </Alert>
                )}
              </Form.Group>

              <Form.Group className="mb-4" controlId="content">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                  Content
                </Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="form-control-lg"
                  style={{ minHeight: '200px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faImage} className="me-2" />
                  Media (Images/Videos)
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaChange}
                  ref={fileInputRef}
                  className="form-control-lg"
                />
                <Form.Text className="text-muted">
                  You can upload multiple images and videos. Maximum file size: 10MB each.
                </Form.Text>
              </Form.Group>

              {mediaPreviews.length > 0 && (
                <Row className="mb-4">
                  {mediaPreviews.map((preview, index) => (
                    <Col key={index} xs={6} md={4} className="mb-3">
                      <div className="position-relative">
                        {preview.type === 'image' ? (
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <video
                            src={preview.url}
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                            controls
                          />
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2"
                          onClick={() => removeMedia(index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-3 mb-3 fw-bold fs-5"
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default CreatePost; 