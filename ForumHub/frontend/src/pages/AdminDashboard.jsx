const loadPosts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Validate userId before making the request
    if (selectedUserId && selectedUserId.length < 24) {
      setError('Please enter a valid user ID');
      setLoading(false);
      return;
    }

    const result = await getPosts(currentPage, postsPerPage, selectedUserId);
    setPosts(result.data);
    setPagination(result.pagination);
  } catch (error) {
    console.error('Error loading posts:', error);
    setError(error.message || 'Failed to load posts');
  } finally {
    setLoading(false);
  }
}; 