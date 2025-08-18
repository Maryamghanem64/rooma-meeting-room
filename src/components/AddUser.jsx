import React, { useState } from 'react';
import api from '../api/api.js';
import '../styles/global.css';

export default function AddUser() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post('/users', formData)
            .then(response => {
                alert('User added successfully!');
                setFormData({ name: '', email: '', password: '' });
            })
            .catch(error => {
                console.error('Error adding user:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add User</h2>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />
            <button type="submit">Add User</button>
        </form>
    );
}