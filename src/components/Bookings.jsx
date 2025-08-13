import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TypingEffect from './TypingEffect';

import '../styles/global.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock bookings data
    setBookings([
      {
        id: 1,
        title: 'Weekly Team Standup',
        room: 'Conference Room A',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '09:30',
        status: 'upcoming',
        attendees: ['User', 'Jane Smith', 'Mike Johnson'],
        meetingType: 'internal',
        priority: 'medium',
        description: 'Daily standup meeting to discuss progress and blockers',
        equipment: ['Projector', 'Whiteboard'],
        roomCapacity: 20,
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 2,
        title: 'Client Presentation',
        room: 'Board Room',
        date: '2024-01-16',
        startTime: '14:00',
        endTime: '15:30',
        status: 'upcoming',
        attendees: ['Sarah Wilson', 'David Brown', 'Client Team'],
        meetingType: 'client',
        priority: 'high',
        description: 'Present quarterly results to key client stakeholders',
        equipment: ['Projector', 'Video Conference', 'Audio System'],
        roomCapacity: 15,
        createdAt: '2024-01-08T14:30:00Z'
      },
      {
        id: 3,
        title: 'Product Planning Workshop',
        room: 'Training Room',
        date: '2024-01-14',
        startTime: '10:00',
        endTime: '16:00',
        status: 'completed',
        attendees: ['Engineering Team', 'Product Team', 'Design Team'],
        meetingType: 'workshop',
        priority: 'high',
        description: 'Full-day workshop to plan Q2 product roadmap',
        equipment: ['Projector', 'Whiteboards', 'Audio System'],
        roomCapacity: 30,
        createdAt: '2024-01-05T09:00:00Z'
      },
      {
        id: 4,
        title: 'HR Interview',
        room: 'Meeting Room B',
        date: '2024-01-13',
        startTime: '11:00',
        endTime: '12:00',
        status: 'completed',
        attendees: ['HR Team', 'Candidate'],
        meetingType: 'interview',
        priority: 'medium',
        description: 'Second round interview for Senior Developer position',
        equipment: ['Video Conference'],
        roomCapacity: 8,
        createdAt: '2024-01-10T16:00:00Z'
      },
      {
        id: 5,
        title: 'Creative Brainstorming',
        room: 'Creative Studio',
        date: '2024-01-17',
        startTime: '15:00',
        endTime: '17:00',
        status: 'upcoming',
        attendees: ['Design Team', 'Marketing Team'],
        meetingType: 'internal',
        priority: 'low',
        description: 'Brainstorming session for new marketing campaign',
        equipment: ['Interactive Whiteboard', 'Audio System'],
        roomCapacity: 12,
        createdAt: '2024-01-12T11:00:00Z'
      },
      {
        id: 6,
        title: 'Monthly All-Hands',
        room: 'Conference Room A',
        date: '2024-01-18',
        startTime: '16:00',
        endTime: '17:00',
        status: 'upcoming',
        attendees: ['All Employees'],
        meetingType: 'presentation',
        priority: 'medium',
        description: 'Monthly company-wide meeting to share updates',
        equipment: ['Projector', 'Audio System', 'Video Conference'],
        roomCapacity: 20,
        createdAt: '2024-01-10T10:00:00Z'
      }
    ]);
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-success-color';
      case 'completed': return 'bg-meeting-slate';
      case 'cancelled': return 'bg-danger-color';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return 'fas fa-clock';
      case 'completed': return 'fas fa-check-circle';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger-color';
      case 'medium': return 'bg-warning-color';
      case 'low': return 'bg-success-color';
      default: return 'bg-gray-500';
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'internal': return 'fas fa-users';
      case 'client': return 'fas fa-handshake';
      case 'presentation': return 'fas fa-presentation';
      case 'workshop': return 'fas fa-tools';
      case 'interview': return 'fas fa-user-tie';
      default: return 'fas fa-calendar';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => timeString;

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.room.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  // Handlers for buttons
  const handleEdit = (booking) => {
    alert(`Editing booking: ${booking.title}`);
  };

  const handleReschedule = (booking) => {
    alert(`Rescheduling booking: ${booking.title}`);
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="background-image" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80")'
        }}></div>
        <div className="background-overlay"></div>
        <div className="loading-container">
          <div className="loading-card animate-fade-in">
            <div className="spinner mx-auto"></div>
            <div className="loading-text">Loading bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="background-image" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80")'
      }}></div>
      <div className="background-overlay"></div>

      <div className="floating-element element-1"></div>
      <div className="floating-element element-2"></div>
      <div className="floating-element element-3"></div>

      <div className="dashboard-container">
        <div className="welcome-section animate-fade-in">
          <h1 className="welcome-title"><TypingEffect text="My Bookings" speed={50} /></h1>
          <p className="welcome-subtitle">Manage and track all your meeting bookings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="content-card animate-slide-up animate-delay-100 text-center">
            <div className="text-3xl font-bold text-meeting-blue mb-2">{bookings.length}</div>
            <div className="text-meeting-slate">Total Bookings</div>
          </div>
          <div className="content-card animate-slide-up animate-delay-200 text-center">
            <div className="text-3xl font-bold text-success-color mb-2">{upcomingBookings.length}</div>
            <div className="text-meeting-slate">Upcoming</div>
          </div>
          <div className="content-card animate-slide-up animate-delay-300 text-center">
            <div className="text-3xl font-bold text-meeting-slate mb-2">{completedBookings.length}</div>
            <div className="text-meeting-slate">Completed</div>
          </div>
        </div>

        <div className="room-search-container animate-slide-up animate-delay-400">
          <div className="search-header"><h2 className="search-title">Find Your Bookings</h2></div>
          <div className="search-controls">
            <div className="search-input-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search by title, description, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && <button className="clear-button" onClick={() => setSearchTerm('')} title="Clear search"><i className="fas fa-times"></i></button>}
            </div>
            <div className="filter-section">
              <span className="filter-label">Status:</span>
              <div className="filter-buttons">
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Upcoming</button>
                <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
              </div>
            </div>
          </div>
          <div className="results-info">Showing <span className="results-count">{filteredBookings.length}</span> of {bookings.length} bookings</div>
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <div 
              key={booking.id} 
              className="content-card animate-slide-up hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
            >
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`status-badge ${getStatusColor(booking.status)} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
                        <i className={getStatusIcon(booking.status)}></i>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                      <div className={`priority-badge ${getPriorityColor(booking.priority)} text-white text-xs px-2 py-1 rounded-full`}>
                        {booking.priority.charAt(0).toUpperCase() + booking.priority.slice(1)}
                      </div>
                      <div className="meeting-type-badge bg-meeting-cream text-meeting-navy text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <i className={getMeetingTypeIcon(booking.meetingType)}></i>
                        {booking.meetingType.charAt(0).toUpperCase() + booking.meetingType.slice(1)}
                      </div>
                    </div>
                    <h3 className="card-title text-xl mb-2">{booking.title}</h3>
                    <p className="text-meeting-slate mb-3">{booking.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2"><i className="fas fa-calendar text-meeting-blue"></i><span className="text-meeting-slate">{formatDate(booking.date)}</span></div>
                      <div className="flex items-center gap-2"><i className="fas fa-clock text-meeting-blue"></i><span className="text-meeting-slate">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span></div>
                      <div className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-meeting-blue"></i><span className="text-meeting-slate">{booking.room}</span></div>
                      <div className="flex items-center gap-2"><i className="fas fa-users text-meeting-blue"></i><span className="text-meeting-slate">{booking.attendees.length} attendees</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="btn btn-outline hover-lift"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-outline hover-lift"><i className="fas fa-times"></i></button>
                  </div>
                </div>

                {selectedBooking?.id === booking.id && (
                  <div className="border-t border-meeting-slate/20 pt-4 mt-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-meeting-navy mb-3">Attendees</h4>
                        <div className="space-y-2">
                          {booking.attendees.map((attendee, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-meeting-cream rounded">
                              <i className="fas fa-user text-meeting-blue"></i>
                              <span className="text-meeting-slate">{attendee}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-meeting-navy mb-3">Equipment & Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-cogs text-meeting-blue"></i>
                            <span className="text-meeting-slate">Room Capacity: {booking.roomCapacity} people</span>
                          </div>

                          {booking.equipment.length > 0 && (
                            <div>
                              <span className="text-sm text-meeting-slate">Equipment:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {booking.equipment.map((item, idx) => (
                                  <span key={idx} className="equipment-tag text-xs">{item}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <i className="fas fa-calendar-plus text-meeting-blue"></i>
                            <span className="text-meeting-slate">Booked on: {formatDate(booking.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons for expanded booking */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-meeting-slate/20">
                      <button className="btn btn-primary hover-lift" onClick={() => handleEdit(booking)}>
                        <i className="fas fa-edit mr-2"></i>Edit Booking
                      </button>
                      <button className="btn btn-outline hover-lift" onClick={() => handleReschedule(booking)}>
                        <i className="fas fa-calendar-plus mr-2"></i>Reschedule
                      </button>
                      <button className="btn btn-outline hover-lift" onClick={() => handleCancel(booking.id)}>
                        <i className="fas fa-times mr-2"></i>Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="content-card animate-slide-up text-center py-12">
            <div className="text-6xl text-meeting-slate mb-4"><i className="fas fa-calendar-times"></i></div>
            <h3 className="text-xl font-semibold text-meeting-navy mb-2">No bookings found</h3>
            <p className="text-meeting-slate mb-4">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filters.' : 'You have no bookings yet.'}
            </p>
            <Link to="/book-meeting" className="btn btn-primary hover-lift">Book a Meeting</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
