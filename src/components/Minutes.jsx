import React, { useState, useEffect } from 'react';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { getAllMinutes, createMinutes, updateMinutes, deleteMinutes } from '../api/api';
import { toast } from 'react-toastify';
import '../styles/global.css'

const Minutes = () => {
  const [minutes, setMinutes] = useState([]);
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newMinutes, setNewMinutes] = useState({
    meetingTitle: '',
    date: '',
    attendees: [],
    agenda: '',
    decisions: '',
    actionItems: [],
    attachments: [],
    status: 'draft'
  });

  const [actionItems, setActionItems] = useState([]);
  const [newActionItem, setNewActionItem] = useState({
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadMinutesData();
  }, []);

  const loadMinutesData = async () => {
    setLoading(true);

    try {
      const response = await getAllMinutes();
      setMinutes(response.data);
    } catch (error) {
      console.error('Error loading minutes:', error);
      toast.error('Failed to load minutes, using demo data');

      // Fallback to mock data
      setMinutes([
        {
          id: 1,
          meetingTitle: 'Weekly Team Standup',
          date: '2024-01-15',
          attendees: ['User', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
          agenda: 'Project updates, Sprint planning, Team feedback',
          decisions: 'Approved new feature development timeline',
          actionItems: [
            { id: 1, description: 'Complete user research', assignee: 'User', dueDate: '2024-01-20', priority: 'high', status: 'pending' },
            { id: 2, description: 'Update project documentation', assignee: 'Jane Smith', dueDate: '2024-01-18', priority: 'medium', status: 'completed' }
          ],
          status: 'finalized',
        },
        {
          id: 2,
          meetingTitle: 'Project Review Meeting',
          date: '2024-01-14',
          attendees: ['User', 'Jane Smith', 'David Brown'],
          agenda: 'Review Q4 results, Plan Q1 objectives',
          decisions: 'Increased budget for marketing campaign',
          actionItems: [
            { id: 3, description: 'Prepare budget proposal', assignee: 'David Brown', dueDate: '2024-01-25', priority: 'high', status: 'pending' }
          ],
          status: 'draft',
        }
      ]);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMinutes(prev => ({ ...prev, [name]: value }));
  };

  const addActionItem = () => {
    if (newActionItem.description && newActionItem.assignee) {
      const actionItem = { id: Date.now(), ...newActionItem, status: 'pending' };
      setActionItems(prev => [...prev, actionItem]);
      setNewMinutes(prev => ({ ...prev, actionItems: [...prev.actionItems, actionItem] }));
      setNewActionItem({ description: '', assignee: '', dueDate: '', priority: 'medium' });
    }
  };

  const removeActionItem = (id) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
    setNewMinutes(prev => ({ ...prev, actionItems: prev.actionItems.filter(item => item.id !== id) }));
  };

  const saveMinutes = async (status = 'draft') => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const minutesData = { ...newMinutes, status, id: Date.now() };
    setMinutes(prev => [minutesData, ...prev]);
    setNewMinutes({ meetingTitle: '', date: '', attendees: [], agenda: '', decisions: '', actionItems: [], attachments: [], status: 'draft' });
    setActionItems([]);
    setIsEditing(false);
    setLoading(false);
    alert(`Minutes ${status === 'draft' ? 'saved as draft' : 'finalized'} successfully!`);
  };

  const filteredMinutes = minutes.filter(min => {
    const matchesSearch = min.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          min.attendees.some(att => att.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || min.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'badge bg-danger';
      case 'medium': return 'badge bg-warning text-dark';
      case 'low': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'finalized': return 'badge bg-success';
      case 'draft': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Meeting Minutes", 14, 20);

    const tableColumn = ["Title", "Date", "Attendees", "Decisions", "Status"];
    const tableRows = [];

    minutes.forEach(min => {
      const attendees = min.attendees.join(", ");
      const row = [min.meetingTitle, min.date, attendees, min.decisions, min.status];
      tableRows.push(row);
    });

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
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
        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>New Minutes</button>
        <button className="btn btn-info" onClick={exportPDF}>Export PDF</button>
        <CSVLink
          data={minutes.map(m => ({ Title: m.meetingTitle, Date: m.date, Attendees: m.attendees.join(", "), Decisions: m.decisions, Status: m.status }))}
          filename="minutes.csv"
          className="btn btn-secondary"
        >
          Export CSV
        </CSVLink>
      </div>

      <div className="row">
        <div className="col-md-6">
          <ul className="list-group">
            {filteredMinutes.length === 0 ? <li className="list-group-item">No minutes found</li> :
              filteredMinutes.map(min => (
                <li key={min.id} className="list-group-item d-flex justify-content-between align-items-start" onClick={() => setSelectedMinutes(min)}>
                  <div>
                    <div className="fw-bold">{min.meetingTitle}</div>
                    <small>{min.date} • {min.attendees.length} attendees</small>
                  </div>
                  <span className={getStatusClass(min.status)}>{min.status}</span>
                </li>
              ))
            }
          </ul>
        </div>

        <div className="col-md-6">
          {isEditing ? (
            <div className="card p-3">
              <h5>Create New Minutes</h5>
              <input type="text" className="form-control mb-2" placeholder="Title" name="meetingTitle" value={newMinutes.meetingTitle} onChange={handleChange} />
              <input type="date" className="form-control mb-2" name="date" value={newMinutes.date} onChange={handleChange} />
              <textarea className="form-control mb-2" placeholder="Attendees comma-separated" value={newMinutes.attendees.join(", ")}
                onChange={e => setNewMinutes(prev => ({ ...prev, attendees: e.target.value.split(',').map(a => a.trim()) }))}></textarea>
              <textarea className="form-control mb-2" placeholder="Agenda" name="agenda" value={newMinutes.agenda} onChange={handleChange}></textarea>
              <textarea className="form-control mb-2" placeholder="Decisions" name="decisions" value={newMinutes.decisions} onChange={handleChange}></textarea>

              <h6>Action Items</h6>
              {actionItems.map(item => (
                <div key={item.id} className="d-flex justify-content-between align-items-center mb-1">
                  <span>{item.description} ({item.assignee})</span>
                  <span className={getPriorityClass(item.priority)}>{item.priority}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => removeActionItem(item.id)}>x</button>
                </div>
              ))}
              <div className="d-flex gap-2 mb-2">
                <input type="text" className="form-control" placeholder="Description" value={newActionItem.description} onChange={e => setNewActionItem(prev => ({ ...prev, description: e.target.value }))} />
                <input type="text" className="form-control" placeholder="Assignee" value={newActionItem.assignee} onChange={e => setNewActionItem(prev => ({ ...prev, assignee: e.target.value }))} />
                <button className="btn btn-success" onClick={addActionItem}>Add</button>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-secondary" onClick={() => saveMinutes('draft')}>Save Draft</button>
                <button className="btn btn-primary" onClick={() => saveMinutes('finalized')}>Finalize</button>
                <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : selectedMinutes ? (
            <div className="card p-3">
              <h5>{selectedMinutes.meetingTitle}</h5>
              <p>{selectedMinutes.date}</p>
              <p><strong>Attendees:</strong> {selectedMinutes.attendees.join(", ")}</p>
              <p><strong>Agenda:</strong> {selectedMinutes.agenda}</p>
              <p><strong>Decisions:</strong> {selectedMinutes.decisions}</p>
              <h6>Action Items:</h6>
              {selectedMinutes.actionItems.map(item => (
                <div key={item.id} className="d-flex justify-content-between align-items-center mb-1">
                  <span>{item.description} ({item.assignee})</span>
                  <span className={getPriorityClass(item.priority)}>{item.priority}</span>
                  <span className={item.status === 'completed' ? 'badge bg-success' : 'badge bg-warning text-dark'}>{item.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-3 text-center">
              <p>No minute selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Minutes;
