import React, { useState, useEffect } from 'react';
import { getMeetings, getUsers, createMinutes, updateMinutes } from '../api/api';
import { toast } from 'react-toastify';
import ActionItemList from './ActionItemList';

const MinutesForm = ({ meetingId, minutesData, onSave, onCancel }) => {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({
    meeting_id: meetingId || '',
    notes: '',
    decisions: '',
    attachments: [],
    action_items: []
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('MinutesForm: Starting to fetch meetings and users data');

      // Fetch meetings
      try {
        setLoadingMeetings(true);
        const meetingsRes = await getMeetings();
        console.log('MinutesForm: Meetings API response:', meetingsRes);

        // Handle different response structures like AdminPanel.jsx
        let meetingsData = [];
        if (meetingsRes.data && Array.isArray(meetingsRes.data)) {
          // Direct array response
          meetingsData = meetingsRes.data;
        } else if (meetingsRes.data && meetingsRes.data.data && Array.isArray(meetingsRes.data.data)) {
          // Laravel paginated response with data property
          meetingsData = meetingsRes.data.data;
        } else if (meetingsRes.data && meetingsRes.data.meetings && Array.isArray(meetingsRes.data.meetings)) {
          // Custom response with meetings property
          meetingsData = meetingsRes.data.meetings;
        }

        // Normalize meetings data to ensure consistent id field
        const normalizedMeetings = meetingsData.map(meeting => ({
          ...meeting,
          id: meeting.id || meeting.Id || meeting.meeting_id || meeting.meetingId
        }));

        setMeetings(normalizedMeetings);
        console.log('MinutesForm: Meetings loaded successfully:', normalizedMeetings.length, 'meetings');
        console.log('MinutesForm: Raw meetings data:', meetingsData);
        console.log('MinutesForm: Normalized meetings:', normalizedMeetings.map(m => ({ id: m.id, title: m.title, original: m })));
        console.log('MinutesForm: Available meeting IDs:', normalizedMeetings.map(m => m.id));
        console.log('MinutesForm: Meeting IDs details:', normalizedMeetings.map(m => ({ id: m.id, title: m.title || m.name })));
      } catch (error) {
        console.error('MinutesForm: Error loading meetings:', error);
        toast.error('Failed to load meetings. Please check your connection.');
        setMeetings([]);
      } finally {
        setLoadingMeetings(false);
      }

      // Fetch users
      try {
        setLoadingUsers(true);
        const usersRes = await getUsers();
        console.log('MinutesForm: Users API response:', usersRes);

        // Handle different response structures like AdminPanel.jsx
        let usersData = [];
        if (usersRes.data && Array.isArray(usersRes.data)) {
          // Direct array response
          usersData = usersRes.data;
        } else if (usersRes.data && usersRes.data.data && Array.isArray(usersRes.data.data)) {
          // Laravel paginated response with data property
          usersData = usersRes.data.data;
        } else if (usersRes.data && usersRes.data.users && Array.isArray(usersRes.data.users)) {
          // Custom response with users property
          usersData = usersRes.data.users;
        }

        // Process users data to handle Laravel response structure
        const processedUsers = usersData.map((user) => {
          // Handle different ID field names from Laravel
          const userId = user.Id !== undefined ? user.Id :
                        user.id !== undefined ? user.id :
                        user.user_id !== undefined ? user.user_id : null;

          // Handle role field - could be role object or string
          let userRole = "No role assigned";
          if (user.role) {
            if (typeof user.role === 'object' && user.role.name) {
              userRole = user.role.name;
            } else if (typeof user.role === 'string') {
              userRole = user.role;
            }
          }

          return {
            ...user,
            id: userId,
            role: userRole,
            // Preserve role_id for form updates if available
            role_id: user.role_id || (user.role && typeof user.role === 'object' ? user.role.id : null)
          };
        });

        setUsers(processedUsers);
        console.log('MinutesForm: Users loaded successfully:', processedUsers.length, 'users');
      } catch (error) {
        console.error('MinutesForm: Error loading users:', error);
        toast.error('Failed to load users. Please check your connection.');
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (minutesData) {
      // Ensure action_items have ids for proper rendering and editing
      const actionItemsWithIds = (minutesData.action_items || []).map((item, index) => ({
        ...item,
        id: item.id || `existing-${Date.now()}-${index}` // Add id if missing
      }));

      setFormData({
        meeting_id: minutesData.meeting_id || '',
        notes: minutesData.notes || '',
        decisions: minutesData.decisions || '',
        attachments: minutesData.attachments || [],
        action_items: actionItemsWithIds
      });
    }
  }, [minutesData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles(files);
  };

  const handleActionItemAdd = (newItem) => {
    setFormData(prev => ({
      ...prev,
      action_items: [...(prev.action_items || []), { ...newItem, id: Date.now() }] // Use timestamp as id for new items
    }));
  };

  const handleActionItemUpdate = (id, updatedItem) => {
    setFormData(prev => ({
      ...prev,
      action_items: (prev.action_items || []).map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const handleActionItemDelete = (id) => {
    setFormData(prev => ({
      ...prev,
      action_items: (prev.action_items || []).filter(item => item.id !== id)
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meeting_id) {
      toast.error('Please select a meeting');
      return;
    }
    try {
      // Clean action_items data - remove frontend-generated IDs before sending to backend
      const cleanActionItems = formData.action_items.map(item => {
        const { id, ...cleanItem } = item; // Remove the id field
        // Only keep backend-relevant fields
        return {
          task: cleanItem.task,
          assigned_to: cleanItem.assigned_to,
          due_date: cleanItem.due_date,
          status: cleanItem.status
        };
      });

      // Always use JSON payload for now to avoid FormData issues
      let payload;
      if (!minutesData || !(minutesData.id || minutesData.Id)) {
        // Creating new minutes - include meeting_id
        payload = {
          meeting_id: formData.meeting_id,
          notes: formData.notes,
          decisions: formData.decisions,
          action_items: cleanActionItems
        };
      } else {
        // Updating existing minutes - exclude meeting_id, include existing_attachments
        const existingAttachmentIds = (formData.attachments || []).map(att => att.id).filter(id => id !== undefined);
        payload = {
          notes: formData.notes,
          decisions: formData.decisions,
          action_items: cleanActionItems,
          existing_attachments: existingAttachmentIds
        };
      }

      // If there are attachment files, convert to FormData
      if (attachmentFiles.length > 0) {
        const formDataObj = new FormData();
        // Copy all JSON data to FormData
        Object.keys(payload).forEach(key => {
          if (key === 'action_items' || key === 'existing_attachments') {
            formDataObj.append(key, JSON.stringify(payload[key]));
          } else {
            formDataObj.append(key, payload[key]);
          }
        });
        // Append files
        attachmentFiles.forEach((file, index) => {
          formDataObj.append('attachments[]', file);
        });
        payload = formDataObj;
      }

      console.log('MinutesForm: Sending payload:', payload);
      console.log('MinutesForm: Clean action items:', cleanActionItems);
      console.log('MinutesForm: Form data:', formData);
      console.log('MinutesForm: Meeting ID:', formData.meeting_id);
      console.log('MinutesForm: Minutes data:', minutesData);
      console.log('MinutesForm: Minutes data ID check:', minutesData ? (minutesData.id || minutesData.Id) : 'No minutes data');
      console.log('MinutesForm: Will this be CREATE or UPDATE?', (!minutesData || !(minutesData.id || minutesData.Id)) ? 'CREATE' : 'UPDATE');

      // Debug FormData contents if it's FormData
      if (payload instanceof FormData) {
        console.log('MinutesForm: FormData contents:');
        for (let [key, value] of payload.entries()) {
          console.log(`${key}:`, value);
        }
      }

      if (minutesData && (minutesData.id || minutesData.Id)) {
        await updateMinutes(minutesData.id || minutesData.Id, payload);
        toast.success('Minutes updated successfully');
      } else {
        await createMinutes(payload);
        toast.success('Minutes created successfully');
      }
      onSave();
    } catch (error) {
      console.error('MinutesForm: Error saving minutes:', error);

      // Handle different error response formats
      let errorMessage = 'Failed to save minutes';

      if (error.response) {
        console.error('MinutesForm: Response status:', error.response.status);
        console.error('MinutesForm: Response data:', error.response.data);

        if (error.response.status === 422 && error.response.data) {
          // Validation errors
          if (error.response.data.errors) {
            // Laravel validation errors format
            const validationErrors = Object.values(error.response.data.errors).flat();
            errorMessage = validationErrors.join(', ');
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = 'Minutes not found. It may have been deleted.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data sent to server. Please check your input.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="meeting_id" className="form-label">Meeting</label>
        {loadingMeetings ? (
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading meetings...</span>
            </div>
            <span className="text-muted">Loading meetings...</span>
          </div>
        ) : (
          <select
            id="meeting_id"
            name="meeting_id"
            className="form-select"
            value={formData.meeting_id}
            onChange={handleChange}
            required
            disabled={meetings.length === 0}
            style={{ minHeight: '38px' }}
          >
            <option value="">
              {meetings.length === 0 ? 'No meetings available' : 'Select a meeting'}
            </option>
            {meetings.map(meeting => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.title || meeting.name || `Meeting ${meeting.id}`}
              </option>
            ))}
          </select>
        )}
        {meetings.length === 0 && !loadingMeetings && (
          <small className="text-muted">
            No meetings found. Please create a meeting first.
          </small>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="notes" className="form-label">Notes</label>
        <textarea
          id="notes"
          name="notes"
          className="form-control"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="decisions" className="form-label">Decisions</label>
        <textarea
          id="decisions"
          name="decisions"
          className="form-control"
          value={formData.decisions}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="attachments" className="form-label">Attachments</label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          className="form-control"
          multiple
          onChange={handleFileChange}
        />
        {formData.attachments && formData.attachments.length > 0 && (
          <ul className="list-group mt-2">
            {formData.attachments.map((att, idx) => (
              <li key={idx} className="list-group-item">
                {att.name || `Attachment ${idx + 1}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Action Items</label>
        <ActionItemList
          actionItems={formData.action_items || []}
          allowAdd={true}
          onAdd={handleActionItemAdd}
          onUpdate={handleActionItemUpdate}
          onDelete={handleActionItemDelete}
        />
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
};

export default MinutesForm;
