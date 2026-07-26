import React, { useEffect, useState } from 'react';
import './resetpassword.css';

const ResetPasswordModal = ({ onSuccess, onClose }) => {
  // Manual token extraction (bypasses need for Router context)
  const token = window.location.pathname.split('/').pop();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For the "Saving" state
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const WEBSITE_URL ="http://192.168.100.100:5000";

  // 1. Validate the token on mount
  useEffect(() => {
    const validateToken = async () => {
      console.log("Validating token from URL:", token);
      if (!token) {
        setMessage("Invalid or missing reset token");
        setMessageType("error");
        setCheckingToken(false);
        return;
      }
      try {
        const res = await fetch(`${WEBSITE_URL}/reset-password/${token}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        
        if (res.ok) {
          setTokenValid(true);
        } else {
          setMessage(data.message || "Your token is invalid or has expired");
          setMessageType("error");
          console.log(data.message);
          console.log(data.username);
        }
      } catch (error) {
        console.error("Connection error:", error);
        setMessage("Error connecting to the server.");
        setMessageType("error");
      } finally {
        setCheckingToken(false);
      }
    };
    validateToken();
  }, [token]);

  // 2. Handle the Password Reset Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) return;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${WEBSITE_URL}/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          new_password: password, 
          confirm_password: confirmPassword 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || data.missing || "An error occurred");
        setMessageType("error");
        setIsLoading(false);
      } else {
        setMessage("Password changed successfully!");
        setMessageType("success");
        
        // Wait 3 seconds so user sees success message, then redirect/callback
        setTimeout(() => {
          setIsLoading(false);
          if (onSuccess) onSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("Error connecting to the database server.");
      setMessageType("error");
      setIsLoading(false);
    }
  };

  // --- RENDERING LOGIC ---

  // State A: Initial token validation check
  if (checkingToken) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <h3>Checking link validity...</h3>
        </div>
      </div>
    );
  }

  // State B: Token is invalid or expired
  if (!tokenValid) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2 style={{ color: '#ff4d4d' }}>Invalid Link</h2>
            <p>{message}</p>
          </div>
          <button className="submit-btn" onClick={() => window.location.href = `/`}>
            Back To Home
          </button>
        </div>
      </div>
    );
  }

  // State C: Token is valid - Show the form
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Reset Password</h2>
          <p>Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password <span style={{ color: 'red' }}>*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password <span style={{ color: 'red' }}>*</span></label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          {message && (
            <p className={`status-message ${messageType === 'success' ? 'success-text' : 'error-text'}`}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>

        <div className="modal-footer">
          Remember your password?{' '}
          <button className="back-link" onClick={onClose}>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;