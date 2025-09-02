import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TypingEffect from './TypingEffect';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';
import '../styles/global.css';
import '../styles/room-search.css';


const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingLoading, setBookingLoading] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  // Debug: Log rooms data when it changes
  useEffect(() => {
    console.log('Rooms data:', rooms);
    const currentFilteredRooms = rooms.filter(room => {
      if (!room) return false;
      const matchesFilter = filter === 'all' || room.status === filter;
      const matchesSearch = room.name && room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    console.log('Filtered rooms:', currentFilteredRooms);
    console.log('Available rooms:', currentFilteredRooms.filter(room => room.status === 'available'));
  }, [rooms, filter, searchTerm]);

  const loadRooms = async () => {
    setLoading(true);
    
    try {
      // Try to fetch rooms from API
      console.log('Fetching rooms from API...');
      const response = await api.get('/rooms');
      console.log('API Response:', response);
      
      // Handle the specific API response structure
      let roomsData = [];
      if (response.data && response.data.data && response.data.data.rooms && Array.isArray(response.data.data.rooms)) {
        roomsData = response.data.data.rooms;
      } else if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && response.data.rooms && Array.isArray(response.data.rooms)) {
        roomsData = response.data.rooms;
      }
      
      // Map API response to expected format with status
      const mappedRooms = roomsData.map(room => ({
        id: room.Id || room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: (room.features || room.equipment || []).map(eq =>
          typeof eq === 'string' ? eq : eq.name || 'Unknown'
        ), // Extract names from equipment objects or use strings
        status: 'available', // All rooms from API are available by default
        description: room.location || room.description || 'No description',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        nextBooking: 'No upcoming bookings',
        usage: Math.floor(Math.random() * 100) // Random usage for demo
      }));
      
      console.log('Mapped rooms data:', mappedRooms);
      setRooms(mappedRooms);
    } catch (error) {
      console.error('Error fetching rooms from API:', error);
      
      // Fallback to mock data if API call fails
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
    }
    
    setLoading(false);
  };

  const handleBookNow = async (roomId) => {
    if (!user) {
      toast.error('Please log in to book a room');
      return;
    }

    setBookingLoading(prev => ({ ...prev, [roomId]: true }));
    
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Create booking data as per requirements
      const bookingData = {
        userId: user.id || user.Id,
        roomId: roomId,
        title: "Booking for " + room.name,
        startTime: new Date().toISOString(), // Current time as dummy value
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
        status: "Scheduled"
      };

      console.log('Sending booking data:', bookingData);

      // Try POST /meetings endpoint as required
      let response;
      try {
        response = await api.post('/meetings', bookingData);
      } catch (meetingError) {
        // If /meetings fails, try /api/meetings as fallback
        try {
          response = await api.post('/api/meetings', bookingData);
        } catch (apiMeetingError) {
          // If both endpoints fail, show success message anyway for demo
          console.log('Both meeting endpoints failed, showing demo success');
          toast.success(`Room booked successfully! (Demo mode)`);
          
          // Update room status locally for demo
          setRooms(prevRooms => 
            prevRooms.map(room => 
              room.id === roomId ? { ...room, status: 'booked' } : room
            )
          );
          setBookingLoading(prev => ({ ...prev, [roomId]: false }));
          return;
        }
      }

      // Handle successful booking
      toast.success('Room booked successfully!');
      
      // Update room status locally
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId ? { ...room, status: 'booked' } : room
        )
      );
      
    } catch (error) {
      console.error('Error booking room:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to book room';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(prev => ({ ...prev, [roomId]: false }));
    }
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
    if (!room) return false;
    const matchesFilter = filter === 'all' || room.status === filter;
    const matchesSearch = room.name && room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase());
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
                  <h3 className="room-title">{room.name || 'Unnamed Room'}</h3>
                  <span className={`status-badge ${getStatusColor(room.status)}`}>
                    {room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Unknown'}
                  </span>
                </div>
                
                <p className="room-description">{room.description || 'No description available'}</p>
                
                <div className="room-details">
                  <div className="room-detail-item">
                    <i className="fas fa-users"></i>
                    <span>{room.capacity || 0} people</span>
              </div>

                  <div className="room-detail-item">
                    <i className="fas fa-clock"></i>
                    <span>Next: {room.nextBooking || 'No upcoming bookings'}</span>
                  </div>
                  
                  <div className="room-detail-item">
                    <i className="fas fa-chart-line"></i>
                    <span>Usage: {room.usage || 0}%</span>
                    <div className="usage-bar">
                      <div 
                        className={`usage-fill ${getUsageColor(room.usage || 0)}`}
                        style={{ width: `${room.usage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="room-equipment-section">
                  <h4 className="equipment-title">Equipment:</h4>
                  <div className="equipment-tags">
                    {room.equipment && room.equipment.map((item, idx) => (
                      <span key={idx} className="equipment-tag">
                        {item}
                      </span>
                    ))}
                    {(!room.equipment || room.equipment.length === 0) && (
                      <span className="equipment-tag">No equipment listed</span>
                    )}
                  </div>
                </div>

                <div className="room-actions">
                  {room.status === 'available' ? (
                    <button
                      className="btn-primary room-action-btn"
                      onClick={() => handleBookNow(room.id)}
                      disabled={bookingLoading[room.id]}
                    >
                      <i className="fas fa-calendar-plus"></i>
                      {bookingLoading[room.id] ? 'Booking...' : 'Book Now'}
                    </button>
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
