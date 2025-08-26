import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TypingEffect from "./TypingEffect";
import api from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";

const AdminPanel = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data
  const [analytics, setAnalytics] = useState({});
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // Modals
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Profile Forms
  const [profileFormData, setProfileFormData] = useState({ name: "", email: "" });
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Room Forms
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showEditRoom, setShowEditRoom] = useState(false);
  
  // User Forms
  const [userFormData, setUserFormData] = useState({ name: "", email: "", role: "" });
  const [roomFormData, setRoomFormData] = useState({ name: "", users: 0, features: "" });

  // Messages
  const [userError, setUserError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await api.get('/users');
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.users || []);
          setAnalytics(prev => ({ ...prev, totalUsers: usersResponse.data.users?.length || 0 }));
        }
        setAnalytics(prev => ({ ...prev, totalRooms: 5, totalMeetings: 8 }));
        setRooms([
          { id: 1, name: "Room A", users: 4, features: "Projector" },
          { id: 2, name: "Room B", users: 2, features: "Whiteboard" },
        ]);
        setMeetings([
          { id: 1, title: "Team Sync", organizer: "Alice", date: "2025-08-21", status: "Pending" },
          { id: 2, title: "Project Review", organizer: "Bob", date: "2025-08-22", status: "Ongoing" },
        ]);
        setLoading(false);
      } catch (error) {
        setAnalytics({ totalRooms: 5, totalUsers: 0, totalMeetings: 8 });
        setRooms([
          { id: 1, name: "Room A", users: 4, features: "Projector" },
          { id: 2, name: "Room B", users: 2, features: "Whiteboard" },
        ]);
        setMeetings([
          { id: 1, title: "Team Sync", organizer: "Alice", date: "2025-08-21", status: "Pending" },
          { id: 2, title: "Project Review", organizer: "Bob", date: "2025-08-22", status: "Ongoing" },
        ]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) setProfileFormData({ name: user.name || "", email: user.email || "" });
  }, [user]);

  const handleProfileInputChange = e => setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  const handleUserInputChange = e => setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  const handleRoomInputChange = e => setRoomFormData({ ...roomFormData, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    if (!profileFormData.email.includes('@')) return setProfileError("Invalid email");
    setProfileLoading(true);
    try {
      const result = await updateProfile(profileFormData, user?.id);
      if (result.success) {
        setProfileSuccess("Profile updated!");
        setTimeout(() => setShowEditProfile(false), 1500);
      } else setProfileError(result.error || "Failed to update");
    } catch {
      setProfileError("Server error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!userFormData.email.includes('@')) return setUserError("Invalid email");
    setUserLoading(true);
    try {
      const result = await api.post('/users', userFormData);
      if (result.data.success) {
        setUsers([...users, result.data.user]);
        setShowAddUser(false);
      } else setUserError("Failed to add user");
    } catch {
      setUserError("Server error");
    } finally { setUserLoading(false); }
  };

  const handleSaveUser = async () => {
    if (!userFormData.email.includes('@')) return setUserError("Invalid email");
    setUserLoading(true);
    try {
      const result = await api.put(`/users/${selectedUser.id}`, userFormData);
      if (result.data.success) {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userFormData } : u));
        setShowEditUser(false);
      } else setUserError("Failed to update user");
    } catch { setUserError("Server error"); }
    finally { setUserLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const result = await api.delete(`/users/${id}`);
      if (result.data.success) setUsers(users.filter(u => u.id !== id));
    } catch { setUserError("Server error"); }
  };

  const handleAddRoom = () => {
    if (!roomFormData.name.trim()) return;
    setRooms([...rooms, { id: Date.now(), ...roomFormData }]);
    setShowAddRoom(false);
  };

  const handleSaveRoom = () => {
    setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, ...roomFormData } : r));
    setShowEditRoom(false);
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"/></div>;

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Admin Panel</h2>
        <TypingEffect text="Manage rooms, users, and meetings" />
      </div>

      <ul className="nav nav-tabs mb-4">
        {["dashboard", "users", "rooms", "meetings", "profile"].map(tab => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === "dashboard" && (
        <div className="row mb-4">
          {[
            { title: "Total Rooms", value: analytics.totalRooms, icon: "fas fa-door-open" },
            { title: "Total Users", value: analytics.totalUsers, icon: "fas fa-users" },
            { title: "Total Meetings", value: analytics.totalMeetings, icon: "fas fa-calendar-alt" },
          ].map((c, i) => (
            <div className="col-md-4 mb-3" key={i}>
              <div className="card shadow-sm text-center p-3">
                <i className={`${c.icon} fa-2x mb-2 text-primary`}></i>
                <h5>{c.title}</h5>
                <p className="display-6">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5>Users</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddUser(true)}>+ Add User</button>
          </div>
          <div className="card-body table-responsive">
            <table className="table table-hover">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setSelectedUser(u); setUserFormData(u); setShowEditUser(true); }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "rooms" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5>Rooms</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddRoom(true)}>+ Add Room</button>
          </div>
          <div className="card-body table-responsive">
            <table className="table table-hover">
              <thead><tr><th>Name</th><th>Users</th><th>Features</th><th>Actions</th></tr></thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td><td>{r.users}</td><td>{r.features}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setSelectedRoom(r); setRoomFormData(r); setShowEditRoom(true); }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setRooms(rooms.filter(x => x.id !== r.id))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "meetings" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header"><h5>Meetings</h5><input className="form-control mt-2" placeholder="Search meetings..."/></div>
          <div className="card-body table-responsive">
            <table className="table table-hover">
              <thead><tr><th>Title</th><th>Organizer</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {meetings.map(m => (<tr key={m.id}><td>{m.title}</td><td>{m.organizer}</td><td>{m.date}</td><td>{m.status}</td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5>Profile</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
          </div>
          <div className="card-body">
            <p className="text-muted"><strong>Name:</strong> {user?.name}</p>
            <p className="text-muted"><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddUser && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Add User</h5><button className="btn-close" onClick={() => setShowAddUser(false)}></button></div>
          <div className="modal-body">
            <input className="form-control mb-2" placeholder="Name" name="name" value={userFormData.name} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" placeholder="Email" name="email" value={userFormData.email} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" placeholder="Role" name="role" value={userFormData.role} onChange={handleUserInputChange}/>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddUser}>Save</button>
          </div>
        </div></div></div>
      )}

      {showEditUser && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Edit User</h5><button className="btn-close" onClick={() => setShowEditUser(false)}></button></div>
          <div className="modal-body">
            <input className="form-control mb-2" name="name" value={userFormData.name} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" name="email" value={userFormData.email} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" name="role" value={userFormData.role} onChange={handleUserInputChange}/>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowEditUser(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveUser}>Save</button>
          </div>
        </div></div></div>
      )}

      {showAddRoom && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Add Room</h5><button className="btn-close" onClick={() => setShowAddRoom(false)}></button></div>
          <div className="modal-body">
            <input className="form-control mb-2" name="name" placeholder="Room Name" value={roomFormData.name} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="features" placeholder="Features" value={roomFormData.features} onChange={handleRoomInputChange}/>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddRoom(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddRoom}>Save</button>
          </div>
        </div></div></div>
      )}

      {showEditProfile && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Edit Profile</h5><button className="btn-close" onClick={() => setShowEditProfile(false)}></button></div>
          <div className="modal-body">
            {profileError && <div className="alert alert-danger">{profileError}</div>}
            {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
            <input 
              className="form-control mb-2" 
              name="name" 
              placeholder="Name" 
              value={profileFormData.name} 
              onChange={handleProfileInputChange}
            />
            <input 
              className="form-control mb-2" 
              name="email" 
              placeholder="Email" 
              value={profileFormData.email} 
              onChange={handleProfileInputChange}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div></div></div>
      )}

    </div>
  );
};

export default AdminPanel;
