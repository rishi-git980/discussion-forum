import React, { useState } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useSearchParams, useNavigate, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, 
  faSearch, 
  faUser, 
  faSun, 
  faMoon,
  faHome,
  faFire,
  faPlus,
  faSignInAlt,
  faUserPlus,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAvatarUrl, getAvatarStyles } from '../utils/avatar';

function Layout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { categories, loading, error } = useCategories();
  const selectedCategory = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navbar/sidebar on login, register, and admin login pages
  const hideNavAndSidebar = [
    '/login',
    '/register',
    '/admin/login'
  ].includes(location.pathname);

  if (hideNavAndSidebar) {
    return <Outlet />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar expand="lg" className={`sticky-top ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ 
                width: '32px', 
                height: '32px', 
                background: 'linear-gradient(135deg, #007bff, #6610f2)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <span className="fw-bold text-white" style={{ fontSize: '18px' }}>F</span>
            </div>
            <div className="d-flex">
              <span className="fw-bold text-primary">Forum</span>
              <span className="fw-bold text-secondary">Hub</span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                active={location.pathname === '/' && !location.search.includes('sort=trending')}
              >
                <FontAwesomeIcon icon={faHome} className="me-2" />
                Home
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/?sort=trending" 
                active={location.search.includes('sort=trending')}
              >
                <FontAwesomeIcon icon={faFire} className="me-2" />
                Trending
              </Nav.Link>
              {user && (
                <Nav.Link 
                  as={Link} 
                  to="/create-post" 
                  active={location.pathname === '/create-post'}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Post
                </Nav.Link>
              )}
            </Nav>
            <Form className="d-flex mx-3" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="me-2"
              />
              <Button type="submit" variant="outline-primary">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </Form>
            <Form className="d-flex ms-1 me-3">
              <Button
                variant={darkMode ? "outline-light" : "outline-secondary"}
                onClick={toggleTheme}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </Button>
            </Form>
            <Nav>
              {user ? (
                <Dropdown>
                  <Dropdown.Toggle variant="light" id="user-dropdown" className="d-flex align-items-center">
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.username}
                      className="rounded-circle me-2"
                      style={getAvatarStyles(user)}
                    />
                    {user.username}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Profile
                    </Dropdown.Item>
                    {user.role === 'admin' && (
                      <Dropdown.Item as={Link} to="/admin">
                        <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                        Admin Panel
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="flex-grow-1">
        <Row>
          <Col md={2} className="d-none d-md-block sidebar-col">
            <div className="categories-sidebar">
              <h6 className="mb-2 ps-2 fw-bold">Categories</h6>
              <div className="categories-list">
                <Link
                  to="/"
                  className={`category-link py-2 px-3 rounded text-decoration-none ${!selectedCategory ? 'active' : ''}`}
                >
                  <span className="me-2">📚</span>
                  All Categories
                </Link>
                {categories.map(category => (
                  <Link
                    key={category._id}
                    to={`/?category=${category._id}`}
                    className={`category-link py-2 px-3 rounded text-decoration-none ${selectedCategory === category._id ? 'active' : ''}`}
                  >
                    <span className="me-2">{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </Col>
          <Col md={10}>
            <Outlet />
          </Col>
        </Row>
      </Container>

      <style>{`
        .navbar {
          background-color: var(--card-bg) !important;
          border-bottom: 1px solid var(--border-color);
        }
        .nav-link {
          color: var(--text-primary) !important;
          font-weight: 500;
        }
        .nav-link:hover {
          color: var(--primary-color) !important;
        }
        .nav-link.active {
          color: var(--primary-color) !important;
        }
        .dropdown-menu {
          background-color: var(--card-bg) !important;
          border-color: var(--border-color) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .dropdown-item {
          color: var(--text-primary) !important;
          font-weight: 500;
        }
        .dropdown-item:hover {
          background-color: var(--bg-secondary) !important;
          color: var(--primary-color) !important;
        }
        .dropdown-item.active {
          background-color: var(--primary-color) !important;
          color: white !important;
        }
        .dropdown-toggle {
          background-color: transparent !important;
          border: none !important;
          color: var(--text-primary) !important;
          font-weight: 500;
        }
        .dropdown-toggle:hover {
          color: var(--primary-color) !important;
        }
        .search-input {
          background-color: var(--card-bg) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }
        .search-input::placeholder {
          color: var(--text-secondary) !important;
        }
        .sidebar {
          background: var(--card-bg);
          border-right: 1px solid var(--border-color);
          z-index: 100;
          min-width: 180px;
        }
        .category-link {
          color: var(--text-primary);
          transition: all 0.2s ease;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 500;
        }
        .category-link:hover {
          background: var(--bg-secondary);
          color: var(--primary-color);
          border-color: var(--primary-color);
          transform: translateX(3px);
        }
        .category-link.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateX(3px);
        }
        .sidebar-col {
          position: relative;
        }
        
        .categories-sidebar {
          position: sticky;
          top: 70px; /* Adjust based on your navbar height */
          height: calc(100vh - 70px);
          overflow-y: auto;
          padding: 1rem;
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color) transparent;
        }

        .categories-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .categories-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .categories-sidebar::-webkit-scrollbar-thumb {
          background-color: var(--primary-color);
          border-radius: 3px;
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .categories-sidebar::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .categories-sidebar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default Layout; 