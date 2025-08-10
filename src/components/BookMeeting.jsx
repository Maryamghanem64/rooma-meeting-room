import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TypingEffect from './TypingEffect';

const BookMeeting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: '',
    meetingType: 'internal',
    priority: 'medium',
    equipment: []
  });
  
  const [rooms, setRooms] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadRooms();
    loadAvailableSlots();
  }, []);

  const loadRooms = async () => {
    // Simulate API call
    const mockRooms = [
      { id: 1, name: 'Conference Room A', capacity: 20, status: 'available' },
      { id: 2, name: 'Meeting Room B', capacity: 8, status: 'available' },
      { id: 3, name: 'Board Room', capacity: 15, status: 'available' },
      { id: 4, name: 'Huddle Room 1', capacity: 4, status: 'available' },
      { id: 5, name: 'Training Room', capacity: 30, status: 'available' },
      { id: 6, name: 'Creative Studio', capacity: 12, status: 'available' }
    ];
    setRooms(mockRooms);
  };

  const loadAvailableSlots = async () => {
    // Simulate API call
    const mockSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];
    setAvailableSlots(mockSlots);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const newEquipment = checked 
        ? [...formData.equipment, value]
        : formData.equipment.filter(item => item !== value);
      setFormData(prev => ({ ...prev, equipment: newEquipment }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Meeting title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.room) newErrors.room = 'Please select a room';
    }
    
    if (currentStep === 2) {
      if (!formData.date) newErrors.date = 'Date is required';
      if (!formData.startTime) newErrors.startTime = 'Start time is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';
      
      if (formData.startTime && formData.endTime) {
        const start = new Date(`2000-01-01 ${formData.startTime}`);
        const end = new Date(`2000-01-01 ${formData.endTime}`);
        if (start >= end) {
          newErrors.endTime = 'End time must be after start time';
        }
      }
    }
    
    if (currentStep === 3) {
      if (!formData.attendees.trim()) newErrors.attendees = 'At least one attendee is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message and redirect
    alert('Meeting booked successfully!');
    navigate('/bookings');
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < step) return 'completed';
    if (stepNumber === step) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepNumber) => {
    if (stepNumber < step) return 'fas fa-check';
    if (stepNumber === step) return 'fas fa-circle';
    return 'fas fa-circle';
  };

  return (
    <div className="dashboard-page">
      {/* Background Image */}
      <div className="background-image" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
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
            <TypingEffect text="Book a Meeting" speed={50} />
          </h1>
          <p className="welcome-subtitle">
            Schedule your next meeting with ease
          </p>
        </div>

        {/* Progress Steps */}
        <div className="content-card animate-slide-up animate-delay-100 mb-6">
          <div className="card-content">
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`step-indicator ${getStepStatus(stepNumber)}`}>
                    <i className={getStepIcon(stepNumber)}></i>
                  </div>
                  {stepNumber < 4 && (
                    <div className={`step-line ${getStepStatus(stepNumber)}`}></div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className={`step-label ${getStepStatus(1)}`}>
                <span className="text-sm font-medium">Meeting Details</span>
              </div>
              <div className={`step-label ${getStepStatus(2)}`}>
                <span className="text-sm font-medium">Schedule</span>
              </div>
              <div className={`step-label ${getStepStatus(3)}`}>
                <span className="text-sm font-medium">Attendees</span>
              </div>
              <div className={`step-label ${getStepStatus(4)}`}>
                <span className="text-sm font-medium">Confirm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="content-card animate-slide-up animate-delay-200">
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Meeting Details */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="step-title mb-4">Meeting Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Meeting Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`form-input ${errors.title ? 'error' : ''}`}
                        placeholder="Enter meeting title"
                      />
                      {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    
                    <div>
                      <label className="form-label">Meeting Type</label>
                      <select
                        name="meetingType"
                        value={formData.meetingType}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="internal">Internal Meeting</option>
                        <option value="client">Client Meeting</option>
                        <option value="presentation">Presentation</option>
                        <option value="workshop">Workshop</option>
                        <option value="interview">Interview</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder="Describe the purpose of this meeting"
                    />
                    {errors.description && <span className="error-text">{errors.description}</span>}
                  </div>
                  
                  <div>
                    <label className="form-label">Room *</label>
                    <select
                      name="room"
                      value={formData.room}
                      onChange={handleInputChange}
                      className={`form-select ${errors.room ? 'error' : ''}`}
                    >
                      <option value="">Select a room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} (Capacity: {room.capacity})
                        </option>
                      ))}
                    </select>
                    {errors.room && <span className="error-text">{errors.room}</span>}
                  </div>
                  
                  <div>
                    <label className="form-label">Priority Level</label>
                    <div className="flex gap-3">
                      {['low', 'medium', 'high'].map(priority => (
                        <label key={priority} className="priority-option">
                          <input
                            type="radio"
                            name="priority"
                            value={priority}
                            checked={formData.priority === priority}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <span className={`priority-button ${formData.priority === priority ? 'selected' : ''}`}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="step-title mb-4">Schedule</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`form-input ${errors.date ? 'error' : ''}`}
                      />
                      {errors.date && <span className="error-text">{errors.date}</span>}
                    </div>
                    
                    <div>
                      <label className="form-label">Start Time *</label>
                      <select
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className={`form-select ${errors.startTime ? 'error' : ''}`}
                      >
                        <option value="">Select time</option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                    </div>
                    
                    <div>
                      <label className="form-label">End Time *</label>
                      <select
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className={`form-select ${errors.endTime ? 'error' : ''}`}
                      >
                        <option value="">Select time</option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                    </div>
                  </div>
                  
                  <div className="bg-meeting-cream p-4 rounded-lg">
                    <h4 className="font-medium text-meeting-navy mb-2">Available Time Slots</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(slot => (
                        <span key={slot} className="time-slot text-center py-2 px-3 bg-white rounded border text-sm">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Attendees */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="step-title mb-4">Attendees</h3>
                  
                  <div>
                    <label className="form-label">Attendees *</label>
                    <textarea
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleInputChange}
                      rows={4}
                      className={`form-textarea ${errors.attendees ? 'error' : ''}`}
                      placeholder="Enter attendee names or email addresses (one per line)"
                    />
                    {errors.attendees && <span className="error-text">{errors.attendees}</span>}
                    <p className="text-sm text-meeting-slate mt-1">
                      Enter one attendee per line. You can use names or email addresses.
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label">Required Equipment</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Projector', 'Whiteboard', 'Video Conference', 'Audio System', 'Microphones', 'Recording Equipment'].map(item => (
                        <label key={item} className="equipment-checkbox">
                          <input
                            type="checkbox"
                            name="equipment"
                            value={item}
                            checked={formData.equipment.includes(item)}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <span className={`checkbox-button ${formData.equipment.includes(item) ? 'checked' : ''}`}>
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="animate-fade-in">
                  <h3 className="step-title mb-4">Confirm Booking</h3>
                  
                  <div className="bg-meeting-cream p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold text-meeting-navy mb-4">Meeting Summary</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-meeting-slate">Title</p>
                        <p className="font-medium text-meeting-navy">{formData.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-meeting-slate">Type</p>
                        <p className="font-medium text-meeting-navy capitalize">{formData.meetingType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-meeting-slate">Date</p>
                        <p className="font-medium text-meeting-navy">{formData.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-meeting-slate">Time</p>
                        <p className="font-medium text-meeting-navy">{formData.startTime} - {formData.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-meeting-slate">Room</p>
                        <p className="font-medium text-meeting-navy">
                          {rooms.find(r => r.id == formData.room)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-meeting-slate">Priority</p>
                        <p className="font-medium text-meeting-navy capitalize">{formData.priority}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-meeting-slate">Description</p>
                      <p className="font-medium text-meeting-navy">{formData.description}</p>
                    </div>
                    
                    {formData.equipment.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-meeting-slate">Required Equipment</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.equipment.map(item => (
                            <span key={item} className="equipment-tag text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                      <div>
                        <h5 className="font-medium text-blue-800">Important Notes</h5>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• Meeting will be automatically cancelled if not started within 15 minutes</li>
                          <li>• Please clean up the room after your meeting</li>
                          <li>• Contact IT support if you need technical assistance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-meeting-slate/20">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`btn btn-outline ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}`}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-primary hover-lift"
                    >
                      Next
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary hover-lift"
                    >
                      {loading ? (
                        <>
                          <div className="spinner-sm mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Confirm Booking
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookMeeting;
