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
      let usersData = [];
      if (response.data.success && response.data.users) {
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.users) {
        usersData = response.data.users;
      } else if (response.data.data) {
        usersData = response.data.data;
      }
      
        // Process users data to handle null values without generating temporary IDs
        const processedUsers = (Array.isArray(usersData) ? usersData : []).map((user) => ({
          ...user,
          // Set default role if null
          role: user.role || "No role assigned",
          // Normalize ID field - use Id if available, otherwise use id, otherwise null
          Id: user.Id !== undefined ? user.Id : (user.id !== undefined ? user.id : null)
        }));
        
        console.log('Processed Users:', processedUsers);
      
      setUsers(processedUsers);
      setMessage('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error fetching users';
      setMessage(errorMsg);
      console.error('Error fetching users:', error);
      
      // Fallback to mock data if API fails
      const mockUsers = [
        { Id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { Id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Employee' },
        { Id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Guest' }
      ];
      setUsers(mockUsers);
      setMessage('Using mock data - API connection issue');
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await api.post('/users', userFormData);
      // Handle different response structures
      let newUser = null;
      if (response.data.success && response.data.user) {
        newUser = response.data.user;
      } else if (response.data.user) {
        newUser = response.data.user;
      } else if (response.data.data) {
        newUser = response.data.data;
      } else {
        newUser = response.data;
      }
      
      if (newUser) {
        setUsers([...users, newUser]);
        setMessage('User added successfully');
        setUserFormData({ name: '', email: '', role: '' });
      } else {
        setMessage('User added but response format unexpected');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error adding user';
      setMessage(errorMsg);
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUser = async () => {
    console.log('Attempting to update user:', selectedUser);
    if (!selectedUser || !selectedUser.Id) {
      setMessage('Cannot update user: Invalid user selection');
      return;
    }
    try {
      const response = await api.put(`/users/${selectedUser.Id}`, userFormData);
      console.log('Update API response:', response.data);
      // Handle different response structures
      let updatedUser = null;
      if (response.data.success && response.data.user) {
        updatedUser = response.data.user;
      } else if (response.data.user) {
        updatedUser = response.data.user;
      } else if (response.data.data) {
        updatedUser = response.data.data;
      } else {
        updatedUser = response.data;
      }
      
      if (updatedUser) {
        setUsers(users.map(u => (u.Id === selectedUser.Id ? updatedUser : u)));
        setMessage('User updated successfully');
        setUserFormData({ name: '', email: '', role: '' });
        setSelectedUser(null);
        console.log('User updated successfully:', selectedUser.Id);
      } else {
        setMessage('User updated but response format unexpected');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || '极速赛车开奖直播 history|极速赛车开奖结果记录查询|极速赛车开奖官网直播Error updating user';
      setMessage(errorMsg);
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    console.log('Attempting to delete user with ID:', id);
    if (!id) {
      setMessage('Cannot delete user: Invalid user ID');
      return;
    }
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.Id !== id));
      setMessage('User deleted successfully');
      console.log('User deleted successfully:', id);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error deleting user';
      setMessage(errorMsg);
      console.error('Error deleting user:', error);
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
          {users.map((user, index) => (
            <tr key={user.Id || `user-${index}`}>
              <td>{user.Id !== null && user.Id !== undefined ? user.Id : 'N/A'}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role || "No role assigned"}</td>
              <td>
                <button onClick={() => { setSelectedUser(user); setUserFormData(user); }}>Edit</button>
                <button onClick={() => handleDeleteUser(user.Id)} disabled={!user.Id}>Delete</button>
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
