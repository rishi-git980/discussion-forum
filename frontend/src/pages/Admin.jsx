import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUserSlash, 
  faUserCheck,
  faTrash,
  faUsers,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('USER_MANAGEMENT');
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBanned: !isBanned })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isBanned: !isBanned }
            : user
        ));
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to update user ban status');
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard admin-theme">
      <Container fluid className="admin-container py-4 px-4">
        <h1 className="admin-title mb-4">Admin Dashboard</h1>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="admin-tabs mb-4"
        >
          <Tab 
            eventKey="USER_MANAGEMENT" 
            title={
              <span className="d-flex align-items-center">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                User Management
              </span>
            }
          >
            <div className="admin-content p-4">
              <div className="search-container mb-4 position-relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="search-icon"
                />
                <Form.Control
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}

              <div className="table-responsive admin-table-container">
                <Table hover className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge 
                            bg={user.isBanned ? 'danger' : 'success'}
                            className="status-badge"
                          >
                            {user.isBanned ? 'Banned' : 'Active'}
                          </Badge>
                        </td>
                        <td>
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant={user.isBanned ? "outline-success" : "outline-warning"}
                              size="sm"
                              onClick={() => handleBanUser(user._id, user.isBanned)}
                              className="admin-action-btn"
                            >
                              <FontAwesomeIcon 
                                icon={user.isBanned ? faUserCheck : faUserSlash} 
                                className="me-1"
                              />
                              {user.isBanned ? 'Unban' : 'Ban'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                              className="admin-action-btn"
                            >
                              <FontAwesomeIcon icon={faTrash} className="me-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Tab>
          <Tab 
            eventKey="POST_MANAGEMENT" 
            title={
              <span className="d-flex align-items-center">
                <FontAwesomeIcon icon={faNewspaper} className="me-2" />
                Post Management
              </span>
            }
          >
            <div className="admin-content p-4">
              <h3 className="mb-4">Post Management</h3>
              {/* Add post management content here */}
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default Admin; 