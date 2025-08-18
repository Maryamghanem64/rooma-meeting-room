import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import '../styles/global.css';

export default function UsersList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/users')
            .then(response => {
                setUsers(response.data);
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
                    <li key={user.id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
}