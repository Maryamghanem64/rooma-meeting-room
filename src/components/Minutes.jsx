import React, { useState, useEffect } from 'react';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { getAllMinutes } from '../api/api';
import { toast } from 'react-toastify';
import MinutesForm from './MinutesForm';
import MinutesList from './MinutesList';
import ActionItemList from './ActionItemList';
import '../styles/global.css'

const Minutes = () => {
  const [minutes, setMinutes] = useState([]);
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadMinutesData();
  }, []);

  const loadMinutesData = async () => {
    setLoading(true);
    try {
      const response = await getAllMinutes();
      setMinutes(response.data || []);
    } catch (error) {
      console.error('Error loading minutes:', error);
      toast.error('Failed to load minutes');
      setMinutes([]);
    }
    setLoading(false);
  };

  const handleFormSave = () => {
    setIsEditing(false);
    setSelectedMinutes(null);
    loadMinutesData();
  };

  const handleViewDetails = (minutesData) => {
    setSelectedMinutes(minutesData);
    setIsEditing(false);
  };

  const handleEdit = (minutesData) => {
    setSelectedMinutes(minutesData);
    setIsEditing(true);
  };

  // Remove local action item update/delete handlers since handled in form

  // const handleActionItemUpdate = (id, updatedItem) => {
  //   // Update action item in selected minutes
  //   if (selectedMinutes) {
  //     const updatedActionItems = selectedMinutes.action_items.map(item =>
  //       item.id === id ? { ...item, ...updatedItem } : item
  //     );
  //     setSelectedMinutes({ ...selectedMinutes, action_items: updatedActionItems });
  //   }
  // };

  // const handleActionItemDelete = (id) => {
  //   // Delete action item from selected minutes
  //   if (selectedMinutes) {
  //     const updatedActionItems = selectedMinutes.action_items.filter(item => item.id !== id);
  //     setSelectedMinutes({ ...selectedMinutes, action_items: updatedActionItems });
  //   }
  // };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Meeting Minutes", 14, 20);

    const tableColumn = ["Meeting ID", "Notes", "Decisions", "Action Items", "Attachments"];
    const tableRows = [];

    minutes.forEach(min => {
      const row = [
        min.meeting_id,
        min.notes?.substring(0, 50) + (min.notes?.length > 50 ? '...' : ''),
        min.decisions?.substring(0, 50) + (min.decisions?.length > 50 ? '...' : ''),
        min.action_items?.length || 0,
        min.attachments?.length || 0
      ];
      tableRows.push(row);
    });

    if (doc.autoTable) {
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
    } else {
      console.error('jsPDF autoTable plugin is not loaded.');
    }
    doc.save("minutes.pdf");
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div><p>Loading minutes...</p></div>;

  return (
    <div className="container my-4">
      <h1 className="mb-4">Meeting Minutes</h1>

      <div className="mb-3 d-flex gap-2">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-control" />
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="finalized">Finalized</option>
        </select>
        <button className="btn btn-primary" onClick={() => { setIsEditing(true); setSelectedMinutes(null); }}>New Minutes</button>
        <button className="btn btn-info" onClick={exportPDF}>Export PDF</button>
        <CSVLink
          data={minutes.map(m => ({
            MeetingID: m.meeting_id,
            Notes: m.notes,
            Decisions: m.decisions,
            ActionItems: m.action_items?.length || 0,
            Attachments: m.attachments?.length || 0
          }))}
          filename="minutes.csv"
          className="btn btn-secondary"
        >
          Export CSV
        </CSVLink>
      </div>

      <div className="row">
        <div className="col-md-6">
          <MinutesList
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
          />
        </div>

        <div className="col-md-6">
          {isEditing ? (
            <div className="card p-3">
              <h5>{selectedMinutes ? 'Edit Minutes' : 'Create New Minutes'}</h5>
              <MinutesForm
                meetingId={selectedMinutes?.meeting_id}
                minutesData={selectedMinutes}
                onSave={handleFormSave}
                onCancel={() => { setIsEditing(false); setSelectedMinutes(null); }}
              />
            </div>
          ) : selectedMinutes ? (
            <div className="card p-3">
              <h5>Minutes Details</h5>
              <p><strong>Meeting ID:</strong> {selectedMinutes.meeting_id}</p>
              <p><strong>Notes:</strong> {selectedMinutes.notes}</p>
              <p><strong>Decisions:</strong> {selectedMinutes.decisions}</p>
              {selectedMinutes.attachments && selectedMinutes.attachments.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <ul>
                    {selectedMinutes.attachments.map((att, idx) => (
                      <li key={idx}>{att.name || `Attachment ${idx + 1}`}</li>
                    ))}
                  </ul>
                </div>
              )}
          <ActionItemList
            actionItems={selectedMinutes.action_items || []}
            allowAdd={false}
            // Remove onUpdate, onDelete, onAdd handlers here since editing is in form
            // onUpdate={handleActionItemUpdate}
            // onDelete={handleActionItemDelete}
            // onAdd={(newItem) => {
            //   // Add new action item to selectedMinutes
            //   const updatedActionItems = [...(selectedMinutes.action_items || []), newItem];
            //   setSelectedMinutes({ ...selectedMinutes, action_items: updatedActionItems });
            // }}
          />
              <div className="mt-3">
                <button className="btn btn-primary" onClick={() => handleEdit(selectedMinutes)}>Edit</button>
              </div>
            </div>
          ) : (
            <div className="card p-3 text-center">
              <p>Select minutes to view details or create new minutes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Minutes;
