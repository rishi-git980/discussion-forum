import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { 
    getUsers, 
    toggleUserBan, 
    getPosts, 
    deletePost, 
    loading: adminLoading, 
    error: adminError 
  } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [banDialog, setBanDialog] = useState({ open: false, user: null });
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, post: null });
  const [viewPostDialog, setViewPostDialog] = useState({ open: false, post: null });
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    if (activeTab === 0) {
      loadUsers();
    } else {
      loadPosts();
    }
  }, [activeTab, page]);

  const loadUsers = async () => {
    try {
      const response = await getUsers(page, 10, searchTerm);
      setUsers(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      
      // Get posts from backend
      const response = await getPosts(page, 10);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      setPosts(response.data);
      setFilteredPosts(response.data);
      setTotalPages(response.pagination.pages);
      
    } catch (error) {
      console.error('Error loading posts:', error);
      setPostsError(error.message || 'Failed to load posts');
      setPosts([]);
      setFilteredPosts([]);
      setTotalPages(1);
    } finally {
      setPostsLoading(false);
    }
  };

  // Update filter logic to only use search term
  useEffect(() => {
    if (activeTab === 1 && posts.length > 0) {
      let newFilteredPosts = [...posts];
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        newFilteredPosts = newFilteredPosts.filter(post => 
          post.title?.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower)
        );
      }
      
      setFilteredPosts(newFilteredPosts);
      setTotalPages(Math.ceil(newFilteredPosts.length / 10));
    }
  }, [searchTerm, activeTab, posts]);

  const handleBanUser = async () => {
    try {
      let banExpiresAt = null;
      if (banDuration !== 'permanent') {
        const days = parseInt(banDuration);
        banExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
      await toggleUserBan(banDialog.user._id, true, banReason, banExpiresAt);
      setBanDialog({ open: false, user: null });
      setBanReason('');
      setBanDuration('permanent');
      loadUsers(); // Reload users after banning
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await toggleUserBan(userId, false);
      loadUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(deleteDialog.post._id);
      setDeleteDialog({ open: false, post: null });
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleViewPost = (post) => {
    setViewPostDialog({ open: true, post });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: theme.palette.text.primary,
          fontWeight: 'bold',
          mb: 4
        }}
      >
        Admin Dashboard
      </Typography>

      {adminError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {adminError}
        </Alert>
      )}

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: theme.palette.divider, 
        mb: 3,
        '& .MuiTab-root': {
          color: theme.palette.text.primary,
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }
        }
      }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="User Management" />
          <Tab label="Post Management" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search Users"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              placeholder="Search by username or email..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ 
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            '& .MuiTableCell-head': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 'bold'
            },
            '& .MuiTableCell-body': {
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`
            },
            '& .MuiTableRow-root:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user._id} 
                    sx={{ 
                      '&:hover': { 
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>{user.username}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{user.email}</TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Chip
                          icon={<WarningIcon />}
                          label="Banned"
                          color="error"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 'medium',
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.main
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Active"
                          color="success"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 'medium',
                            borderColor: theme.palette.success.main,
                            color: theme.palette.success.main
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.secondary }}>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <IconButton
                          onClick={() => handleUnbanUser(user._id)}
                          aria-label={`Unban user ${user.username}`}
                          title="Unban User"
                          color="success"
                          tabIndex={0}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => setBanDialog({ open: true, user })}
                          aria-label={`Ban user ${user.username}`}
                          title="Ban User"
                          color="error"
                          tabIndex={0}
                        >
                          <BlockIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              label="Search Posts"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              placeholder="Search by title or content..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.primary,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  }
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 0.7,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {postsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {postsError}
            </Alert>
          )}

          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ 
              boxShadow: 3,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              '& .MuiTableCell-head': {
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold'
              },
              '& .MuiTableCell-body': {
                color: theme.palette.text.primary,
                borderBottom: `1px solid ${theme.palette.divider}`
              },
              '& .MuiTableRow-root:hover': {
                bgcolor: theme.palette.action.hover
              }
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow 
                        key={post._id} 
                        sx={{ 
                          '&:hover': { 
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <TableCell sx={{ color: theme.palette.text.primary }}>{post.title || 'Untitled'}</TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          {post.userId?.username || 'Unknown User'}
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.text.secondary }}>
                          {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Unknown date'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleViewPost(post)}
                            aria-label={`View post ${post.title || 'Untitled'}`}
                            title="View Post"
                            color="primary"
                            tabIndex={0}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => setDeleteDialog({ open: true, post })}
                            aria-label={`Delete post ${post.title || 'Untitled'}`}
                            title="Delete Post"
                            color="error"
                            tabIndex={0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }
            }
          }}
        />
      </Box>

      {/* Dialogs */}
      <Dialog
        open={banDialog.open}
        onClose={() => setBanDialog({ open: false, user: null })}
        aria-labelledby="ban-dialog-title"
        aria-describedby="ban-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            bgcolor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle id="ban-dialog-title" sx={{ 
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 'bold'
        }}>
          Ban User
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography id="ban-dialog-description" variant="body1" gutterBottom sx={{ color: theme.palette.text.primary }}>
            Are you sure you want to ban {banDialog.user?.username}?
          </Typography>
          <TextField
            label="Ban Reason"
            fullWidth
            multiline
            rows={3}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            sx={{ 
              mt: 2,
              '& .MuiInputLabel-root': {
                color: 'text.primary',
              },
              '& .MuiInputBase-input': {
                color: 'text.primary',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }}
          />
          <div className="ban-form-group">
            <label htmlFor="ban-duration">Ban Duration:</label>
            <select
              id="ban-duration"
              value={banDuration}
              onChange={(e) => setBanDuration(e.target.value)}
              className="custom-select"
            >
              <option value="permanent">Permanent Ban</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setBanDialog({ open: false, user: null })}
            variant="outlined"
            sx={{ color: 'text.primary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBanUser}
            variant="contained"
            color="error"
          >
            Ban User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, post: null })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          fontWeight: 'bold'
        }}>
          Delete Post
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ color: theme.palette.text.primary }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, post: null })}
            variant="outlined"
            sx={{ color: 'text.primary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePost}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewPostDialog.open}
        onClose={() => setViewPostDialog({ open: false, post: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 'bold'
        }}>
          View Post
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewPostDialog.post && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                {viewPostDialog.post.title}
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: theme.palette.text.primary }}>
                {viewPostDialog.post.content}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                    Author: {viewPostDialog.post.userId?.username || 'Unknown User'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                    Created: {formatDistanceToNow(new Date(viewPostDialog.post.createdAt), { addSuffix: true })}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setViewPostDialog({ open: false, post: null })}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 