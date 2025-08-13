import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    }
    setIsSubmitting(false);
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    const result = await login('demo@company.com', 'demo123');
    if (result.success) {
      navigate('/');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-page">
      {/* Full-screen background image */}
      <div 
        className="background-image"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      ></div>
      
      {/* Background overlay with gradient */}
      <div className="background-overlay"></div>

      {/* Login Card */}
      <div className="login-container">
        <div className="login-card animate-fade-in">
          {/* Meeting Room Icon */}
        
          {/* Logo and Title */}
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Modern meeting room icon */}
                <rect x="4" y="6" width="20" height="16" rx="2" fill="#2E5D4E" stroke="#2E5D4E" strokeWidth="1.5"/>
                <rect x="6" y="8" width="16" height="12" rx="1" fill="white" stroke="#2E5D4E" strokeWidth="0.5"/>
                {/* Meeting table */}
                <rect x="8" y="12" width="12" height="6" rx="1" fill="#4A7C59" stroke="#2E5D4E" strokeWidth="0.5"/>
                {/* Chairs */}
                <circle cx="10" cy="18" r="1.5" fill="#4A7C59"/>
                <circle cx="18" cy="18" r="1.5" fill="#4A7C59"/>
                <circle cx="14" cy="20" r="1.5" fill="#4A7C59"/>
                {/* Clock icon */}
                <circle cx="22" cy="8" r="2.5" fill="#8B5A3C" stroke="#2E5D4E" strokeWidth="0.5"/>
                <path d="M22 5.5V8M24.5 8H22M20.5 8H22" stroke="#2E5D4E" strokeWidth="0.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="logo-text">Rooma</h1>
            <p className="subtitle">Professional Meeting Management</p>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="error-message animate-shake">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{authError}</span>
            </div>
          )}{/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group animate-slide-up" style={{animationDelay: '0.2s'}}>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="example@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="form-error">
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group animate-slide-up" style={{animationDelay: '0.3s'}}>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className="form-error">
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary animate-slide-up"
              style={{animationDelay: '0.4s'}}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Guest Account Button */}
          <button 
  type="button" 
  onClick={handleGuestLogin} 
  disabled={isSubmitting} 
  className="btn-demo animate-slide-up"
  style={{animationDelay: '0.5s'}}
>
  <i className="fas fa-rocket"></i>
  <span>Continue as Guest</span>
</button>

            {/* Forgot Password Link */}
            <div className="forgot-password animate-slide-up" style={{animationDelay: '0.6s'}}>
              <a href="#" className="forgot-link">
                Forgot Password?
              </a>
            </div>
          </form>

          {/* Footer */}
          <div className="footer animate-fade-in" style={{animationDelay: '0.8s'}}>
            <p className="footer-text">
              <i className="fas fa-shield-alt"></i>
              Secure meeting management system
            </p>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="floating-element element-1"></div>
      <div className="floating-element element-2"></div>
      <div className="floating-element element-3"></div>
    </div>
  );
};

export default LoginPage;