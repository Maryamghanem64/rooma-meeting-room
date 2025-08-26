import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      console.log("Login successful:", result);
      
      // Extract role from new backend structure (user.role)
      const role = result.user?.role || result.role;
      console.log("Role:", role);
      
      // Normalize role for case-insensitive comparison
      const normalizedRole = String(role).toLowerCase().trim();
      
      // Redirect based on the role
      switch (normalizedRole) {
        case "admin":
          console.log("Redirecting to /admin");
          navigate("/admin");
          break;
        case "employee":
          console.log("Redirecting to /dashboard");
          navigate("/dashboard");
          break;
        case "guest":
          console.log("Redirecting to /rooms");
          navigate("/rooms");
          break;
        default:
          console.log("Redirecting to /splash");
          navigate("/splash");
          break;
      }
    } 

    setIsSubmitting(false);
  };

  // Handle guest login
  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    const result = await login("demo@company.com", "demo123");
    if (result.success) {
      navigate("/rooms");
    }
    setIsSubmitting(false);
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

      {/* Login Card */}
      <div className="login-container">
        <div className="login-card animate-fade-in">
          {/* Logo */}
          <div className="logo-section">
            <h1 className="logo-text">Rooma</h1>
            <p className="subtitle">Professional Meeting Management</p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="error-message animate-shake">
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="example@email.com"
                disabled={isSubmitting}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <a href="/forgot-password" style={{ color: "#4f46e5", textDecoration: "none", fontSize: "0.9rem" }}>
                Forgot your password?
              </a>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
