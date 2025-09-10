import axios from "axios";

// Get API base URL from environment variable with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Log environment info in development
if (import.meta.env.DEV) {
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Environment: ${import.meta.env.MODE}`);
}

// Attach token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Rooms API
export const getRooms = () => api.get('/rooms');

// Users API
export const getUsers = () => api.get('/users');

// Meetings API
export const getMeetings = () => api.get('/meetings');
export const getMeeting = (id) => api.get(`/meetings/${id}`);
export const createMeeting = (data) => {
  // Check if data is FormData (for file uploads)
  if (data instanceof FormData) {
    return api.post('/meetings', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  // Default JSON request
  return api.post('/meetings', data);
};
export const updateMeeting = (id, data) => api.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);

// Attendees API
export const getAttendees = (meetingId) => api.get(`/meetingAttendees?meeting_id=${meetingId}`);
export const getAllAttendees = () => api.get('/meetingAttendees');
export const addAttendee = (meetingId, data) => api.post(`/meetingAttendees`, {
  meeting_id: meetingId,
  user_id: data.user_id,  // Added user_id field
  name: data.name,
  email: data.email,
  role: data.role
});
export const updateAttendee = (meetingId, attendeeId, data) => api.put(`/meetingAttendees/${attendeeId}`, {
  name: data.name,
  email: data.email,
  role: data.role
});
export const removeAttendee = (meetingId, attendeeId) => api.delete(`/meetingAttendees/${attendeeId}?meeting_id=${meetingId}`);

// Minutes API
export const getAllMinutes = () => api.get('/minutes');
export const getMinutes = (meetingId) => api.get('/minutes', { params: { meeting_id: meetingId } });
export const createMinutes = (data) => {
  // Check if data is FormData (for file uploads)
  if (data instanceof FormData) {
    // Append meeting_id if not present but available in data object
    if (!data.has('meeting_id') && data.meeting_id) {
      data.append('meeting_id', data.meeting_id);
    }
    return api.post('/minutes', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  // Default JSON request
  return api.post('/minutes', data);
};
export const updateMinutes = (minutesId, data) => {
  // Check if data is FormData (for file uploads)
  if (data instanceof FormData) {
    return api.put(`/minutes/${minutesId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  // Default JSON request
  return api.put(`/minutes/${minutesId}`, data);
};
export const deleteMinutes = (minutesId) => api.delete(`/minutes/${minutesId}`);

// Attachments API
export const getAttachments = (meetingId) => api.get(`/meetings/${meetingId}/attachments`);
export const uploadAttachment = (meetingId, data) => api.post(`/meetings/${meetingId}/attachments`, data);
export const deleteAttachment = (meetingId, attachmentId) => api.delete(`/meetings/${meetingId}/attachments/${attachmentId}`);

// Action Items API
export const getActionItems = () => api.get('/actionItems');
export const getActionItem = (id) => api.get(`/actionItems/${id}`);
export const createActionItem = (data) => api.post('/actionItems', data);
export const updateActionItem = (id, data) => api.put(`/actionItems/${id}`, data);
export const deleteActionItem = (id) => api.delete(`/actionItems/${id}`);

export default api;
