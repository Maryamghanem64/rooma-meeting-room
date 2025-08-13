import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import TypingEffect from './TypingEffect';
import '../styles/global.css'

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data
    setStats({
      totalMeetings: 24,
      activeMeetings: 3,
      totalRooms: 8,
      availableRooms: 5
    });

    setUpcomingMeetings([
      {
        id: 1,
        title: 'Weekly Team Standup',
        time: '10:00 AM - 11:00 AM',
        room: 'Conference Room A',
        participants: 12,
        status: 'upcoming',
        organizer: {
          name: 'User',
          avatar: null
        }
      },
      {
        id: 2,
        title: 'Project Review Meeting',
        time: '2:00 PM - 3:30 PM',
        room: 'Board Room',
        participants: 8,
        status: 'upcoming',
        organizer: {
          name: 'Sarah Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format'
        }
      },
      {
        id: 3,
        title: 'Client Presentation',
        time: '4:00 PM - 5:00 PM',
        room: 'Training Room',
        participants: 15,
        status: 'upcoming',
        organizer: {
          name: 'Mike Johnson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format'
        }
      }
    ]);

    setRecentBookings([
      {
        id: 1,
        name: 'Meeting Room B',
        capacity: 8,
        equipment: ['TV Screen', 'Whiteboard'],
        status: 'available',
        nextBooking: 'Tomorrow 9:00 AM',
        image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 2,
        name: 'Huddle Room 1',
        capacity: 4,
        equipment: ['TV Screen'],
        status: 'booked',
        nextBooking: 'Today 3:00 PM',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        name: 'Conference Room C',
        capacity: 25,
        equipment: ['Projector', 'Video Conference', 'Audio System'],
        status: 'available',
        nextBooking: 'Friday 10:00 AM',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
      }
    ]);

    setNotifications([
      {
        id: 1,
        message: 'Your meeting "Weekly Review" starts in 15 minutes',
        time: '2 minutes ago',
        type: 'reminder',
        unread: true
      },
      {
        id: 2,
        message: 'Room "Conference Room A" has been booked for tomorrow',
        time: '1 hour ago',
        type: 'booking',
        unread: true
      },
      {
        id: 3,
        message: 'New equipment has been added to "Training Room"',
        time: '3 hours ago',
        type: 'update',
        unread: false
      }
    ]);

    setLoading(false);
  }; if (loading) {
    return (
      <div className="dashboard-page">
        <div className="background-image" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
        }}></div>
        <div className="background-overlay"></div>

        <div className="loading-container">
          <div className="loading-card animate-fade-in">
            <div className="spinner"></div>
            <div className="loading-text">Loading your dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Background Image */}
      <div className="background-image" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
      }}></div>

      {/* Background Overlay */}
      <div className="background-overlay"></div>

      {/* Floating Elements */}
      <div className="floating-element element-1"></div>
      <div className="floating-element element-2"></div>
      <div className="floating-element element-3"></div>

      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section animate-fade-in">
          <div className="welcome-header">
            <h1 className="welcome-title">
              <TypingEffect text={`Welcome back, ${user?.name || 'User'}!`} speed={50} />
            </h1>
          </div>
          <p className="welcome-subtitle">
            Here's what's happening with your meetings today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card animate-slide-up hover-lift" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon animate-pulse">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-number">{stats.totalMeetings}</div>
            <div className="stat-label">Total Meetings</div>
          </div>

          <div className="stat-card animate-slide-up hover-lift" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon animate-heartbeat">
              <i className="fas fa-video"></i>
            </div>
            <div className="stat-number">{stats.activeMeetings}</div>
            <div className="stat-label">Active Meetings</div>
          </div>

          <div className="stat-card animate-slide-up hover-lift" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon animate-wiggle">
              <i className="fas fa-door-open"></i>
            </div>
            <div className="stat-number">{stats.totalRooms}</div>
            <div className="stat-label">Total Rooms</div>
          </div>

          <div className="stat-card animate-slide-up hover-lift" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon animate-glow">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-number">{stats.availableRooms}</div>
            <div className="stat-label">Available Rooms</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Upcoming Meetings */}
          <div className="content-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-clock"></i>
                Upcoming Meetings
              </h2>
              <Link to="/book-meeting" className="action-button">
                <i className="fas fa-plus"></i>
                Book Meeting
              </Link>
            </div>
            <div className="card-content">
              <div className="meetings-list">
                {upcomingMeetings.map((meeting, index) => (
                  <div key={meeting.id} className="meeting-item animate-slide-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <div className="flex items-center gap-4">
                      {meeting.organizer.avatar ? (
                        <img
                          src={meeting.organizer.avatar}
                          alt={meeting.organizer.name}
                          className="w-12 h-12 rounded-full border-2 border-var(--pastel-green) animate-pulse"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-meeting-blue flex items-center justify-center border-2 border-var(--pastel-green) animate-pulse">
                          <i className="fas fa-user text-white"></i>
                        </div>
                      )}
                      <div>
                        <div className="meeting-title">{meeting.title}</div>
                        <div className="meeting-details">
                          <i className="fas fa-clock"></i>
                          {meeting.time}
                        </div>
                        <div className="meeting-details">
                          <i className="fas fa-map-marker-alt"></i>
                          {meeting.room} • {meeting.participants} participants
                        </div>
                        <div className="meeting-details">
                          <i className="fas fa-user"></i>
                          Organized by {meeting.organizer.name}
                        </div>
                      </div>
                    </div>
                    <Link to={`/meeting/${meeting.id}`} className="join-button">
                      <i className="fas fa-sign-in-alt"></i>
                      Join
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */ }
  <div className="content-card animate-slide-up" style={{ animationDelay: '0.6s' }}>
    <div className="card-header">
      <h2 className="card-title">
        <i className="fas fa-bolt"></i>
        Quick Actions
      </h2>
    </div>
    <div className="card-content">
      <div className="quick-actions-grid">
        <Link to="/book-meeting" className="quick-action-item">
          <i className="fas fa-calendar-plus"></i>
          <span>Book Meeting</span>
        </Link>
        <Link to="/rooms" className="quick-action-item">
          <i className="fas fa-door-open"></i>
          <span>View Rooms</span>
        </Link>
        <Link to="/bookings" className="quick-action-item">
          <i className="fas fa-calendar-check"></i>
          <span>My Bookings</span>
        </Link>
        <Link to="/minutes" className="quick-action-item">
          <i className="fas fa-file-alt"></i>
          <span>Meeting Minutes</span>
        </Link>
      </div>
    </div>
  </div>

  {/* Recent Room Bookings */ }
          <div className="content-card animate-slide-up" style={{animationDelay: '0.7s'}}>
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-building"></i>
                Recent Room Bookings
+              </h2>
              <Link to="/rooms" className="action-button">
                <i className="fas fa-eye"></i>
                View All
              </Link>
            </div>
            <div className="card-content">
              <div className="rooms-list">
                {recentBookings.map((room, index) => (
                  <div key={room.id} className="room-item animate-slide-up hover-lift" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <div className="room-image">
                      <img 
                        src={room.image}
                        alt={room.name}
                        className="room-img hover-scale transition-transform duration-300"
                      />
                    </div>
                    <div className="room-info">
                      <div className="room-name">{room.name}</div>
                      <div className="room-capacity">
                        <i className="fas fa-users"></i>
                        {room.capacity} people
                      </div>
                      <div className="room-equipment">
                        {room.equipment.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="equipment-tag">{item}</span>
                        ))}
                        {room.equipment.length > 2 && (
                          <span className="equipment-more">+{room.equipment.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <div className="room-status">
                      <span className={`status-badge ${room.status === 'available' ? 'bg-success-color' : 'bg-danger-color'}`}>
                        {room.status}
                      </span>
                      <div className="next-booking">{room.nextBooking}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

  {/* Notifications */ }
  <div className="content-card animate-slide-up" style={{ animationDelay: '0.8s' }}>
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
        </div >
      </div >
    </div >
  );
};

export default Dashboard;