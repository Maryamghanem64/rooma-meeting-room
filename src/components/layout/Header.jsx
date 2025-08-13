import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  // State for mobile menu and user dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Navigation items
  const navigationItems = [
    { name: "Dashboard", path: "/", icon: "fas fa-home" },
    {
      name: "Book Meeting",
      path: "/book-meeting",
      icon: "fas fa-calendar-plus",
    },
    { name: "My Bookings", path: "/bookings", icon: "fas fa-calendar-check" },
    { name: "Minutes", path: "/minutes", icon: "fas fa-file-alt" },
    { name: "Rooms", path: "/rooms", icon: "fas fa-door-open" },
  ];
  //notification 
  const [notifications, setNotifications] = useState([
  {
    id: 1,
    type: "reminder",
    message: "Your meeting starts in 30 minutes.",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: 2,
    type: "booking",
    message: "Room 3B is booked for tomorrow.",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 3,
    type: "info",
    message: "New update available!",
    time: "Yesterday",
    unread: true,
  },
]);

  // Admin navigation items
  const adminNavigationItems = [
    { name: "Admin Panel", path: "/admin", icon: "fas fa-cog" },
    { name: "Analytics", path: "/analytics", icon: "fas fa-chart-bar" },
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Modern meeting room icon */}
                  <rect
                    x="4"
                    y="6"
                    width="20"
                    height="16"
                    rx="2"
                    fill="#2E5D4E"
                    stroke="#2E5D4E"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="6"
                    y="8"
                    width="16"
                    height="12"
                    rx="1"
                    fill="white"
                    stroke="#2E5D4E"
                    strokeWidth="0.5"
                  />
                  {/* Meeting table */}
                  <rect
                    x="8"
                    y="12"
                    width="12"
                    height="6"
                    rx="1"
                    fill="#4A7C59"
                    stroke="#2E5D4E"
                    strokeWidth="0.5"
                  />
                  {/* Chairs */}
                  <circle cx="10" cy="18" r="1.5" fill="#4A7C59" />
                  <circle cx="18" cy="18" r="1.5" fill="#4A7C59" />
                  <circle cx="14" cy="20" r="1.5" fill="#4A7C59" />
                  {/* Clock icon */}
                  <circle
                    cx="22"
                    cy="8"
                    r="2.5"
                    fill="#8B5A3C"
                    stroke="#2E5D4E"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M22 5.5V8M24.5 8H22M20.5 8H22"
                    stroke="#2E5D4E"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                  />
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
                className={`nav-item ${
                  isActivePath(item.path) ? "active" : ""
                }`}
              >
                <i className={`${item.icon} nav-icon`}></i>
                {item.name}
              </Link>
            ))}

            {/* Admin navigation items */}
            {user?.role === "admin" &&
              adminNavigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-item admin ${
                    isActivePath(item.path) ? "active" : ""
                  }`}
                >
                  <i className={`${item.icon} nav-icon`}></i>
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Right side - User menu and mobile menu button */}
          <div className="header-actions">
            {/* Notifications */}
            <button
              className="notification-btn"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserDropdownOpen(false); // Close user dropdown if open
              }}>
              <i className="fas fa-bell"></i>
              <span className="notification-indicator"></span>
            </button>
            {isNotificationsOpen && (
  <div className="notifications-dropdown animate-fade-in">
     <div className="content-card animate-slide-up" style={{animationDelay: '0.8s'}}>
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-bell"></i>
                Notifications
              </h2>
            </div>
            <div className="card-content">
              <div className="notifications-list">
                {notifications.map((notification, index) => (
                  <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''} animate-slide-up`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <div className="notification-icon">
                      <i className={`fas ${notification.type === 'reminder' ? 'fa-clock' : notification.type === 'booking' ? 'fa-calendar' : 'fa-info-circle'}`}></i>
                    </div>
                    <div className="notification-content">
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                    {notification.unread && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
  </div>
)}

            {/* User Menu */}
            <div className="user-menu">
              <button
                className="user-menu-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                <div className="user-avatar">
                  <div className="w-full h-full rounded-full bg-meeting-blue flex items-center justify-center border-2 border-var(--light-beige)">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                </div>
                <span className="user-name">{user?.name || "User"}</span>
                <i className="fas fa-chevron-down"></i>
              </button>

              {isUserDropdownOpen && (
                <div className="user-dropdown animate-fade-in">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        <div className="w-full h-full rounded-full bg-meeting-blue flex items-center justify-center">
                          <i className="fas fa-user text-white text-base"></i>
                        </div>
                      </div>
                      <div>
                        <div className="dropdown-user-name">
                          {user?.name || "User"}
                        </div>
                        <div className="dropdown-user-email">
                          {user?.email || "user@email.com"}
                        </div>
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
                    {user?.role === "admin" && (
                      <Link to="/admin" className="dropdown-item admin">
                        <i className="fas fa-shield-alt"></i>
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Styled logout block */}
                  <div
                    className="dropdown-header logout-header"
                    onClick={handleLogout}
                  >
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        <div className="w-full h-full rounded-full bg-red-500 flex items-center justify-center">
                          <i className="fas fa-sign-out-alt text-white text-base"></i>
                        </div>
                      </div>
                      <div>
                        <div className="dropdown-user-name">Sign Out</div>
                        <div className="dropdown-user-email">
                          Logout from your account
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i
                className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
              ></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-nav animate-slide-up">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}className={`mobile-nav-item ${
                  isActivePath(item.path) ? "active" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className={`${item.icon} mobile-nav-icon`}></i>
                {item.name}
              </Link>
            ))}

            {user?.role === "admin" && (
              <>
                <div className="mobile-nav-divider"></div>
                {adminNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`mobile-nav-item admin ${
                      isActivePath(item.path) ? "active" : ""
                    }`}
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
