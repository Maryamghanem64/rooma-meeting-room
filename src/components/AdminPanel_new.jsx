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
  const [userFormData, setUserFormData] = useState({ name: "", email: "", role_id: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [roomFormData, setRoomFormData] = useState({ name: "", users: "", features: [], location: "", capacity: "" });

  // Available roles for selection
  const availableRoles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Employee" },
    { id: 3, name: "Guest" }
  ];
  
  // Available features for selection
  const [availableFeatures, setAvailableFeatures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch features
        try {
          const featuresResponse = await api.get('/features');
          setAvailableFeatures(featuresResponse.data.features || featuresResponse.data);
        } catch (error) {
          console.error('Error fetching features:', error);
          // Set default features if API call fails
          setAvailableFeatures([
            { id: 1, name: "Projector" },
            { id: 2, name: "Whiteboard" },
            { id: 3, name: "Video Conference" },
            { id: 4, name: "Audio System" },
            { id: 5, name: "TV Screen" },
            { id: 6, name: "Microphones" },
            { id: 7, name: "Interactive Whiteboard" },
            { id: 8, name: "Recording Equipment" }
          ]);
        }
        
        const usersResponse = await api.get('/users');
        console.log('Users API response:', usersResponse.data);
        
        // Handle Laravel API response structure
        let usersData = [];
        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          // Direct array response
          usersData = usersResponse.data;
        } else if (usersResponse.data && usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          // Laravel paginated response with data property
          usersData = usersResponse.data.data;
        } else if (usersResponse.data && usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          // Custom response with users property
          usersData = usersResponse.data.users;
        }
        
        // Process users data to handle Laravel response structure
        const processedUsers = usersData.map((user) => {
          // Handle different ID field names from Laravel
          const userId = user.Id !== undefined ? user.Id : 
                        user.id !== undefined ? user.id : 
                        user.user_id !== undefined ? user.user_id : null;
          
          // Handle role field - could be role object or string
          let userRole = "No role assigned";
          if (user.role) {
            if (typeof user.role === 'object' && user.role.name) {
              userRole = user.role.name;
            } else if (typeof user.role === 'string') {
              userRole = user.role;
            }
          }
          
          return {
            ...user,
            id: userId,
            role: userRole,
            // Preserve role_id for form updates if available
            role_id: user.role_id || (user.role && typeof user.role === 'object' ? user.role.id : null)
          };
        });
        
        console.log('Processed Users:', processedUsers);
        
        setUsers(processedUsers);
        setAnalytics(prev => ({ ...prev, totalUsers: usersData.length }));
        
        // Set mock data for other sections
        setAnalytics(prev => ({ ...prev, totalRooms: 5, totalMeetings: 8 }));
        setRooms([
          { id: 1, name: "Room A", location: "Floor 1", capacity: 10, features: [1] },
          { id: 2, name: "Room B", location: "Floor 2", capacity: 6, features: [2] },
        ]);
        setMeetings([
          { id: 1, title: "Team Sync", organizer: "Alice", date: "2025-08-21", status: "Pending" },
          { id: 2, title: "Project Review", organizer: "Bob", date: "2025-08-22", status: "Ongoing" },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setAnalytics({ totalRooms: 5, totalUsers: 0, totalMeetings: 8 });
        setRooms([
          { id: 1, name: "Room A", location: "Floor 1", capacity: 10, features: [1] },
          { id: 2, name: "Room B", location: "Floor 2", capacity: 6, features: [2] },
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
  
  // Handle room form input changes
  const handleRoomInputChange = e => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle feature selection changes
  const handleFeatureChange = (featureId) => {
    setRoomFormData(prev => {
      const features = prev.features || [];
      if (features.includes(featureId)) {
        // Remove feature if already selected
        return { ...prev, features: features.filter(id => id !== featureId) };
      } else {
        // Add feature if not selected
        return { ...prev, features: [...features, featureId] };
      }
    });
  };

const handleSaveProfile = async () => {
    // Update user state after successful profile update
    if (!profileFormData.email.includes('@')) return setProfileError("Invalid email");
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const result = await updateProfile(profileFormData, user?.id);
      if (result.success) {
        setProfileSuccess(result.message || "Profile updated successfully!");
        setTimeout(() => setShowEditProfile(false), 1500);
      } else {
        // Handle validation errors from Laravel
        if (result.validationErrors) {
          const errorMessages = Object.values(result.validationErrors).flat();
          setProfileError(errorMessages.join(' '));
        } else if (result.backendError) {
          // Handle specific backend configuration errors
          setProfileError(result.error || "System configuration issue. Please contact support.");
        } else {
          setProfileError(result.error || "Failed to update profile");
          console.error("Profile update error:", result.error); // Log the error
        }
      }
    } catch (err) {
      setProfileError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

const handleAddUser = async () => {
    const selectedRole = availableRoles.find(role => role.id === parseInt(userFormData.role_id));
    const role = selectedRole ? selectedRole.name : null; // Get the role name
    if (!selectedRole) {
        setUserError("Invalid role selected");
        return;
    }
    console.log("Adding User with Data:", userFormData); // Log user data
    console.log("Selected Role ID:", userFormData.role_id); // Log role ID
    console.log("Adding User with Data:", userFormData); // Log user data
    if (!userFormData.email.includes('@')) return setUserError("Invalid email");
    setUserLoading(true);
    setUserError("");
    try {
      const result = await api.post('/users', userFormData);
      // Handle different response structures
      let newUser = null;
      if (result.data.success && result.data.user) {
        newUser = result.data.user;
      } else if (result.data.user) {
        newUser = result.data.user;
      } else if (result.data.data) {
        newUser = result.data.data;
      } else {
        newUser = result.data;
      }
      
      if (newUser) {
        // Normalize the new user data
        const normalizedUser = {
          ...newUser,
          id: newUser.id !== undefined ? newUser.id : null,
          role: newUser.role || "No role assigned"
        };
        setUsers([...users, normalizedUser]);
        setShowAddUser(false);
        setUserFormData({ name: "", email: "", role_id: "" });
      } else {
        setUserError("Failed to add user: Unexpected response format");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Server error";
      setUserError(errorMsg);
    } finally { setUserLoading(false); }
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !selectedUser.id) {
      setUserError("Cannot update user: Invalid user selection");
      return;
    }
    if (!userFormData.email.includes('@')) return setUserError("Invalid email");
    setUserLoading(true);
    setUserError("");
    try {
      const result = await api.put(`/users/${selectedUser.id}`, userFormData);
      // Handle different response structures
      let updatedUser = null;
      if (result.data.success && result.data.user) {
        updatedUser = result.data.user;
      } else if (result.data.user) {
        updatedUser = result.data.user;
      } else if (result.data.data) {
        updatedUser = result.data.data;
      } else {
        updatedUser = result.data;
      }
      
      if (updatedUser) {
        // Normalize the updated user data
        const normalizedUser = {
          ...updatedUser,
          id: updatedUser.id !== undefined ? updatedUser.id : null,
          role: updatedUser.role || "No role assigned"
        };
        setUsers(users.map(u => u.id === selectedUser.id ? normalizedUser : u));
        setShowEditUser(false);
        setUserFormData({ name: "", email: "", role_id: "" });
        setSelectedUser(null);
      } else {
        setUserError("Failed to update user: Unexpected response format");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Server error";
      setUserError(errorMsg);
    } finally { setUserLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!id) {
      setUserError("Cannot delete user: Invalid user ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setUserError("");
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Server error";
      setUserError(errorMsg);
    }
  };

  const handleAddRoom = async () => {
    if (!roomFormData.name.trim() || !roomFormData.location.trim() || !roomFormData.capacity) return;
    try {
      // Prepare room data with features as an array of IDs
      const roomData = {
        ...roomFormData,
        features: Array.isArray(roomFormData.features) ? roomFormData.features : []
      };
      
      const response = await api.post('/rooms', roomData);
      const newRoom = response.data.room; // Adjust based on API response structure
      setRooms([...rooms, newRoom]);
      setShowAddRoom(false);
      // Reset form
      setRoomFormData({ name: "", users: "", features: [], location: "", capacity: "" });
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  useEffect(() => {
    fetchRooms(); // Call fetchRooms to load rooms on component mount
  }, []);
  
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.rooms); // Adjust based on API response structure
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSaveRoom = async () => {
    if (!selectedRoom || !selectedRoom.id) return;
    try {
      // Prepare room data with features as an array of IDs
      const roomData = {
        ...roomFormData,
        features: Array.isArray(roomFormData.features) ? roomFormData.features : []
      };
      
      const response = await api.put(`/rooms/${selectedRoom.id}`, roomData);
      const updatedRoom = response.data.room; // Adjust based on API response structure
      setRooms(rooms.map(r => (r.id === updatedRoom.id ? updatedRoom : r)));
      setShowEditRoom(false);
      // Reset form
      setRoomFormData({ name: "", users: "", features: [], location: "", capacity: "" });
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/rooms/${id}`);
      setRooms(rooms.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting room:", error);
    }
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
            {userError && <div className="alert alert-danger">{userError}</div>}
            <table className="table table-hover">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id || `user-${index}` || `user-${index}`}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role || "No role assigned"}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { 
                        setSelectedUser(u); 
                        setUserFormData({ 
                          name: u.name || "", 
                          email: u.email || "", 
                          role_id: u.role_id || "" 
                        }); 
                        setShowEditUser(true); 
                      }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.id)} disabled={u.id === null || u.id === undefined}>Delete</button>
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
              <thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Features</th><th>Actions</th></tr></thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.location}</td>
                    <td>{r.capacity}</td>
                    <td>
                      {Array.isArray(r.features) 
                        ? r.features.map(featureId => {
                            const feature = availableFeatures.find(f => f.id === featureId);
                            return feature ? feature.name : `Feature ${featureId}`;
                          }).join(", ")
                        : r.features}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { 
                        setSelectedRoom(r); 
                        setRoomFormData({ 
                          name: r.name || "", 
                          location: r.location || "", 
                          capacity: r.capacity || "", 
                          features: Array.isArray(r.features) ? r.features : [],
                          users: r.users || ""
                        }); 
                        setShowEditRoom(true); 
                      }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRoom(r.id)}>Delete</button>
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
                {meetings.map((m, index) => (<tr key={m.id || `meeting-${index}`}><td>{m.title}</td><td>{m.organizer}</td><td>{m.date}</td><td>{m.status}</td></tr>))}
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
          <div className="modal-header"><h5 className="modal-title">Add User</h5><button className="btn-close" onClick={() => { setShowAddUser(false); setUserError(""); }}></button></div>
          <div className="modal-body">
            {userError && <div className="alert alert-danger">{userError}</div>}
            <input className="form-control mb-2" placeholder="Name" name="name" value={userFormData.name || ""} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" placeholder="Email" name="email" value={userFormData.email || ""} onChange={handleUserInputChange}/>
            <select className="form-control mb-2" name="role_id" value={userFormData.role_id || ""} onChange={handleUserInputChange}>
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowAddUser(false); setUserError(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddUser} disabled={userLoading}>
              {userLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div></div></div>
      )}

      {showEditUser && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Edit User</h5><button className="btn-close" onClick={() => { setShowEditUser(false); setUserError(""); }}></button></div>
          <div className="modal-body">
            {userError && <div className="alert alert-danger">{userError}</div>}
            <input className="form-control mb-2" name="name" value={userFormData.name || ""} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" name="email" value={userFormData.email || ""} onChange={handleUserInputChange}/>
            <select className="form-control mb-2" name="role_id" value={userFormData.role_id || ""} onChange={handleUserInputChange}>
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowEditUser(false); setUserError(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveUser} disabled={userLoading}>
              {userLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div></div></div>
      )}

      {showAddRoom && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Add Room</h5><button className="btn-close" onClick={() => setShowAddRoom(false)}></button></div>
          <div className="modal-body">
            <input className="form-control mb-2" name="name" placeholder="Room Name" value={roomFormData.name} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="location" placeholder="Location" value={roomFormData.location} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="capacity" placeholder="Capacity" type="number" value={roomFormData.capacity} onChange={handleRoomInputChange}/>
            
            {/* Features selection as checkboxes */}
            <div className="mb-2">
              <label className="form-label">Features</label>
              <div>
                {availableFeatures.map(feature => (
                  <div key={feature.id} className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id={`feature-${feature.id}`} 
                      checked={roomFormData.features.includes(feature.id)}
                      onChange={() => handleFeatureChange(feature.id)}
                    />
                    <label className="form-check-label" htmlFor={`feature-${feature.id}`}>
                      {feature.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddRoom(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddRoom}>Save</button>
          </div>
        </div></div></div>
      )}

      {showEditRoom && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Edit Room</h5><button className="btn-close" onClick={() => setShowEditRoom(false)}></button></div>
          <div className="modal-body">
            <input className="form-control mb-2" name="name" placeholder="Room Name" value={roomFormData.name} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="location" placeholder="Location" value={roomFormData.location} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="capacity" placeholder="Capacity" type="number" value={roomFormData.capacity} onChange={handleRoomInputChange}/>
            
            {/* Features selection as checkboxes */}
            <div className="mb-2">
              <label className="form-label">Features</label>
              <div>
                {availableFeatures.map(feature => (
                  <div key={feature.id} className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id={`feature-${feature.id}`} 
                      checked={roomFormData.features.includes(feature.id)}
                      onChange={() => handleFeatureChange(feature.id)}
                    />
                    <label className="form-check-label" htmlFor={`feature-${feature.id}`}>
                      {feature.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowEditRoom(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveRoom}>Save</button>
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
