import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TypingEffect from './TypingEffect';
import '../styles/global.css';
import '../styles/room-search.css';


const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock rooms data
    setRooms([
        {
          id: 1,
          name: 'Conference Room A',
        capacity: 20,
        equipment: ['Projector', 'Whiteboard', 'Video Conference', 'Audio System'],
          status: 'available',
        description: 'Main conference room with full AV setup',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'Tomorrow 9:00 AM',
        usage: 85
        },
        {
          id: 2,
        name: 'Meeting Room B',
        capacity: 8,
        equipment: ['TV Screen', 'Whiteboard'],
          status: 'booked',
        description: 'Small meeting room for team discussions',
        image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'Today 3:00 PM',
        usage: 92
        },
        {
          id: 3,
        name: 'Board Room',
        capacity: 15,
        equipment: ['Projector', 'Video Conference', 'Audio System', 'Microphones'],
          status: 'available',
        description: 'Executive board room with premium equipment',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'Friday 10:00 AM',
        usage: 78
        },
        {
          id: 4,
        name: 'Huddle Room 1',
        capacity: 4,
        equipment: ['TV Screen'],
        status: 'maintenance',
        description: 'Quick huddle space for small meetings',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'Next Week',
        usage: 65
        },
        {
          id: 5,
        name: 'Training Room',
        capacity: 30,
        equipment: ['Projector', 'Audio System', 'Microphones', 'Whiteboards'],
        status: 'available',
        description: 'Large training room for workshops',
        image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'Monday 9:00 AM',
        usage: 45
        },
        {
          id: 6,
        name: 'Creative Studio',
        capacity: 12,
        equipment: ['Interactive Whiteboard', 'Audio System', 'Recording Equipment'],
          status: 'available',
        description: 'Innovation space for creative sessions',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'Today 5:00 PM',
        usage: 60
      }
    ]);
    
      setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success-color';
      case 'booked': return 'bg-danger-color';
      case 'maintenance': return 'bg-warning-color';
      default: return 'bg-gray-500';
    }
  };

  const getUsageColor = (usage) => {
    if (usage >= 80) return 'bg-success-color';
    if (usage >= 60) return 'bg-warning-color';
    return 'bg-danger-color';
  };

  const filteredRooms = rooms.filter(room => {
    const matchesFilter = filter === 'all' || room.status === filter;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <div className="loading-text">Loading rooms...</div>
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
        {/* Header Section */}
        <div className="welcome-section animate-fade-in">
          <h1 className="welcome-title">
            <TypingEffect text="Meeting Rooms" speed={50} />
          </h1>
          <p className="welcome-subtitle">
            Find and book the perfect space for your meetings
          </p>
        </div>

        {/* Filters and Search */}
        <div className="content-card animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="card-content">
            <div className="filters-container">
              {/* Search */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  
              </div>
            </div>
            
              {/* Status Filter */}
              <div className="filter-buttons">
                <button
                  onClick={() => setFilter('all')}
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
                >
                  Available
                </button>
                <button
                  onClick={() => setFilter('booked')}
                  className={`filter-btn ${filter === 'booked' ? 'active' : ''}`}
                >
                  Booked
                </button>
                <button
                  onClick={() => setFilter('maintenance')}
                  className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
                >
                  Maintenance
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="rooms-grid">
          {filteredRooms.map((room, index) => (
            <div 
              key={room.id} 
              className="room-card animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="room-image">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="room-img"
                />
                </div>
              
              <div className="room-card-content">
                <div className="room-header">
                  <h3 className="room-title">{room.name}</h3>
                  <span className={`status-badge ${getStatusColor(room.status)}`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                </div>
                
                <p className="room-description">{room.description}</p>
                
                <div className="room-details">
                  <div className="room-detail-item">
                    <i className="fas fa-users"></i>
                    <span>{room.capacity} people</span>
              </div>

                  <div className="room-detail-item">
                    <i className="fas fa-clock"></i>
                    <span>Next: {room.nextBooking}</span>
                  </div>
                  
                  <div className="room-detail-item">
                    <i className="fas fa-chart-line"></i>
                    <span>Usage: {room.usage}%</span>
                    <div className="usage-bar">
                      <div 
                        className={`usage-fill ${getUsageColor(room.usage)}`}
                        style={{ width: `${room.usage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="room-equipment-section">
                  <h4 className="equipment-title">Equipment:</h4>
                  <div className="equipment-tags">
                    {room.equipment.map((item, idx) => (
                      <span key={idx} className="equipment-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="room-actions">
                  {room.status === 'available' ? (
                    <Link 
                      to="/book-meeting" 
                      className="btn-primary room-action-btn"
                    >
                      <i className="fas fa-calendar-plus"></i>
                    Book Now
                    </Link>
                  ) : (
                    <button 
                      className="btn-secondary room-action-btn"
                      disabled
                    >
                      <i className="fas fa-clock"></i>
                      {room.status === 'booked' ? 'Booked' : 'Maintenance'}
                  </button>
                  )}
                  
                  <button className="btn-outline room-action-btn">
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredRooms.length === 0 && (
          <div className="content-card animate-slide-up text-center py-12">
            <div className="no-results-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="no-results-title">No rooms found</h3>
            <p className="no-results-text">
              Try adjusting your search terms or filters
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="btn-primary"
            >
              <i className="fas fa-refresh"></i>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
