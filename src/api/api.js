import axios from "axios";

// Get API base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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

// Meetings API
export const getMeetings = () => api.get('/meetings');
export const getMeeting = (id) => api.get(`/meetings/${id}`);
export const createMeeting = (data) => api.post('/meetings', data);
export const updateMeeting = (id, data) => api.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);

// Attendees API
export const getAttendees = (meetingId) => api.get(`/meetings/${meetingId}/attendees`);
export const addAttendee = (meetingId, data) => api.post(`/meetings/${meetingId}/attendees`, data);
export const updateAttendee = (meetingId, attendeeId, data) => api.put(`/meetings/${meetingId}/attendees/${attendeeId}`, data);
export const removeAttendee = (meetingId, attendeeId) => api.delete(`/meetings/${meetingId}/attendees/${attendeeId}`);

// Minutes API
export const getAllMinutes = () => api.get('/minutes');
export const getMinutes = (meetingId) => api.get(`/meetings/${meetingId}/minutes`);
export const createMinutes = (meetingId, data) => api.post(`/meetings/${meetingId}/minutes`, data);
export const updateMinutes = (meetingId, minutesId, data) => api.put(`/meetings/${meetingId}/minutes/${minutesId}`, data);
export const deleteMinutes = (meetingId, minutesId) => api.delete(`/meetings/${meetingId}/minutes/${minutesId}`);

// Attachments API
export const getAttachments = (meetingId) => api.get(`/meetings/${meetingId}/attachments`);
export const uploadAttachment = (meetingId, data) => api.post(`/meetings/${meetingId}/attachments`, data);
export const deleteAttachment = (meetingId, attachmentId) => api.delete(`/meetings/${meetingId}/attachments/${attachmentId}`);

export default api;
