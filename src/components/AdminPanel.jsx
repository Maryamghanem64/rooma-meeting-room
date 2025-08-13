import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TypingEffect from './TypingEffect';
import '../styles/global.css';

const AdminPanel = () => {
  // State for admin data
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [showAddRoom, setShowAddRoom] = useState(false);

  // State for new room form
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    equipment: [],
    status: 'available',
    description: ''
  });

  // Auth context
  const { user, isAdmin } = useAuth();

  // Load admin data
  useEffect(() => {
    loadAdminData();
  }, []);

  // Load admin data
  const loadAdminData = async () => {
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
        usage: 85,
        bookings: 24,
        lastMaintenance: '2024-01-10'
      },
      {
        id: 2,
        name: 'Meeting Room B',
        capacity: 8,
        equipment: ['TV Screen', 'Whiteboard'],
        status: 'booked',
        description: 'Small meeting room for team discussions',
        usage: 92,
        bookings: 18,
        lastMaintenance: '2024-01-08'
      },
      {
        id: 3,
        name: 'Board Room',
        capacity: 15,
        equipment: ['Projector', 'Video Conference', 'Audio System', 'Microphones'],
        status: 'available',
        description: 'Executive board room with premium equipment',
        usage: 78,
        bookings: 12,
        lastMaintenance: '2024-01-12'
      },
      {
        id: 4,
        name: 'Huddle Room 1',
        capacity: 4,
        equipment: ['TV Screen'],
        status: 'maintenance',
        description: 'Quick huddle space for small meetings',
        usage: 65,
        bookings: 8,
        lastMaintenance: '2024-01-15'
      },
      {
        id: 5,
        name: 'Training Room',
        capacity: 30,
        equipment: ['Projector', 'Audio System', 'Microphones', 'Whiteboards'],
        status: 'available',
        description: 'Large training room for workshops',
        usage: 45,
        bookings: 6,
        lastMaintenance: '2024-01-05'
      }
    ]);

    // Mock analytics data
    setAnalytics({
      totalRooms: 5,
      availableRooms: 3,
      bookedRooms: 1,
      maintenanceRooms: 1,
      totalBookings: 68,
      averageUsage: 73,
      monthlyGrowth: 12.5,
      popularRooms: [
        { name: 'Meeting Room B', bookings: 18 },
        { name: 'Conference Room A', bookings: 24 },
        { name: 'Board Room', bookings: 12 }
      ]
    });
    
    setLoading(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const equipment = newRoom.equipment;
      if (checked) {
        equipment.push(value);
      } else {
        const index = equipment.indexOf(value);
        if (index > -1) {
          equipment.splice(index, 1);
        }
      }
      setNewRoom(prev => ({ ...prev, equipment }));
    } else {
      setNewRoom(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add new room
  const addRoom = async () => {
    if (!newRoom.name || !newRoom.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const roomData = {
        ...newRoom,
        id: Date.now(),
        capacity: parseInt(newRoom.capacity),
        usage: 0,
        bookings: 0,
        lastMaintenance: new Date().toISOString().split('T')[0]
      };
      
      setRooms(prev => [...prev, roomData]);
      setNewRoom({
        name: '',
        capacity: '',
        equipment: [],
        status: 'available',
        description: ''
      });
      setShowAddRoom(false);
      
      alert('Room added successfully!');
    } catch (error) {
      console.error('Add room error:', error);
      alert('Failed to add room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update room status
  const updateRoomStatus = async (roomId, status) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, status } : room
      ));
      
      alert('Room status updated successfully!');
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update room status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRooms(prev => prev.filter(room => room.id !== roomId));
      
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Delete room error:', error);
      alert('Failed to delete room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-success-color bg-green-50';
      case 'booked': return 'text-danger-color bg-red-50';
      case 'maintenance': return 'text-warning-color bg-yellow-50';
      default: return 'text-meeting-slate bg-gray-50';
    }
  };

  // Get usage color
  const getUsageColor = (usage) => {
    if (usage >= 80) return 'text-success-color';
    if (usage >= 60) return 'text-warning-color';
    return 'text-danger-color';
  };

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots flex items-center justify-center">
        <div className="text-center animate-zoom-in">
          <i className="fas fa-lock text-4xl text-danger-color mb-4 animate-bounce"></i>
          <h2 className="text-2xl font-bold text-meeting-navy mb-2">Access Denied</h2>
          <p className="text-meeting-slate">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots flex items-center justify-center">
        <div className="text-center animate-zoom-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-meeting-slate">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-down">
          <h1 className="text-3xl font-bold text-meeting-navy mb-2">
            <i className="fas fa-cog mr-3 text-meeting-blue animate-rotate-in"></i>
            <TypingEffect text="Admin Panel" speed={50} />
          </h1>
          <p className="text-meeting-slate">
            Manage rooms, view analytics, and control system settings
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-4 gap-6 mb-8">
          <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-left animate-delay-100">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-meeting-blue to-meeting-navy rounded-full flex items-center justify-center mx-auto mb-3 animate-rotate-in">
                <i className="fas fa-door-open text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-meeting-navy">{analytics.totalRooms}</h3>
              <p className="text-meeting-slate">Total Rooms</p>
            </div>
          </div>

          <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-left animate-delay-200">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-success-color to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-rotate-in">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-meeting-navy">{analytics.availableRooms}</h3>
              <p className="text-meeting-slate">Available</p>
            </div>
          </div>

          <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-left animate-delay-300">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-danger-color to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-rotate-in">
                <i className="fas fa-calendar-check text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-meeting-navy">{analytics.bookedRooms}</h3>
              <p className="text-meeting-slate">Booked</p>
            </div>
          </div>

          <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-left animate-delay-400">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-warning-color to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-rotate-in">
                <i className="fas fa-tools text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-meeting-navy">{analytics.maintenanceRooms}</h3>
              <p className="text-meeting-slate">Maintenance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-3 gap-8">
          {/* Room Management */}
          <div className="col-2">
            <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-left">
              <div className="card-header bg-gradient-to-r from-meeting-blue to-meeting-navy text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    <i className="fas fa-door-open mr-2 text-meeting-accent animate-rotate-in"></i>
                    Room Management
                  </h2>
                  <button
                    onClick={() => setShowAddRoom(true)}
                    className="btn btn-sm bg-white text-meeting-navy hover:bg-meeting-cream hover-lift"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Room
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-meeting-cream">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-meeting-slate uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-meeting-slate uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-meeting-slate uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-meeting-slate uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-meeting-slate uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-meeting-slate">
                      {rooms.map((room, index) => (
                        <tr key={room.id} className="hover:bg-meeting-cream transition-colors animate-slide-in-left" style={{ animationDelay: `${index * 100}ms` }}>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-meeting-navy">{room.name}</div>
                              <div className="text-sm text-meeting-slate">{room.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-meeting-navy">
                            {room.capacity} people
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-meeting-slate rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${getUsageColor(room.usage)}`}
                                  style={{ width: `${room.usage}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${getUsageColor(room.usage)}`}>
                                {room.usage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedRoom(room)}
                                className="text-meeting-blue hover:text-meeting-navy hover-scale"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => deleteRoom(room.id)}
                                className="text-danger-color hover:text-red-700 hover-scale"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics & Quick Actions */}
          <div className="col-1">
            <div className="space-y-6">
              {/* Usage Analytics */}
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right animate-delay-100">
                <div className="card-header bg-gradient-to-r from-success-color to-green-600 text-white">
                  <h2 className="text-xl font-semibold">
                    <i className="fas fa-chart-bar mr-2 text-white animate-rotate-in"></i>
                    Usage Analytics
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-meeting-navy mb-1">{analytics.averageUsage}%</div>
                      <p className="text-sm text-meeting-slate">Average Room Usage</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-meeting-navy">Popular Rooms</h4>
                      {analytics.popularRooms.map((room, index) => (
                        <div key={index} className="flex items-center justify-between animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                          <span className="text-sm text-meeting-slate">{room.name}</span>
                          <span className="text-sm font-medium text-meeting-navy">{room.bookings} bookings</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right animate-delay-200">
                <div className="card-header bg-gradient-to-r from-meeting-accent to-yellow-500 text-white">
                  <h2 className="text-xl font-semibold">
                    <i className="fas fa-bolt mr-2 text-white animate-rotate-in"></i>
                    Quick Actions
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-download mr-2"></i>
                      Export Report
                    </button>
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-cog mr-2"></i>
                      System Settings
                    </button>
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-users mr-2"></i>
                      User Management
                    </button>
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-bell mr-2"></i>
                      Notifications
                    </button>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right animate-delay-300">
                <div className="card-header bg-gradient-to-r from-meeting-slate to-meeting-charcoal text-white">
                  <h2 className="text-xl font-semibold">
                    <i className="fas fa-server mr-2 text-meeting-accent animate-rotate-in"></i>
                    System Status
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-meeting-slate">Database</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-success-color">
                        <i className="fas fa-check-circle mr-1"></i>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-meeting-slate">API Services</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-success-color">
                        <i className="fas fa-check-circle mr-1"></i>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-meeting-slate">Email Service</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-success-color">
                        <i className="fas fa-check-circle mr-1"></i>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Room Modal */}
        {showAddRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-2xl animate-zoom-in">
              <div className="card-header bg-gradient-to-r from-success-color to-green-600 text-white">
                <h2 className="text-lg font-semibold">
                  <i className="fas fa-plus mr-2 text-white"></i>
                  Add New Room
                </h2>
              </div>
              <div className="card-body">
                <form className="space-y-4">
                  <div className="form-group">
                    <label className="form-label text-meeting-navy">
                      <i className="fas fa-door-open mr-2 text-meeting-blue"></i>
                      Room Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newRoom.name}
                      onChange={handleChange}
                      className="form-input focus:border-meeting-blue"
                      placeholder="Enter room name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-meeting-navy">
                      <i className="fas fa-users mr-2 text-meeting-blue"></i>
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={newRoom.capacity}
                      onChange={handleChange}
                      className="form-input focus:border-meeting-blue"
                      placeholder="Number of people"
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-meeting-navy">
                      <i className="fas fa-info-circle mr-2 text-meeting-blue"></i>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newRoom.description}
                      onChange={handleChange}
                      className="form-input focus:border-meeting-blue"
                      rows="3"
                      placeholder="Room description..."
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-meeting-navy">
                      <i className="fas fa-tools mr-2 text-meeting-blue"></i>
                      Equipment
                    </label>
                    <div className="space-y-2">
                      {['Projector', 'Whiteboard', 'Video Conference', 'Audio System', 'TV Screen', 'Microphones'].map(equipment => (
                        <label key={equipment} className="flex items-center">
                          <input
                            type="checkbox"
                            value={equipment}
                            checked={newRoom.equipment.includes(equipment)}
                            onChange={handleChange}
                            className="w-4 h-4 text-meeting-blue border-meeting-slate rounded focus:ring-meeting-blue"
                          />
                          <span className="ml-2 text-sm text-meeting-navy">{equipment}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-meeting-navy">
                      <i className="fas fa-toggle-on mr-2 text-meeting-blue"></i>
                      Status
                    </label>
                    <select
                      name="status"
                      value={newRoom.status}
                      onChange={handleChange}
                      className="form-select focus:border-meeting-blue"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={addRoom}
                      disabled={loading}
                      className="btn btn-primary flex-1 hover-lift"
                    >
                      {loading ? (
                        <>
                          <div className="spinner w-5 h-5"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus mr-2"></i>
                          Add Room
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddRoom(false)}
                      className="btn btn-secondary hover-lift"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
