import React, { useState, useEffect } from 'react';
import { getUsers } from '../api/api';
import { toast } from 'react-toastify';

const ActionItemList = ({ actionItems, onUpdate, onDelete, onAdd, allowAdd = true }) => {
  const [users, setUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({
    task: '',
    assigned_to: '',
    due_date: '',
    status: 'pending'
  });
  const [newItemForm, setNewItemForm] = useState({
    task: '',
    assigned_to: '',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();

        // Handle different response structures like AdminPanel.jsx
        let usersData = [];
        if (response.data && Array.isArray(response.data)) {
          // Direct array response
          usersData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Laravel paginated response with data property
          usersData = response.data.data;
        } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
          // Custom response with users property
          usersData = response.data.users;
        }

        // Process users data to handle Laravel response structure
        const processedUsers = usersData.map((user) => {
          // Handle different ID field names from Laravel
          const userId = user.Id !== undefined ? user.Id :
                        user.id !== undefined ? user.id :
                        user.user_id !== undefined ? user.user_id : null;

          return {
            ...user,
            id: userId,
            displayName: user.name || user.email || `User ${userId}`
          };
        });

        setUsers(processedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      task: item.task || '',
      assigned_to: item.assigned_to || '',
      due_date: item.due_date || '',
      status: item.status || 'pending'
    });
  };

  const handleSave = () => {
    if (!editForm.task.trim()) {
      toast.error('Task description is required');
      return;
    }
    onUpdate(editingItem.id, editForm);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditForm({ task: '', assigned_to: '', due_date: '', status: 'pending' });
  };

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleAddSave = () => {
    if (!newItemForm.task.trim()) {
      toast.error('Task description is required');
      return;
    }
    if (onAdd) {
      onAdd({
        ...newItemForm,
        id: Date.now(), // Temporary ID for frontend
        created_at: new Date().toISOString()
      });
      setNewItemForm({ task: '', assigned_to: '', due_date: '', status: 'pending' });
      setShowAddForm(false);
      toast.success('Action item added successfully');
    } else {
      toast.error('Unable to add action item');
    }
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
    setNewItemForm({ task: '', assigned_to: '', due_date: '', status: 'pending' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'badge bg-warning text-dark';
      case 'in_progress': return 'badge bg-info text-dark';
      case 'done': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id == userId);
    return user ? user.displayName : `User ${userId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="action-items-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Action Items ({actionItems?.length || 0})</h6>
        {allowAdd && (
          <button
            className="btn btn-sm btn-success"
            onClick={handleAddNew}
            disabled={showAddForm}
          >
            <i className="fas fa-plus me-1"></i>Add Action Item
          </button>
        )}
      </div>

      {/* Add New Action Item Form */}
      {showAddForm && (
        <div className="card mb-3 border-success">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0">Add New Action Item</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Task Description *</label>
                <textarea
                  className="form-control"
                  placeholder="Describe the action item..."
                  value={newItemForm.task}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, task: e.target.value }))}
                  rows="2"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Assigned To</label>
                <select
                  className="form-select"
                  value={newItemForm.assigned_to}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newItemForm.due_date}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={newItemForm.status}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="col-12">
                <div className="d-flex gap-2">
                  <button className="btn btn-success" onClick={handleAddSave}>
                    <i className="fas fa-save me-1"></i>Save Action Item
                  </button>
                  <button className="btn btn-secondary" onClick={handleAddCancel}>
                    <i className="fas fa-times me-1"></i>Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Items List */}
      {actionItems && actionItems.length > 0 ? (
        <div className="action-items-list">
          {actionItems.map(item => (
            <div key={item.id} className="card mb-2">
              <div className="card-body p-3">
                {editingItem && editingItem.id === item.id ? (
                  <div className="edit-form">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Task Description *</label>
                        <textarea
                          className="form-control"
                          placeholder="Describe the action item..."
                          value={editForm.task}
                          onChange={(e) => setEditForm(prev => ({ ...prev, task: e.target.value }))}
                          rows="2"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Assigned To</label>
                        <select
                          className="form-select"
                          value={editForm.assigned_to}
                          onChange={(e) => setEditForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                        >
                          <option value="">Select user</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.displayName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Due Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editForm.due_date}
                          onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <div className="d-flex gap-2">
                          <button className="btn btn-primary btn-sm" onClick={handleSave}>
                            <i className="fas fa-save me-1"></i>Save
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
                            <i className="fas fa-times me-1"></i>Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="action-item-display">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <h6 className="mb-2">{item.task}</h6>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <small className="text-muted">
                              <i className="fas fa-user me-1"></i>
                              <strong>Assigned to:</strong> {getUserName(item.assigned_to)}
                            </small>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              <strong>Due:</strong> {formatDate(item.due_date)}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEdit(item)}
                          title="Edit action item"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this action item?')) {
                              onDelete(item.id);
                            }
                          }}
                          title="Delete action item"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${getStatusBadge(item.status)} fs-6 px-2 py-1`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {item.created_at && (
                        <small className="text-muted">
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-clipboard-list fa-2x mb-2"></i>
          <p className="mb-2">No action items yet</p>
          {allowAdd && (
            <button
              className="btn btn-outline-success btn-sm"
              onClick={handleAddNew}
              disabled={showAddForm}
            >
              <i className="fas fa-plus me-1"></i>Add First Action Item
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionItemList;
