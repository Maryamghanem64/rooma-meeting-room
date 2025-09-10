import React, { useState, useEffect } from 'react';
import { getAllMinutes, deleteMinutes } from '../api/api';
import { toast } from 'react-toastify';

const MinutesList = ({ onViewDetails }) => {
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMinutes();
  }, []);

  const loadMinutes = async () => {
    setLoading(true);
    try {
      const response = await getAllMinutes();
      setMinutes(response.data || []);
    } catch (error) {
      toast.error('Failed to load minutes');
      setMinutes([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete these minutes?')) {
      try {
        // Find the minute to get the correct minute ID
        const minuteToDelete = minutes.find(min => min.id === id);
        if (!minuteToDelete) {
          toast.error('Minute not found in the list');
          return;
        }
        // Use the correct minute ID (not meeting ID)
        const minuteId = minuteToDelete.id || minuteToDelete.Id;
        await deleteMinutes(minuteId);
        setMinutes(prev => prev.filter(min => min.id !== id));
        toast.success('Minutes deleted successfully');
      } catch (error) {
        toast.error('Failed to delete minutes');
      }
    }
  };

  const filteredMinutes = minutes.filter(min =>
    min.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    min.decisions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    min.meeting_id?.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center p-4"><div className="spinner-border"></div></div>;
  }

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search minutes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="list-group">
        {filteredMinutes.length === 0 ? (
          <div className="list-group-item text-center">No minutes found</div>
        ) : (
          filteredMinutes.map((min, index) => (
            <div key={min.id || index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6>Meeting ID: {min.meeting_id}</h6>
                  <p className="mb-1"><strong>Notes:</strong> {min.notes?.substring(0, 100)}...</p>
                  <p className="mb-1"><strong>Decisions:</strong> {min.decisions?.substring(0, 100)}...</p>
                  <p className="mb-1"><strong>Action Items:</strong> {min.action_items?.length || 0}</p>
                  <p className="mb-1"><strong>Attachments:</strong> {min.attachments?.length || 0}</p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onViewDetails(min)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(min.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MinutesList;
