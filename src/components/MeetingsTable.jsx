import React, { useState, useEffect } from 'react';

const MeetingsTable = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('auth_token'); // Assuming token is stored in localStorage
            const response = await fetch('/api/meetings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch meetings');
            }

            const data = await response.json();
            setMeetings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Show confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete this meeting?');

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/meetings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete meeting');
            }

            // Remove the deleted meeting from state
            setMeetings(meetings.filter(meeting => meeting.Id !== id));
            alert('Meeting deleted successfully');
        } catch (err) {
            alert('Error deleting meeting: ' + err.message);
        }
    };

    if (loading) {
        return <div>Loading meetings...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Meetings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Organizer</th>
                        <th>Room</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {meetings.map(meeting => (
                        <tr key={meeting.Id}>
                            <td>{meeting.title}</td>
                            <td>{meeting.user?.name || 'Unknown'}</td>
                            <td>{meeting.room?.name || 'Unknown'}</td>
                            <td>{meeting.startTime}</td>
                            <td>{meeting.endTime}</td>
                            <td>{meeting.type}</td>
                            <td>{meeting.status}</td>
                            <td>
                                <button onClick={() => handleEdit(meeting.Id)}>Edit</button>
                                <button onClick={() => handleDelete(meeting.Id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MeetingsTable;
