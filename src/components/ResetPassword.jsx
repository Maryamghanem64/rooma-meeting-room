import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Frontend validation
    if (!email) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, email, password, confirmPassword);
      if (result.success) {
        setMessage(result.message || 'Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Use the detailed error message from the backend response
        setError(result.error || 'Failed to reset password');
        
        // Log detailed validation errors if available
        if (result.validationErrors) {
          console.log('Backend validation errors:', result.validationErrors);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background image */}
      <div
        className="background-image"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=2070&q=80')`,
        }}
      ></div>
      <div className="background-overlay"></div>

      {/* Reset Password Card */}
      <div className="login-container">
        <div className="login-card animate-fade-in">
          {/* Logo */}
          <div className="logo-section">
            <h1 className="logo-text">Rooma</h1>
            <p className="subtitle">Set New Password</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message animate-shake">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="rounded-md bg-green-50 p-4 mb-4 border border-green-200">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="form-group animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <label htmlFor="password" className="form-label">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Reset Password
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <Link
                to="/login"
                className="forgot-link"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
