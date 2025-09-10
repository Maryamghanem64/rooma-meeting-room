import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import TypingEffect from './TypingEffect';
import { getMeetings, getRooms, getUsers, getAllMinutes, updateMeeting } from '../api/api';
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
    console.log('Dashboard component mounted, loading data...');
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

  const handleJoin = async (meetingId) => {
    console.log('Join button clicked for meeting:', meetingId);
    if (!meetingId) {
      console.error('Invalid meeting ID:', meetingId);
      return;
    }
    try {
      console.log('Updating meeting status...');
      await updateMeeting(meetingId, { status: 'ongoing' });
      console.log('Meeting status updated, navigating...');
      navigate(`/active-meeting/${meetingId}`);
    } catch (error) {
      console.error('Failed to update meeting status:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      console.log('Fetching dashboard data from Laravel API...');

      // Fetch data from Laravel API
      const [meetingsResponse, roomsResponse, usersResponse] = await Promise.all([
        getMeetings(),
        getRooms(),
        getUsers()
      ]);

      console.log('Meetings API Response:', meetingsResponse);
      console.log('Rooms API Response:', roomsResponse);
      console.log('Users API Response:', usersResponse);

      let meetings = meetingsResponse.data || [];
      // Ensure meetings is an array
      if (!Array.isArray(meetings)) {
        meetings = Object.values(meetings);
      }

      let rooms = roomsResponse.data || [];
      // Ensure rooms is an array
      if (!Array.isArray(rooms)) {
        rooms = Object.values(rooms);
      }

      let users = usersResponse.data || [];
      // Ensure users is an array
      if (!Array.isArray(users)) {
        users = Object.values(users);
      }

      // Additional safety checks - ensure we have valid arrays
      if (!Array.isArray(meetings)) meetings = [];
      if (!Array.isArray(rooms)) rooms = [];
      if (!Array.isArray(users)) users = [];

      console.log('Processed data:', { meetings: meetings.length, rooms: rooms.length, users: users.length });

      // Calculate stats
      const now = new Date();
      const activeMeetings = meetings.filter(meeting => {
        const startTime = new Date(meeting.start_time);
        const endTime = new Date(meeting.end_time);
        return startTime <= now && endTime >= now;
      });

      const availableRooms = rooms.filter(room => {
        // Check if room has any active meetings
        const hasActiveMeeting = activeMeetings.some(meeting => meeting.room_id === room.id);
        return !hasActiveMeeting;
      });

      setStats({
        totalMeetings: meetings.length,
        activeMeetings: activeMeetings.length,
        totalRooms: rooms.length,
        availableRooms: availableRooms.length
      });

      // Process upcoming meetings
      const upcomingMeetingsData = meetings
        .filter(meeting => meeting.status === 'pending')
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 3)
        .map(meeting => {
          const startTime = new Date(meeting.start_time);
          const endTime = new Date(meeting.end_time);
          const room = rooms.find(r => r.id === meeting.room_id);
          const organizer = users.find(u => u.id === meeting.created_by);

          return {
            id: meeting.id,
            title: meeting.title,
            date: startTime.toLocaleDateString(),
            time: `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            room: room ? room.name : 'TBD',
            attendees: meeting.attendees || [],
            status: meeting.status,
            organizer: {
              name: organizer ? organizer.name : 'Unknown',
              avatar: organizer && organizer.avatar ? organizer.avatar : null
            }
          };
        });

      // Add 2 fake meetings for testing
      upcomingMeetingsData.push(
        {
          id: 'fake-1',
          title: 'Fake Meeting 1',
          date: new Date().toLocaleDateString(),
          time: '10:00 AM - 11:00 AM',
          room: 'Test Room A',
          attendees: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
          status: 'pending',
          organizer: {
            name: 'Test Organizer',
            avatar: null
          }
        },
        {
          id: 'fake-2',
          title: 'Fake Meeting 2',
          date: new Date().toLocaleDateString(),
          time: '2:00 PM - 3:00 PM',
          room: 'Test Room B',
          attendees: [{ name: 'Alice Johnson' }],
          status: 'pending',
          organizer: {
            name: 'Test Organizer 2',
            avatar: null
          }
        }
      );

      setUpcomingMeetings(upcomingMeetingsData);

      // Process recent room bookings
      const recentBookingsData = rooms.slice(0, 3).map(room => {
        const hasActiveMeeting = activeMeetings.some(meeting => meeting.room_id === room.id);
        const nextMeeting = meetings
          .filter(meeting => meeting.room_id === room.id && new Date(meeting.start_time) > now)
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

        return {
          id: room.id,
          name: room.name,
          capacity: room.capacity || 0,
          equipment: room.equipment ? JSON.parse(room.equipment) : [],
          status: hasActiveMeeting ? 'booked' : 'available',
          nextBooking: nextMeeting ? new Date(nextMeeting.start_time).toLocaleString() : 'No upcoming booking',
          image: room.image || '/vite.svg'
        };
      });

      setRecentBookings(recentBookingsData);

      // Generate notifications from meetings
      const notificationsData = [];
      let notificationId = 1;

      // Check for meetings starting soon
      meetings.forEach(meeting => {
        const startTime = new Date(meeting.start_time);
        const timeDiff = startTime - now;
        const minutesUntilStart = timeDiff / (1000 * 60);

        if (minutesUntilStart > 0 && minutesUntilStart <= 15) {
          notificationsData.push({
            id: notificationId++,
            message: `Your meeting "${meeting.title}" starts in ${Math.round(minutesUntilStart)} minutes`,
            time: `${Math.round(minutesUntilStart)} minutes ago`,
            type: 'reminder',
            unread: true
          });
        }
      });

      // Add some general notifications if none exist
      if (notificationsData.length === 0) {
        notificationsData.push({
          id: notificationId++,
          message: 'Welcome to the Smart Meeting Room Dashboard!',
          time: 'Just now',
          type: 'update',
          unread: true
        });
      }

      setNotifications(notificationsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);

      // Fallback to mock data if API fails
      setStats({
        totalMeetings: 0,
        activeMeetings: 0,
        totalRooms: 0,
        availableRooms: 0
      });

      setUpcomingMeetings([]);
      setRecentBookings([]);
      setNotifications([{
        id: 1,
        message: 'Unable to load data from server. Please check your connection.',
        time: 'Just now',
        type: 'error',
        unread: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.filter(meeting => meeting && meeting.id !== undefined).map((meeting, index) => (
                <div key={`meeting-${meeting.id}-${index}`} className="meeting-item animate-slide-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                  <div key={`meeting-content-${meeting.id}-${index}`} className="flex items-center gap-4">
                    {meeting.organizer.avatar ? (
                      <img key={`avatar-${meeting.id}-${index}`}
                        src={meeting.organizer.avatar}
                        alt={meeting.organizer.name}
                        className="w-12 h-12 rounded-full border-2 border-var(--pastel-green) animate-pulse"
                      />
                    ) : (
                      <div key={`avatar-placeholder-${meeting.id}-${index}`} className="w-12 h-12 rounded-full bg-meeting-blue flex items-center justify-center border-2 border-var(--pastel-green) animate-pulse">
                        <i className="fas fa-user text-white"></i>
                      </div>
                    )}
                    <div key={`meeting-info-${meeting.id}-${index}`}>
                      <div key={`title-${meeting.id}-${index}`} className="meeting-title">{meeting.title}</div>
                      <div key={`date-${meeting.id}-${index}`} className="meeting-details">
                        <i className="fas fa-calendar"></i>
                        {meeting.date}
                      </div>
                      <div key={`time-${meeting.id}-${index}`} className="meeting-details">
                        <i className="fas fa-clock"></i>
                        {meeting.time}
                      </div>
                      <div key={`location-${meeting.id}-${index}`} className="meeting-details">
                        <i className="fas fa-map-marker-alt"></i>
                        {meeting.room}
                      </div>
                      <div key={`attendees-${meeting.id}-${index}`} className="meeting-details">
                        <i className="fas fa-users"></i>
                        Attendees: {meeting.attendees.map(a => a.name).join(', ') || 'None'}
                      </div>
                      <div key={`organizer-${meeting.id}-${index}`} className="meeting-details">
                        <i className="fas fa-user"></i>
                        Organized by {meeting.organizer.name}
                      </div>
                    </div>
                  </div>
                  {meeting.status === 'pending' && (
                    <button key={`join-${meeting.id}-${index}`} type="button" onClick={() => handleJoin(meeting?.id)} className="join-button">
                      <i className="fas fa-sign-in-alt"></i>
                      Join
                    </button>
                  )}
                </div>
                ))
              ) : (
                  <div className="no-meetings-message">
                    <div className="no-meetings-icon">
                      <i className="fas fa-calendar-times"></i>
                    </div>
                    <h3>No upcoming meetings</h3>
                    <p>You don't have any scheduled meetings. Book a meeting to get started!</p>
                    <Link to="/book-meeting" className="btn btn-primary">
                      <i className="fas fa-plus"></i>
                      Book Your First Meeting
                    </Link>
                  </div>
                )}
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
        <Link key="book-meeting" to="/book-meeting" className="quick-action-item">
          <i className="fas fa-calendar-plus"></i>
          <span>Book Meeting</span>
        </Link>
        <Link key="view-rooms" to="/rooms" className="quick-action-item">
          <i className="fas fa-door-open"></i>
          <span>View Rooms</span>
        </Link>
        <Link key="my-bookings" to="/bookings" className="quick-action-item">
          <i className="fas fa-calendar-check"></i>
          <span>My Bookings</span>
        </Link>
        <Link key="meeting-minutes" to="/minutes" className="quick-action-item">
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
                  <div key={`${room.id}-${index}`} className="room-item animate-slide-up hover-lift" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <div key={`image-${room.id}-${index}`} className="room-image">
                      <img 
                        src={room.image}
                        alt={room.name}
                        className="room-img hover-scale transition-transform duration-300"
                      />
                    </div>
                    <div key={`info-${room.id}-${index}`} className="room-info">
                      <div key={`name-${room.id}-${index}`} className="room-name">{room.name}</div>
                      <div key={`capacity-${room.id}-${index}`} className="room-capacity">
                        <i className="fas fa-users"></i>
                        {room.capacity} people
                      </div>
                      <div key={`equipment-${room.id}-${index}`} className="room-equipment">
                        {room.equipment.slice(0, 2).map((item, idx) => (
                          <span key={`equipment-${room.id}-${idx}`} className="equipment-tag">{item}</span>
                        ))}
                        {room.equipment.length > 2 && (
                          <span key={`equipment-more-${room.id}`} className="equipment-more">+{room.equipment.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <div key={`status-${room.id}-${index}`} className="room-status">
                      <span key={`status-badge-${room.id}-${index}`} className={`status-badge ${room.status === 'available' ? 'bg-success-color' : 'bg-danger-color'}`}>
                        {room.status}
                      </span>
                      <div key={`next-booking-${room.id}-${index}`} className="next-booking">{room.nextBooking}</div>
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
                <div key={`${notification.id}-${index}`} className={`notification-item ${notification.unread ? 'unread' : ''} animate-slide-up`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <div key={`icon-${notification.id}-${index}`} className="notification-icon">
                      <i className={`fas ${notification.type === 'reminder' ? 'fa-clock' : notification.type === 'booking' ? 'fa-calendar' : 'fa-info-circle'}`}></i>
                    </div>
                    <div key={`content-${notification.id}-${index}`} className="notification-content">
                      <div key={`message-${notification.id}-${index}`} className="notification-message">{notification.message}</div>
                      <div key={`time-${notification.id}-${index}`} className="notification-time">{notification.time}</div>
                    </div>
                    {notification.unread && <div key={`unread-${notification.id}-${index}`} className="unread-indicator"></div>}
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