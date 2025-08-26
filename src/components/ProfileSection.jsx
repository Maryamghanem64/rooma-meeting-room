import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileSection = () => {
  const { user, updateProfile } = useAuth();
  const [profileFormData, setProfileFormData] = useState({ name: '', email: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileFormData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!profileFormData.email.includes('@')) return setProfileError('Invalid email');
    setProfileLoading(true);
    try {
      const result = await updateProfile(profileFormData, user?.id);
      if (result && result.success) {
        setProfileSuccess('Profile updated!');
        setTimeout(() => setProfileSuccess(''), 1500);
      } else {
        setProfileError((result && result.error) || 'Failed to update');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError('Server error');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div>
      <h3>Edit Profile</h3>
      {profileError && <div className="alert alert-danger">{profileError}</div>}
      {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={profileFormData.name}
        onChange={handleInputChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={profileFormData.email}
        onChange={handleInputChange}
      />
      <button onClick={handleSaveProfile} disabled={profileLoading}>
        {profileLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

export default ProfileSection;
