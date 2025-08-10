import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  // State for mobile menu and user dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: 'fas fa-home' },
    { name: 'Book Meeting', path: '/book-meeting', icon: 'fas fa-calendar-plus' },
    { name: 'My Bookings', path: '/bookings', icon: 'fas fa-calendar-check' },
    { name: 'Minutes', path: '/minutes', icon: 'fas fa-file-alt' },
    { name: 'Rooms', path: '/rooms', icon: 'fas fa-door-open' },
  ];

  // Admin navigation items
  const adminNavigationItems = [
    { name: 'Admin Panel', path: '/admin', icon: 'fas fa-cog' },
    { name: 'Analytics', path: '/analytics', icon: 'fas fa-chart-bar' },
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsUserDropdownOpen(false);
  };

  // Check if current path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // If not authenticated, don't show header
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header-glass">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2E5D4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="#2E5D4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="logo-text">Rooma</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
              >
                <i className={`${item.icon} nav-icon`}></i>
                {item.name}
              </Link>
            ))}
            
            {/* Admin navigation items */}
            {user?.role === 'admin' && adminNavigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item admin ${isActivePath(item.path) ? 'active' : ''}`}
              >
                <i className={`${item.icon} nav-icon`}></i>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - User menu and mobile menu button */}
          <div className="header-actions">
            {/* Notifications */}
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-indicator"></span>
            </button>

            {/* User Menu */}
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="user-avatar">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format"
                    alt={user?.name || 'User'}
                    className="w-full h-full rounded-full object-cover border-2 border-var(--light-beige)"
                  />
                </div>
                <span className="user-name">{user?.name || 'User'}</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              
              {isUserDropdownOpen && (
                <div className="user-dropdown animate-fade-in">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        <img 
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face&auto=format"
                          alt={user?.name || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="dropdown-user-name">{user?.name || 'User'}</div>
                        <div className="dropdown-user-email">{user?.email || 'user@email.com'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <i className="fas fa-user-circle"></i>
                      Profile
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <i className="fas fa-cog"></i>
                      Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item admin">
                        <i className="fas fa-shield-alt"></i>
                        Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <i className="fas fa-sign-out-alt"></i>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-nav animate-slide-up">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`mobile-nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className={`${item.icon} mobile-nav-icon`}></i>
                {item.name}
              </Link>
            ))}
            
            {user?.role === 'admin' && (
              <>
                <div className="mobile-nav-divider"></div>
                {adminNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`mobile-nav-item admin ${isActivePath(item.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`${item.icon} mobile-nav-icon`}></i>
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
