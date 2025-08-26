import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = () => {
  const { user, changePassword, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    
    try {
      // Use the authenticated user's ID for the API call
      const result = await updateProfile(formData, user?.id);
      
      if (result.success) {
        setProfileSuccess(result.message || "Profile updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          setProfileSuccess("");
        }, 2000);
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

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    // Frontend validation
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      if (result.success) {
        setPasswordSuccess(result.message || "Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        // Handle backend configuration errors
        if (result.backendError) {
          setPasswordError(result.error || "System configuration issue. Please contact support.");
        } else {
          setPasswordError(result.error || "Failed to change password. Please try again.");
        }
      }
    } catch (err) {
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Please login to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>
                User Profile
              </h4>
            </div>
            
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-4">
                  <div className="profile-avatar mx-auto mb-3">
                    <div className="avatar-circle">
                      <i className="fas fa-user fa-5x text-muted"></i>
                    </div>
                  </div>
                  <h5 className="mb-1">{user.name}</h5>
                  <p className="text-muted mb-0">{user.email}</p>
                  <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>
                    {user.role?.toUpperCase?.() || 'USER'}
                  </span>
                </div>
                
                <div className="col-md-8">
                  <h6 className="text-primary mb-3">Personal Information</h6>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Full Name:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user.name}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Email Address:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user.email}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Account Status:</strong>
                    </div>
                    <div className="col-sm-8">
                      <span className="badge bg-success">Active</span>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Member Since:</strong>
                    </div>
                    <div className="col-sm-8">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <button 
                  className="btn btn-primary me-2"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Edit Profile
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  <i className="fas fa-key me-1"></i>
                  Change Password
                </button>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Activity Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className="stat-card">
                    <h4 className="text-primary">12</h4>
                    <p className="text-muted mb-0">Meetings Attended</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="stat-card">
                    <h4 className="text-primary">8</h4>
                    <p className="text-muted mb-0">Rooms Booked</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="stat-card">
                    <h4 className="text-primary">24</h4>
                    <p className="text-muted mb-0">Hours in Meetings</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="stat-card">
                    <h4 className="text-primary">5</h4>
                    <p className="text-muted mb-0">Upcoming Meetings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {profileSuccess && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle me-2"></i>
                    {profileSuccess}
                  </div>
                )}
                
                {profileError && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {profileError}
                  </div>
                )}
                
                <form>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={profileLoading}
                >
                  {profileLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-key me-2"></i>
                  Change Password
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {passwordSuccess && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle me-2"></i>
                    {passwordSuccess}
                  </div>
                )}
                
                {passwordError && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {passwordError}
                  </div>
                )}
                
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter new password (min 6 characters)"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowChangePasswordModal(false);
                        setPasswordError("");
                        setPasswordSuccess("");
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
