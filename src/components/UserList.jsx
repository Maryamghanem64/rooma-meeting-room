import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import '../styles/global.css';

export default function UsersList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/users')
            .then(response => {
                const usersData = response.data;
                // Normalize user data to handle Id capitalization
                const processedUsers = (Array.isArray(usersData) ? usersData : []).map((user) => ({
                    ...user,
                    Id: user.Id !== undefined ? user.Id : (user.id !== undefined ? user.id : null)
                }));
                setUsers(processedUsers);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    return (
        <div>
            <h2>Users List</h2>
            <ul>
                {users.map(user => (
                    <li key={user.Id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
}