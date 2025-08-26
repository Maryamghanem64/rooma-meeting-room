import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const result = await forgotPassword(email);
      if (result.success) {
        setMessage(result.message || 'Check your email for password reset instructions');
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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

      {/* Forgot Password Card */}
      <div className="login-container">
        <div className="login-card animate-fade-in">
          {/* Logo */}
          <div className="logo-section">
            <h1 className="logo-text">Rooma</h1>
            <p className="subtitle">Reset Your Password</p>
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

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Reset Instructions
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
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

export default ForgetPassword;
