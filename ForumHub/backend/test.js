const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    // Test login
    console.log('Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test2@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse.data);

    // Get token from login response
    const token = loginResponse.data.token;

    // Test getting current user
    console.log('\nTesting get current user...');
    const userResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Current user response:', userResponse.data);

    // Test creating a category
    console.log('\nTesting category creation...');
    const categoryResponse = await axios.post(`${API_URL}/categories`, {
      name: 'Test Category',
      description: 'A test category',
      icon: 'folder'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Category creation response:', categoryResponse.data);

    // Test getting all categories
    console.log('\nTesting get all categories...');
    const categoriesResponse = await axios.get(`${API_URL}/categories`);
    console.log('Categories response:', categoriesResponse.data);

    // Test creating a post
    console.log('\nTesting post creation...');
    const postResponse = await axios.post(`${API_URL}/posts`, {
      title: 'Test Post',
      content: 'This is a test post',
      category: categoryResponse.data.data._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Post creation response:', postResponse.data);

    // Test getting all posts
    console.log('\nTesting get all posts...');
    const postsResponse = await axios.get(`${API_URL}/posts`);
    console.log('Posts response:', postsResponse.data);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testAPI(); 