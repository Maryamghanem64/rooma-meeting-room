import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TypingEffect from './TypingEffect';

const Minutes = () => {
  // State for minutes data
  const [minutes, setMinutes] = useState([]);
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for new minutes form
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

  // State for action items
  const [actionItems, setActionItems] = useState([]);
  const [newActionItem, setNewActionItem] = useState({
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium'
  });

  // Navigation
  const navigate = useNavigate();

  // Load minutes data
  useEffect(() => {
    loadMinutesData();
  }, []);

  // Load minutes data
  const loadMinutesData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock minutes data
    setMinutes([
      {
        id: 1,
        meetingTitle: 'Weekly Team Standup',
        date: '2024-01-15',
        attendees: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
        agenda: 'Project updates, Sprint planning, Team feedback',
        decisions: 'Approved new feature development timeline',
        actionItems: [
          { id: 1, description: 'Complete user research', assignee: 'John Doe', dueDate: '2024-01-20', priority: 'high', status: 'pending' },
          { id: 2, description: 'Update project documentation', assignee: 'Jane Smith', dueDate: '2024-01-18', priority: 'medium', status: 'completed' }
        ],
        status: 'finalized',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        meetingTitle: 'Project Review Meeting',
        date: '2024-01-14',
        attendees: ['John Doe', 'Jane Smith', 'David Brown'],
        agenda: 'Review Q4 results, Plan Q1 objectives',
        decisions: 'Increased budget for marketing campaign',
        actionItems: [
          { id: 3, description: 'Prepare budget proposal', assignee: 'David Brown', dueDate: '2024-01-25', priority: 'high', status: 'pending' }
        ],
        status: 'draft',
        createdAt: '2024-01-14T14:30:00Z'
      }
    ]);
    
    setLoading(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMinutes(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add action item
  const addActionItem = () => {
    if (newActionItem.description && newActionItem.assignee) {
      const actionItem = {
        id: Date.now(),
        ...newActionItem,
        status: 'pending'
      };
      
      setActionItems(prev => [...prev, actionItem]);
      setNewMinutes(prev => ({
        ...prev,
        actionItems: [...prev.actionItems, actionItem]
      }));
      
      setNewActionItem({
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium'
      });
    }
  };

  // Remove action item
  const removeActionItem = (id) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
    setNewMinutes(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== id)
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setNewMinutes(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setNewMinutes(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment.id !== id)
    }));
  };

  // Save minutes
  const saveMinutes = async (status = 'draft') => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const minutesData = {
        ...newMinutes,
        status,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      setMinutes(prev => [minutesData, ...prev]);
      setNewMinutes({
        meetingTitle: '',
        date: '',
        attendees: [],
        agenda: '',
        decisions: '',
        actionItems: [],
        attachments: [],
        status: 'draft'
      });
      setActionItems([]);
      
      alert(`Minutes ${status === 'draft' ? 'saved as draft' : 'finalized and shared'} successfully!`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save minutes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter minutes
  const filteredMinutes = minutes.filter(minute => {
    const matchesSearch = minute.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         minute.attendees.some(attendee => attendee.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || minute.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger-color bg-red-50';
      case 'medium': return 'text-warning-color bg-yellow-50';
      case 'low': return 'text-success-color bg-green-50';
      default: return 'text-meeting-slate bg-gray-50';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'finalized': return 'text-success-color bg-green-50';
      case 'draft': return 'text-warning-color bg-yellow-50';
      default: return 'text-meeting-slate bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots flex items-center justify-center">
        <div className="text-center animate-zoom-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-meeting-slate">Loading minutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-down">
          <h1 className="text-3xl font-bold text-meeting-navy mb-2">
            <i className="fas fa-file-alt mr-3 text-meeting-blue animate-rotate-in"></i>
            <TypingEffect text="Meeting Minutes" speed={50} />
          </h1>
          <p className="text-meeting-slate">
            Create, manage, and review meeting minutes
          </p>
        </div>

        <div className="grid grid-2 gap-8">
          {/* Minutes List */}
          <div className="col-1">
            <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-left">
              <div className="card-header bg-gradient-to-r from-meeting-blue to-meeting-navy text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    <i className="fas fa-list mr-2 text-meeting-accent animate-rotate-in"></i>
                    All Minutes
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-sm bg-white text-meeting-navy hover:bg-meeting-cream hover-lift"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    New Minutes
                  </button>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="card-body border-b border-meeting-slate">
                <div className="grid grid-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search minutes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input pl-10 focus:border-meeting-blue"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-meeting-slate"></i>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-select focus:border-meeting-blue"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="finalized">Finalized</option>
                  </select>
                </div>
              </div>

              <div className="card-body p-0">
                {filteredMinutes.length === 0 ? (
                  <div className="p-6 text-center text-meeting-slate">
                    <i className="fas fa-file-alt text-4xl mb-3 animate-bounce"></i>
                    <p>No minutes found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-meeting-slate">
                    {filteredMinutes.map((minute, index) => (
                      <div
                        key={minute.id}
                        className="p-4 hover:bg-meeting-cream transition-colors cursor-pointer animate-slide-in-left"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => setSelectedMinutes(minute)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-meeting-navy mb-1">{minute.meetingTitle}</h3>
                            <p className="text-sm text-meeting-slate mb-2">
                              {new Date(minute.date).toLocaleDateString()} • {minute.attendees.length} attendees
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(minute.status)}`}>
                                {minute.status.charAt(0).toUpperCase() + minute.status.slice(1)}
                              </span>
                              <span className="text-xs text-meeting-slate">
                                {minute.actionItems.filter(item => item.status === 'pending').length} pending actions
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="btn btn-sm btn-outline text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                              <i className="fas fa-download"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Minutes Editor/Viewer */}
          <div className="col-1">
            {isEditing ? (
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right">
                <div className="card-header bg-gradient-to-r from-success-color to-green-600 text-white">
                  <h2 className="text-xl font-semibold">
                    <i className="fas fa-edit mr-2 text-white animate-rotate-in"></i>
                    Create New Minutes
                  </h2>
                </div>
                <div className="card-body">
                  <form className="space-y-6">
                    {/* Meeting Title */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-heading mr-2 text-meeting-blue"></i>
                        Meeting Title *
                      </label>
                      <input
                        type="text"
                        name="meetingTitle"
                        value={newMinutes.meetingTitle}
                        onChange={handleChange}
                        className="form-input focus:border-meeting-blue"
                        placeholder="Enter meeting title"
                      />
                    </div>

                    {/* Date */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-calendar mr-2 text-meeting-blue"></i>
                        Meeting Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={newMinutes.date}
                        onChange={handleChange}
                        className="form-input focus:border-meeting-blue"
                      />
                    </div>

                    {/* Attendees */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-users mr-2 text-meeting-blue"></i>
                        Attendees
                      </label>
                      <textarea
                        name="attendees"
                        value={newMinutes.attendees.join(', ')}
                        onChange={(e) => setNewMinutes(prev => ({
                          ...prev,
                          attendees: e.target.value.split(',').map(name => name.trim()).filter(name => name)
                        }))}
                        className="form-input focus:border-meeting-blue"
                        rows="3"
                        placeholder="Enter attendee names separated by commas"
                      ></textarea>
                    </div>

                    {/* Agenda */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-list mr-2 text-meeting-blue"></i>
                        Agenda
                      </label>
                      <textarea
                        name="agenda"
                        value={newMinutes.agenda}
                        onChange={handleChange}
                        className="form-input focus:border-meeting-blue"
                        rows="4"
                        placeholder="Meeting agenda items..."
                      ></textarea>
                    </div>

                    {/* Decisions */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-gavel mr-2 text-meeting-blue"></i>
                        Decisions Made
                      </label>
                      <textarea
                        name="decisions"
                        value={newMinutes.decisions}
                        onChange={handleChange}
                        className="form-input focus:border-meeting-blue"
                        rows="4"
                        placeholder="Key decisions made during the meeting..."
                      ></textarea>
                    </div>

                    {/* Action Items */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-tasks mr-2 text-meeting-blue"></i>
                        Action Items
                      </label>
                      
                      {/* Action Items List */}
                      {actionItems.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {actionItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-meeting-cream rounded-lg animate-fade-in">
                              <div className="flex-1">
                                <p className="font-medium text-meeting-navy">{item.description}</p>
                                <p className="text-sm text-meeting-slate">
                                  Assigned to: {item.assignee} • Due: {item.dueDate}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                  {item.priority}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeActionItem(item.id)}
                                  className="text-danger-color hover:text-red-700 hover-scale"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Action Item Form */}
                      <div className="border border-meeting-slate rounded-lg p-4 bg-meeting-cream">
                        <div className="grid grid-2 gap-4 mb-3">
                          <input
                            type="text"
                            placeholder="Action item description"
                            value={newActionItem.description}
                            onChange={(e) => setNewActionItem(prev => ({ ...prev, description: e.target.value }))}
                            className="form-input focus:border-meeting-blue"
                          />
                          <input
                            type="text"
                            placeholder="Assignee"
                            value={newActionItem.assignee}
                            onChange={(e) => setNewActionItem(prev => ({ ...prev, assignee: e.target.value }))}
                            className="form-input focus:border-meeting-blue"
                          />
                        </div>
                        <div className="grid grid-2 gap-4 mb-3">
                          <input
                            type="date"
                            placeholder="Due date"
                            value={newActionItem.dueDate}
                            onChange={(e) => setNewActionItem(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="form-input focus:border-meeting-blue"
                          />
                          <select
                            value={newActionItem.priority}
                            onChange={(e) => setNewActionItem(prev => ({ ...prev, priority: e.target.value }))}
                            className="form-select focus:border-meeting-blue"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={addActionItem}
                          className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Action Item
                        </button>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="form-group">
                      <label className="form-label text-meeting-navy">
                        <i className="fas fa-paperclip mr-2 text-meeting-blue"></i>
                        Attachments
                      </label>
                      
                      {/* File Upload */}
                      <div className="border-2 border-dashed border-meeting-slate rounded-lg p-6 text-center bg-meeting-cream hover:border-meeting-blue transition-colors">
                        <i className="fas fa-cloud-upload-alt text-3xl text-meeting-slate mb-3 animate-bounce"></i>
                        <p className="text-meeting-slate mb-2">Drop files here or click to upload</p>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="btn btn-outline cursor-pointer text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                          <i className="fas fa-upload mr-2"></i>
                          Choose Files
                        </label>
                      </div>

                      {/* Attachments List */}
                      {newMinutes.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {newMinutes.attachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-meeting-cream rounded-lg animate-fade-in">
                              <div className="flex items-center space-x-3">
                                <i className="fas fa-file text-meeting-slate"></i>
                                <div>
                                  <p className="font-medium text-meeting-navy">{attachment.name}</p>
                                  <p className="text-sm text-meeting-slate">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="text-danger-color hover:text-red-700 hover-scale"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => saveMinutes('draft')}
                        disabled={loading}
                        className="btn btn-secondary flex-1 hover-lift"
                      >
                        {loading ? (
                          <>
                            <div className="spinner w-5 h-5"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            Save Draft
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => saveMinutes('finalized')}
                        disabled={loading}
                        className="btn btn-primary flex-1 hover-lift"
                      >
                        {loading ? (
                          <>
                            <div className="spinner w-5 h-5"></div>
                            Finalizing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check mr-2"></i>
                            Finalize & Share
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : selectedMinutes ? (
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right">
                <div className="card-header bg-gradient-to-r from-meeting-blue to-meeting-navy text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      <i className="fas fa-eye mr-2 text-meeting-accent animate-rotate-in"></i>
                      Minutes Details
                    </h2>
                    <div className="flex space-x-2">
                      <button className="btn btn-sm bg-white text-meeting-navy hover:bg-meeting-cream hover-lift">
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button className="btn btn-sm bg-white text-meeting-navy hover:bg-meeting-cream hover-lift">
                        <i className="fas fa-download mr-1"></i>
                        Export
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-meeting-navy mb-2">{selectedMinutes.meetingTitle}</h3>
                      <p className="text-meeting-slate">
                        {new Date(selectedMinutes.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-meeting-navy mb-2">
                        <i className="fas fa-users mr-2 text-meeting-blue"></i>
                        Attendees
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMinutes.attendees.map((attendee, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-meeting-blue text-white animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            {attendee}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-meeting-navy mb-2">
                        <i className="fas fa-list mr-2 text-meeting-blue"></i>
                        Agenda
                      </h4>
                      <p className="text-meeting-slate">{selectedMinutes.agenda}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-meeting-navy mb-2">
                        <i className="fas fa-gavel mr-2 text-meeting-blue"></i>
                        Decisions
                      </h4>
                      <p className="text-meeting-slate">{selectedMinutes.decisions}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-meeting-navy mb-2">
                        <i className="fas fa-tasks mr-2 text-meeting-blue"></i>
                        Action Items
                      </h4>
                      <div className="space-y-2">
                        {selectedMinutes.actionItems.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-meeting-cream rounded-lg animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex-1">
                              <p className="font-medium text-meeting-navy">{item.description}</p>
                              <p className="text-sm text-meeting-slate">
                                Assigned to: {item.assignee} • Due: {item.dueDate}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'completed' ? 'text-success-color bg-green-50' : 'text-warning-color bg-yellow-50'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right">
                <div className="card-body text-center py-12">
                  <i className="fas fa-file-alt text-4xl text-meeting-slate mb-4 animate-bounce"></i>
                  <h3 className="text-lg font-medium text-meeting-navy mb-2">No Minutes Selected</h3>
                  <p className="text-meeting-slate mb-4">Select a meeting from the list to view its minutes</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary hover-lift"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create New Minutes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Minutes;
