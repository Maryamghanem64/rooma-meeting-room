import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMeetings, updateMeeting, deleteMeeting, addAttendee, updateAttendee, removeAttendee, getRooms, getUsers, getAttendees } from '../api/api';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [attendeeForm, setAttendeeForm] = useState({ name: '', email: '', role: '', user_id: '' });
  const [users, setUsers] = useState([]); // New state for fetched users
  const [bookingForm, setBookingForm] = useState({
    title: '',
    roomId: '',
    startTime: '',
    endTime: '',
    agenda: '',
    userId: ''
  });
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await loadUsers(); // Load users first
      await loadBookings(); // Then load bookings to have users available for enrichment
      await loadRooms();
    };
    loadData();
  }, []);



  // Load bookings with attendees fetched from API
  const loadBookings = async () => {
    setLoading(true);
    try {
      // Fetch users locally to avoid stale React state in async map
      let usersData = [];
      try {
        const usersResponse = await getUsers();
        if (Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        } else if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
          usersData = usersResponse.data.users;
        }
      } catch (userErr) {
        console.error('Error fetching users inside loadBookings:', userErr);
      }

      const response = await getMeetings();
      const meetings = response.data;

      // Fetch attendees for all meetings in parallel
      const meetingsWithAttendees = await Promise.all(
        meetings.map(async (meeting) => {
          try {
            const attendeesResponse = await getAttendees(meeting.Id || meeting.id);
            const attendees = attendeesResponse.data || [];

            // Enrich attendees with user info from locally fetched usersData
            const enrichedAttendees = attendees.map(attendee => {
              const user = usersData.find(u => u.id === attendee.userId || u.id === attendee.user_id);
              return {
                ...attendee,
                name: attendee.name || (user ? user.name : ''),
                email: attendee.email || (user ? user.email : '')
              };
            });

            return { ...meeting, attendees: enrichedAttendees };
          } catch (error) {
            console.error(`Error fetching attendees for meeting ${meeting.Id}:`, error);
            return { ...meeting, attendees: [] };
          }
        })
      );

      setBookings(meetingsWithAttendees);

      // Debug: Log each booking's Id and attendees count and first attendee names
      meetingsWithAttendees.forEach(booking => {
        console.log(`Booking Id: ${booking.Id || booking.id}, Attendees count: ${booking.attendees ? booking.attendees.length : 0}`);
        if (booking.attendees && booking.attendees.length > 0) {
          console.log('Attendees:', booking.attendees.map(a => a.name || a.email).join(', '));
        }
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  };

  // Override submitAttendeeForm to call API and update localStorage
  const submitAttendeeForm = async () => {
    if (!attendeeForm.name.trim()) {
      toast.error('Attendee name is required');
      return;
    }

    try {
      const meetingId = selectedBooking.Id || selectedBooking.id;

      if (editingAttendee) {
        // Update existing attendee via API
        const attendeeId = editingAttendee.id || editingAttendee.Id;
        await updateAttendee(meetingId, attendeeId, attendeeForm);
        toast.success('Attendee updated successfully');
      } else {
        // Add new attendee via API
        await addAttendee(meetingId, attendeeForm);
        toast.success('Attendee added successfully');
      }

      // Refresh the bookings to get updated attendees from API
      await loadBookings();
      closeAttendeeModal();
    } catch (error) {
      console.error('Error saving attendee:', error);
      toast.error('Failed to save attendee');
    }
  };

  // Override handleDeleteAttendee to call API and update localStorage
  const handleDeleteAttendee = async (meetingId, attendeeId) => {
    if (window.confirm('Are you sure you want to remove this attendee?')) {
      try {
        // Remove attendee via API
        await removeAttendee(meetingId, attendeeId);

        // Refresh the bookings to get updated attendees from API
        await loadBookings();
        toast.success('Attendee removed successfully');
      } catch (error) {
        console.error('Error removing attendee:', error);
        toast.error('Failed to remove attendee');
      }
    }
  };



  const loadRooms = async () => {
    if (roomsLoading) return; // Prevent multiple simultaneous loads

    setRoomsLoading(true);
    try {
      const response = await getRooms();
      console.log('Rooms API response:', response.data);

      // Extract rooms array from response data
      let roomsData = response.data;
      if (response.data && typeof response.data === 'object' && response.data.rooms) {
        roomsData = response.data.rooms;
      }

      console.log('Extracted rooms data:', roomsData);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load rooms');
      setRooms([]); // Set empty array on error
    } finally {
      setRoomsLoading(false);
    }
  };

  // New function to load users from API
  const loadUsers = async () => {
    try {
      const response = await getUsers();
      console.log('Users API response data:', response.data);
      // Check if response.data is an array or object containing array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.warn('Unexpected users data format, setting empty array');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert datetime string to "HH:mm" format for input type="time"
    try {
      const date = new Date(timeString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = (booking.title && booking.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (booking.agenda && booking.agenda.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (booking.room && booking.room.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  // Helper function to get room name by ID
  const getRoomName = (roomId) => {
    if (!roomId || !rooms.length) return 'Not specified';
    const room = rooms.find(r => r.Id === parseInt(roomId) || r.Id === roomId);
    return room ? room.name : 'Not specified';
  };

  // Helper function to get room ID by name
  const getRoomId = (roomName) => {
    if (!roomName || !rooms.length) return null;
    const room = rooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
    return room ? room.Id : null;
  };

  // Modal handlers
  const openEditModal = async (booking) => {
    console.log('Opening edit modal for booking:', booking);
    console.log('Current rooms state:', rooms);
    console.log('Rooms loaded:', Array.isArray(rooms) && rooms.length > 0);

    if (!booking || (!booking.Id && !booking.id)) {
      console.error('Invalid booking object:', booking);
      toast.error('Unable to edit booking: Invalid booking data');
      return;
    }

    // Ensure rooms are loaded before opening modal
    if (!Array.isArray(rooms) || rooms.length === 0) {
      console.log('Rooms not loaded yet, attempting to reload...');
      if (!roomsLoading) {
        try {
          await loadRooms();
          console.log('Rooms reloaded, opening modal...');
        } catch (error) {
          console.error('Failed to reload rooms:', error);
          toast.error('Failed to load rooms. Please refresh the page.');
          return;
        }
      } else {
        console.log('Rooms are already loading, waiting...');
        // Wait for loading to complete
        while (roomsLoading) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Get the room ID - if it's a string name, convert it to ID
    let roomId = booking.room_id || booking.roomId || null;
    console.log('Original roomId from booking:', roomId, 'Type:', typeof roomId);

    if (typeof roomId === 'string' && roomId && !/^\d+$/.test(roomId)) {
      // If roomId is a string name (not a number), find the corresponding ID
      console.log('Converting room name to ID:', roomId);
      roomId = getRoomId(roomId);
      console.log('Converted roomId:', roomId);
    } else if (typeof roomId === 'string' && /^\d+$/.test(roomId)) {
      // If it's already a numeric string, convert to integer
      roomId = parseInt(roomId, 10);
    }

    console.log('Final roomId for form:', roomId);

    setEditingBooking(booking);
    setBookingForm({
      title: booking.title || '',
      roomId: roomId,
      startTime: formatTime(booking.start_time) || '',
      endTime: formatTime(booking.end_time) || '',
      agenda: booking.agenda || booking.description || '',
      userId: booking.userId || booking.user_id || ''
    });
    setShowEditModal(true);
    console.log('Edit modal opened successfully');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBooking(null);
    setBookingForm({
      title: '',
      roomId: '',
      startTime: '',
      endTime: '',
      agenda: '',
      userId: ''
    });
  };

  const openAttendeeModal = (booking, attendee = null) => {
    setSelectedBooking(booking);
    setEditingAttendee(attendee);
    setAttendeeForm({
      name: attendee ? (attendee.name || '') : '',
      email: attendee ? (attendee.email || '') : '',
      role: attendee ? (attendee.role || '') : '',
      user_id: attendee ? (attendee.user_id || '') : ''
    });
    setShowAttendeeModal(true);
  };

  const closeAttendeeModal = () => {
    setShowAttendeeModal(false);
    setEditingAttendee(null);
    setAttendeeForm({ name: '', email: '', role: '', user_id: '' });
  };

  const handleCancel = async (id) => {
    setBookingToDelete(bookings.find(b => b.id === id));
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMeeting(bookingToDelete.id);
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
      toast.success('Booking deleted successfully');
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };



  const submitBookingForm = async () => {
    if (!bookingForm.title.trim()) {
      toast.error('Booking title is required');
      return;
    }

    if (!editingBooking || (!editingBooking.Id && !editingBooking.id)) {
      console.error('Invalid editing booking:', editingBooking);
      toast.error('Unable to update booking: Invalid booking data');
      return;
    }

    try {
      // Format datetime strings to match API expectations (YYYY-MM-DD HH:mm:ss)
      const bookingDate = editingBooking.date || new Date().toISOString().split('T')[0];

      // Validate and format times
      let formattedStartTime = '';
      let formattedEndTime = '';

      if (bookingForm.startTime && bookingForm.endTime) {
        const startDateTimeObj = new Date(`${bookingDate}T${bookingForm.startTime}:00`);
        const endDateTimeObj = new Date(`${bookingDate}T${bookingForm.endTime}:00`);

        // Check if dates are valid
        if (isNaN(startDateTimeObj.getTime()) || isNaN(endDateTimeObj.getTime())) {
          toast.error('Invalid time format');
          return;
        }

        const pad = (n) => n.toString().padStart(2, '0');
        formattedStartTime = `${startDateTimeObj.getFullYear()}-${pad(startDateTimeObj.getMonth() + 1)}-${pad(startDateTimeObj.getDate())} ${pad(startDateTimeObj.getHours())}:${pad(startDateTimeObj.getMinutes())}:${pad(startDateTimeObj.getSeconds())}`;
        formattedEndTime = `${endDateTimeObj.getFullYear()}-${pad(endDateTimeObj.getMonth() + 1)}-${pad(endDateTimeObj.getDate())} ${pad(endDateTimeObj.getHours())}:${pad(endDateTimeObj.getMinutes())}:${pad(endDateTimeObj.getSeconds())}`;
      } else {
        // Use existing times if not changed
        formattedStartTime = editingBooking.start_time;
        formattedEndTime = editingBooking.end_time;
      }

      // Convert roomId to integer if possible
      let roomIdInt = null;
      if (bookingForm.roomId !== null && bookingForm.roomId !== undefined && bookingForm.roomId !== '') {
        roomIdInt = parseInt(bookingForm.roomId, 10);
        if (isNaN(roomIdInt)) {
          toast.error('Invalid room selection');
          return;
        }
      }

      const updateData = {
        title: bookingForm.title,
        room_id: roomIdInt,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        agenda: bookingForm.agenda,
        user_id: bookingForm.userId
      };

      console.log('Updating booking with ID:', editingBooking.Id, 'and data:', updateData);
      await updateMeeting(editingBooking.Id, updateData);
      await loadBookings();
      closeEditModal();
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };



  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
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
        {/* Header */}
        <div className="welcome-section animate-fade-in">
          <div className="welcome-header">
            <h1 className="welcome-title">My Bookings</h1>
          </div>
              <p className="welcome-subtitle" style={{ color: 'black' }}>
                Manage and track all your meeting bookings
              </p>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-end">
              <Link to="/dashboard" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title text-primary">{bookings.length}</h3>
              <p className="card-text" style={{ color: 'black' }}>Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title text-success">{upcomingBookings.length}</h3>
              <p className="card-text" style={{ color: 'black' }}>Upcoming</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title text-secondary">{completedBookings.length}</h3>
              <p className="card-text" style={{ color: 'black' }}>Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Find Your Bookings</h5>
          <div className="row">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, agenda, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2">
                <button
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('upcoming')}
                >
                  Upcoming
                </button>
                <button
                  className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2" style={{ color: 'black' }}>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="row">
        {filteredBookings.map((booking) => (
          <div key={booking.Id} className="col-12 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">{booking.title || 'Untitled'}</h5>
                  <small style={{ color: 'black' }}>
                  {booking.startTime ? formatDate(booking.startTime) : 'No date'} •
                  {booking.startTime && booking.endTime ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` : 'No time'}
                  </small>
                </div>
                <div className="btn-group">
                  <button className="btn btn-primary btn-sm" onClick={() => openEditModal(booking)}>
                    <i className="bi bi-pencil me-1"></i>Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(booking.Id)}>
                    <i className="bi bi-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Meeting Details Section */}
                <div className="row mb-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-3" style={{ color: 'black' }}>
                      <i className="bi bi-calendar-check me-2"></i>Meeting Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-2">
<strong>Title:</strong> {booking.title}
                        </p>
                        <p className="mb-2">
<strong>Agenda:</strong> {booking.agenda}
                        </p>
                        <p className="mb-2">
<strong>Room:</strong> {getRoomName(booking.roomId)}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
<strong>Date:</strong> {booking.startTime ? formatDate(booking.startTime) : ''}
                        </p>
                        <p className="mb-2">
<strong>Time:</strong> {booking.startTime && booking.endTime ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` : ''}
                        </p>
                        <p className="mb-2">
                          <strong>Status:</strong>
                          <span className={`badge ms-2 ${booking.status === 'upcoming' ? 'bg-success' : booking.status === 'completed' ? 'bg-secondary' : 'bg-warning'}`}>
                            {booking.status || 'Unknown'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendees Section */}
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="text-primary mb-0" style={{ color: 'black' }}>
                        <i className="bi bi-people me-2"></i>Attendees
                      </h6>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openAttendeeModal(booking)}
                      >
                        <i className="bi bi-plus-circle me-1"></i>Add Attendee
                      </button>
                    </div>

                    {booking.attendees && booking.attendees.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
{booking.attendees.map((attendee, idx) => (
  <tr key={attendee.id || idx}>
    <td>{attendee.name || ''}</td>
    <td>{attendee.email || ''}</td>
    <td>
      <div className="btn-group btn-group-sm">
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            const attendeeId = attendee.id || attendee.Id;
            if (!attendeeId) {
              console.error('Attendee missing id, cannot delete:', attendee);
              toast.error('Cannot delete attendee: missing id');
              return;
            }
            handleDeleteAttendee(booking.Id, attendeeId);
          }}
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
    </td>
  </tr>
))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4" style={{ color: 'black' }}>
                  <i className="bi bi-people display-4 mb-2"></i>
                  <p>No attendees added yet</p>
                </div>
              )}
                  </div>
                </div>

                {/* Equipment & Notes Section */}
                {(booking.equipment || booking.notes) && (
                  <div className="row">
                    <div className="col-12">
                      <h6 className="text-primary mb-3">
                        <i className="bi bi-tools me-2"></i>Equipment & Notes
                      </h6>
                      <div className="row">
                        {booking.equipment && (
                          <div className="col-md-6">
                          <p className="mb-2" style={{ color: 'black' }}><strong>Equipment:</strong></p>
                            <div>
                              {Array.isArray(booking.equipment) ? (
                                booking.equipment.map((item, idx) => (
                                  <span key={idx} className="badge bg-info me-1 mb-1">{item}</span>
                                ))
                              ) : (
                                <span className="badge bg-info">{booking.equipment}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {booking.notes && (
                          <div className="col-md-6">
                            <p className="mb-2"><strong>Notes:</strong></p>
                            <p style={{ color: 'black' }}>{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-calendar-x display-1 mb-3" style={{ color: 'black' }}></i>
            <h5 className="card-title" style={{ color: 'black' }}>No bookings found</h5>
            <p className="card-text" style={{ color: 'black' }}>
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filters.' : 'You have no bookings yet.'}
            </p>
            <Link to="/book-meeting" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Book a Meeting
            </Link>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      <div className={`modal fade ${showEditModal ? 'show' : ''}`} style={{ display: showEditModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Booking</h5>
              <button type="button" className="btn-close" onClick={closeEditModal}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Room</label>
                  <select
                    className="form-control"
                    value={bookingForm.roomId !== null && bookingForm.roomId !== undefined ? bookingForm.roomId : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Room selection changed:', value, 'Type:', typeof value);
                      console.log('Available rooms:', rooms);
                      // Ensure room_id is stored as integer or null, handle empty selection
                      if (value === '' || value === null || value === undefined) {
                        setBookingForm({ ...bookingForm, roomId: null });
                      } else {
                        const parsed = parseInt(value, 10);
                        console.log('Parsed room ID:', parsed, 'Is NaN:', isNaN(parsed));
                        setBookingForm({ ...bookingForm, roomId: isNaN(parsed) ? null : parsed });
                      }
                    }}
                  >
                    <option value="">Select a room</option>
                    {Array.isArray(rooms) && rooms.length > 0 ? (
                      rooms.map((room) => {
                        console.log('Room option:', room.Id, room.name);
                        return (
                          <option key={room.Id} value={room.Id}>
                            {room.name}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled>No rooms available</option>
                    )}
                  </select>
                  {Array.isArray(rooms) && rooms.length === 0 && (
                    <small className="text-muted">Loading rooms...</small>
                  )}
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={bookingForm.startTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={bookingForm.endTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Agenda</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bookingForm.agenda}
                    onChange={(e) => setBookingForm({ ...bookingForm, agenda: e.target.value })}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={submitBookingForm}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-danger">Delete Booking</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body text-center">
              <i className="bi bi-exclamation-triangle text-warning display-1 mb-3"></i>
              <h6>Are you sure?</h6>
              <p className="text-muted">
                This action cannot be undone. This will permanently delete the booking for "{bookingToDelete?.title}".
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete Booking</button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Modal */}
      <div className={`modal fade ${showAttendeeModal ? 'show' : ''}`} style={{ display: showAttendeeModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingAttendee ? 'Edit Attendee' : 'Add Attendee'}</h5>
              <button type="button" className="btn-close" onClick={closeAttendeeModal}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={attendeeForm.name}
                    onChange={(e) => setAttendeeForm({ ...attendeeForm, name: e.target.value })}
                    required
                  />
                </div>
              <div className="mb-3">
                <label className="form-label">Select User</label>
                <select
                  className="form-control"
                  value={attendeeForm.user_id}
                  onChange={(e) => {
                    const selectedUserId = e.target.value;
                    const selectedUser = users.find(user => user.id.toString() === selectedUserId);
                    if (selectedUser) {
                      setAttendeeForm({
                        ...attendeeForm,
                        user_id: selectedUserId,
                        name: selectedUser.name || '',
                        email: selectedUser.email || ''
                      });
                    } else {
                      setAttendeeForm({
                        ...attendeeForm,
                        user_id: '',
                        name: '',
                        email: ''
                      });
                    }
                  }}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeAttendeeModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={submitAttendeeForm}>
                {editingAttendee ? 'Update Attendee' : 'Add Attendee'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {(showEditModal || showDeleteModal || showAttendeeModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
      </div>
    </div>
  );
};

export default Bookings;
