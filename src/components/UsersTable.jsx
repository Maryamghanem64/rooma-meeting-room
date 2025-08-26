import React, { useEffect, useState } from 'react';
import api from '../api/api';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Handle different possible response structures
      const usersData = response.data.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      setMessage('Error fetching users');
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await api.post('/users', userFormData);
      // Handle different response structures
      const newUser = response.data.user || response.data;
      if (newUser) {
        setUsers([...users, newUser]);
        setMessage('User added successfully');
        setUserFormData({ name: '', email: '', role: '' });
      } else {
        setMessage('User added but response format unexpected');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setMessage('Error adding user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await api.put(`/users/${selectedUser.id}`, userFormData);
      // Handle different response structures
      const updatedUser = response.data.user || response.data;
      if (updatedUser) {
        setUsers(users.map(u => (u.id === selectedUser.id ? updatedUser : u)));
        setMessage('User updated successfully');
        setUserFormData({ name: '', email: '', role: '' });
        setSelectedUser(null);
      } else {
        setMessage('User updated but response format unexpected');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('Error updating user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setMessage('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Error deleting user');
    }
  };

  return (
    <div>
      <h3>Users Management</h3>
      {message && <div className="alert alert-info">{message}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => { setSelectedUser(user); setUserFormData(user); }}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>{selectedUser ? 'Edit User' : 'Add User'}</h4>
      <input
        type="text"
        placeholder="Name"
        value={userFormData.name}
        onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={userFormData.email}
        onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Role"
        value={userFormData.role}
        onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
      />
      <button onClick={selectedUser ? handleUpdateUser : handleAddUser}>
        {selectedUser ? 'Update User' : 'Add User'}
      </button>
    </div>
  );
};

export default UsersTable;
