import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/global.css';

const BookMeeting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    room_id: '',
    attendees: [],
    type: 'onsite',
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});

  // Fetch rooms and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, usersResponse] = await Promise.all([
          axios.get('/api/rooms'),
          axios.get('/api/users')
        ]);

        // Normalize rooms data to array
        const roomsData = Array.isArray(roomsResponse.data)
          ? roomsResponse.data
          : Array.isArray(roomsResponse.data.data)
          ? roomsResponse.data.data
          : [];

        // Normalize users data to array
        const usersData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : Array.isArray(usersResponse.data.data)
          ? usersResponse.data.data
          : [];

        setRooms(roomsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load rooms and users');
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      attendees: selectedOptions
    }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
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
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.room_id) newErrors.room_id = 'Room selection is required';

    // Validate start time is before end time
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      if (start >= end) {
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

    setLoading(true);

    try {
      // Prepare meeting data
      const meetingData = {
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_id: formData.room_id,
        type: formData.type,
        status: formData.status,
        attendees: formData.attendees
      };

      // Create meeting
      const response = await axios.post('/api/meetings', meetingData);
      const meeting = response.data.data || response.data;

      // Upload attachments if any
      if (attachments.length > 0 && meeting.id) {
        const formDataFiles = new FormData();
        attachments.forEach((file, index) => {
          formDataFiles.append(`attachments[${index}]`, file);
        });

        await axios.post(`/api/meetings/${meeting.id}/attachments`, formDataFiles, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Meeting booked successfully!');
      navigate('/meetings'); // Redirect to meetings list

    } catch (error) {
      console.error('Error booking meeting:', error);
      const errorMessage = error.response?.data?.message || 'Failed to book meeting';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 py-4" style={{ background: 'linear-gradient(135deg, #2E5D4E 0%, #4A7C59 100%)', color: 'white' }}>
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
                <label htmlFor="title" className="form-label fw-bold text-muted">
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
                <label htmlFor="description" className="form-label fw-bold text-muted">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Enter meeting description and agenda"
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Date and Time */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="start_time" className="form-label fw-bold text-muted">
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
                  <label htmlFor="end_time" className="form-label fw-bold text-muted">
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
                <label htmlFor="room_id" className="form-label fw-bold text-muted">
                  Room *
                </label>
                <select
                  id="room_id"
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  className={`form-select ${errors.room_id ? 'is-invalid' : ''}`}
                >
                  <option value="">Select a room</option>
                  {Array.isArray(rooms) && rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.location} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
                {errors.room_id && <div className="invalid-feedback">{errors.room_id}</div>}
              </div>

              {/* Attendees Selection */}
              <div className="mb-3">
                <label htmlFor="attendees" className="form-label fw-bold text-muted">
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
                  {Array.isArray(users) && users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="form-text">Hold Ctrl/Cmd to select multiple attendees</div>
              </div>

              {/* Meeting Type */}
              <div className="mb-3">
                <label className="form-label fw-bold text-muted">
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
                <label htmlFor="attachments" className="form-label fw-bold text-muted">
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
