import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';

// Import components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
      <AuthProvider>
          <AdminProvider>
            <SocketProvider>
        <CategoryProvider>
                <div className="App">
                <Routes>
                    <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route
                        path="create-post"
                        element={
                          <ProtectedRoute>
                            <CreatePost />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="post/:postId" element={<PostDetail />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="profile/:userId" element={<Profile />} />
                      <Route path="admin/login" element={<AdminLogin />} />
                      <Route
                        path="admin"
                        element={
                          <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                        }
                      />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                </div>
              </CategoryProvider>
            </SocketProvider>
              </AdminProvider>
        </AuthProvider>
            </ThemeProvider>
    </Router>
  );
}

export default App; 