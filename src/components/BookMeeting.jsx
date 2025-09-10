import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/global.css';
import { createMeeting, uploadAttachment, addAttendee, API_BASE_URL } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Fetch rooms for dropdown
const fetchRooms = async () => {
  const token = localStorage.getItem("token");
  console.log('Fetching rooms from:', `${API_BASE_URL}/rooms`);
  console.log('Token present:', !!token);
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  console.log('Rooms response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Rooms fetch error:', errorText);
    throw new Error(`Failed to fetch rooms: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log('Rooms data:', data);
  return data.data || data;
};

// Fetch users for attendees selection
const fetchUsers = async () => {
  const token = localStorage.getItem("token");
  console.log('Fetching users from:', `${API_BASE_URL}/users`);
  console.log('Token present:', !!token);
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  console.log('Users response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Users fetch error:', errorText);
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log('Users data:', data);
  return data.data || data;
};

const BookMeeting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agenda: '',
    start_time: '',
    end_time: '',
    room_id: null, // Initialize as null to match integer type
    attendees: [],
    type: 'onsite',
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});

  // Fetch rooms and users on component mount
  useEffect(() => {
    console.log('BookMeeting component mounted, fetching data...');
    const fetchData = async () => {
      try {
        const [roomsData, usersData] = await Promise.all([
          fetchRooms(),
          fetchUsers()
        ]);

        const rooms = Array.isArray(roomsData) ? roomsData : (roomsData.rooms || []);
        // Add index-based IDs if room.id is missing
        const roomsWithIds = rooms.map((room, index) => ({
          ...room,
          id: room.id || index + 1 // Use existing ID or create one based on index
        }));
        const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
        setRooms(roomsWithIds);
        setUsers(users);
        console.log('Data fetched successfully:', { rooms: roomsData, users: usersData });
        console.log('Room IDs and types:', roomsWithIds.map(room => ({ id: room.id, type: typeof room.id, name: room.name })));
      } catch (error) {
        console.error('Error fetching data:', error);
        const message = error.message || 'Failed to load rooms and users';
        toast.error(message);
      }
    };

    fetchData();
  }, []);

  // Pre-select room if selectedRoomId is passed in location state
  useEffect(() => {
    if (location.state?.selectedRoomId && rooms.length > 0) {
      const selectedRoom = rooms.find(room => room.id === location.state.selectedRoomId);
      if (selectedRoom) {
        setFormData(prev => ({ ...prev, room_id: selectedRoom.id }));
      }
    }
  }, [rooms, location.state]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'room_id') {
      // Ensure room_id is stored as integer or null, handle empty selection
      if (value === '' || value === null || value === undefined) {
        newValue = null;
      } else {
        const parsed = parseInt(value, 10);
        newValue = isNaN(parsed) ? null : parsed;
      }
      console.log('Room selection changed:', { value, parsedValue: newValue, type: typeof newValue });
    }
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle attendees selection
  const handleAttendeesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => {
      const val = Number(option.value);
      return isNaN(val) ? null : val;
    }).filter(v => v !== null);
    setFormData(prev => ({
      ...prev,
      attendees: selectedOptions
    }));
  };

  // Handle file uploads with validation and progress tracking
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB max size

    const filteredFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`File type not allowed: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`File too large (max 10MB): ${file.name}`);
        return false;
      }
      return true;
    });

    setAttachments(filteredFiles);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.agenda.trim()) newErrors.agenda = 'Agenda is required';
    if (!formData.start_time || formData.start_time === '') newErrors.start_time = 'Start time is required';
    if (!formData.end_time || formData.end_time === '') newErrors.end_time = 'End time is required';
    if (!formData.room_id || isNaN(formData.room_id)) newErrors.room_id = 'Room selection is required';

    // Validate datetime format
    if (formData.start_time && formData.start_time !== '') {
      const startDate = new Date(formData.start_time);
      if (isNaN(startDate.getTime())) {
        newErrors.start_time = 'Invalid start time format';
      }
    }
    if (formData.end_time && formData.end_time !== '') {
      const endDate = new Date(formData.end_time);
      if (isNaN(endDate.getTime())) {
        newErrors.end_time = 'Invalid end time format';
      }
    }

    // Validate start time is before end time
    if (formData.start_time && formData.end_time && formData.start_time !== '' && formData.end_time !== '') {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Check if user is authenticated
    if (!user || !user.id) {
      toast.error('You must be logged in to book a meeting');
      return;
    }

    setLoading(true);

    try {
      // Prepare FormData with all meeting data, attendees, and attachments
      const formDataToSend = new FormData();

      // Add meeting data

      // Helper to format datetime-local to 'YYYY-MM-DD HH:mm:ss'
      const formatDateTime = (datetimeLocal) => {
        if (!datetimeLocal || datetimeLocal === '') {
          console.error('Empty datetime value:', datetimeLocal);
          return '';
        }
        const dt = new Date(datetimeLocal);
        if (isNaN(dt.getTime())) {
          console.error('Invalid datetime value:', datetimeLocal);
          return '';
        }
        const pad = (n) => n.toString().padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
      };

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('agenda', formData.agenda);
      const formattedStartTime = formatDateTime(formData.start_time);
      const formattedEndTime = formatDateTime(formData.end_time);

      console.log('Original start_time:', formData.start_time);
      console.log('Formatted start_time:', formattedStartTime);
      console.log('Original end_time:', formData.end_time);
      console.log('Formatted end_time:', formattedEndTime);

      formDataToSend.append('startTime', formattedStartTime);
      formDataToSend.append('endTime', formattedEndTime);
      if (formData.room_id !== null && formData.room_id !== undefined) {
        formDataToSend.append('roomId', formData.room_id.toString());
      }
      formDataToSend.append('type', formData.type);
      // Normalize status to lowercase and validate
      const validStatuses = ['pending', 'approved', 'rejected'];
      const statusLower = formData.status ? formData.status.toLowerCase() : 'pending';
      formDataToSend.append('status', validStatuses.includes(statusLower) ? statusLower : 'pending');
      // Get user ID, handling both 'id' and 'Id' properties
      const userId = user.Id || user.id;
      formDataToSend.append('userId', userId.toString());

      console.log('Meeting data being sent:', {
        title: formData.title,
        description: formData.description,
        agenda: formData.agenda,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        roomId: formData.room_id,
        type: formData.type,
        status: statusLower,
        userId: userId
      });

      // Add attendees as JSON string only if non-empty
      if (formData.attendees && formData.attendees.length > 0) {
        console.log('Attendees array:', formData.attendees);
        // Send attendees as array of user IDs
        formData.attendees.forEach((userId, index) => {
          console.log(`Appending attendee[${index}]:`, userId);
          formDataToSend.append(`attendees[${index}]`, userId.toString());
        });
      } else {
        console.log('No attendees selected');
      }

      // Add attachments
      if (attachments.length > 0) {
        attachments.forEach((file, index) => {
          formDataToSend.append(`attachments[${index}]`, file);
        });
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Create meeting with all related data
      const response = await createMeeting(formDataToSend);
      const meeting = response.data.data || response.data;

      toast.success('Meeting booked successfully!');
      navigate('/meetings'); // Redirect to meetings list

    } catch (error) {
      console.error('Error booking meeting:', error);
      console.error('Full error response:', error.response?.data);

      // Show detailed validation errors if available
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        console.log('Validation errors:', validationErrors);

        // Handle different error formats
        if (typeof validationErrors === 'object') {
          Object.entries(validationErrors).forEach(([field, messages]) => {
            console.log(`Field: ${field}, Messages:`, messages);
            if (Array.isArray(messages)) {
              messages.forEach(msg => {
                console.log(`Error: ${field}: ${msg}`);
                toast.error(`${field}: ${msg}`);
              });
            } else if (typeof messages === 'string') {
              console.log(`Error: ${field}: ${messages}`);
              toast.error(`${field}: ${messages}`);
            }
          });
        }
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to book meeting';
        console.error('Error message:', errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page min-vh-100 py-4 position-relative text-white">
      <div className="background-image" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
      }}></div>
      <div className="background-overlay"></div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h2 className="card-title mb-0">Book a Meeting</h2>
                <p className="mb-0 mt-1 small">Schedule a new meeting with attendees and room booking</p>
              </div>

            <form onSubmit={handleSubmit} className="card-body">
              {/* Meeting Title */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label fw-bold" style={{ color: 'black' }}>
                  Meeting Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Enter meeting title"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Meeting Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label fw-bold" style={{ color: 'black' }}>
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Enter meeting description"
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Meeting Agenda */}
              <div className="mb-3">
                <label htmlFor="agenda" className="form-label fw-bold" style={{ color: 'black' }}>
                  Agenda *
                </label>
                <textarea
                  id="agenda"
                  name="agenda"
                  rows={4}
                  value={formData.agenda}
                  onChange={handleInputChange}
                  className={`form-control ${errors.agenda ? 'is-invalid' : ''}`}
                  placeholder="Enter meeting agenda items"
                />
                {errors.agenda && <div className="invalid-feedback">{errors.agenda}</div>}
              </div>

              {/* Date and Time */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="start_time" className="form-label fw-bold" style={{ color: 'black' }}>
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className={`form-control ${errors.start_time ? 'is-invalid' : ''}`}
                  />
                  {errors.start_time && <div className="invalid-feedback">{errors.start_time}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="end_time" className="form-label fw-bold" style={{ color: 'black' }}>
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className={`form-control ${errors.end_time ? 'is-invalid' : ''}`}
                  />
                  {errors.end_time && <div className="invalid-feedback">{errors.end_time}</div>}
                </div>
              </div>

              {/* Room Selection */}
              <div className="mb-3">
                <label htmlFor="room_id" className="form-label fw-bold" style={{ color: 'black' }}>
                  Room *
                </label>
                <select
                  id="room_id"
                  name="room_id"
                  value={formData.room_id || ''}
                  onChange={handleInputChange}
                  className={`form-select ${errors.room_id ? 'is-invalid' : ''}`}
                >
                  <option value="">Select a room</option>
                  {Array.isArray(rooms) && rooms.map((room, index) => (
                    <option key={`room-${room.id}-${index}`} value={room.id}>
                      {room.name} - {room.location || 'Location N/A'} (Capacity: {room.capacity || 'N/A'})
                    </option>
                  ))}
                </select>
                {errors.room_id && <div className="invalid-feedback">{errors.room_id}</div>}
              </div>

              {/* Attendees Selection */}
              <div className="mb-3">
                <label htmlFor="attendees" className="form-label fw-bold" style={{ color: 'black' }}>
                  Attendees
                </label>
                <select
                  id="attendees"
                  name="attendees"
                  multiple
                  value={formData.attendees}
                  onChange={handleAttendeesChange}
                  className="form-select"
                  size={4}
                >
                  {Array.isArray(users) && users.map((user, index) => (
                    <option key={`${user.id}-${index}`} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="form-text">Hold Ctrl/Cmd to select multiple attendees</div>
              </div>

              {/* Meeting Type */}
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: 'black' }}>
                  Meeting Type *
                </label>
                <div className="row">
                  <div className="col-auto">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        id="type-onsite"
                        value="onsite"
                        checked={formData.type === 'onsite'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="type-onsite">
                        On-site
                      </label>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        id="type-online"
                        value="online"
                        checked={formData.type === 'online'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="type-online">
                        Online
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Attachments */}
              <div className="mb-3">
                <label htmlFor="attachments" className="form-label fw-bold" style={{ color: 'black' }}>
                  Attachments
                </label>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  multiple
                  onChange={handleFileChange}
                  className="form-control"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <div className="form-text">Upload meeting documents or images (PDF, DOC, DOCX, TXT, JPG, PNG)</div>

                {/* Display selected files */}
                {attachments.length > 0 && (
                  <div className="mt-3">
                    <p className="fw-bold small">Selected files:</p>
                    {attachments.map((file, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-2">
                        <span className="small">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  onClick={() => navigate('/meetings')}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Booking...
                    </>
                  ) : (
                    'Book Meeting'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default BookMeeting;
