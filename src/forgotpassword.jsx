// forgotpassword.jsx
import React, { useState } from 'react';
import './forgotpassword.css';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [email,       setEmail]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [message,     setMessage]     = useState('');
  const [messageType, setMessageType] = useState('');

  const baseURL=import.meta.env.VITE_BASEURL||"http:127.0.0.1:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${baseURL}/api/users/me/forgot_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userinput: email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.missing
          ? "Missing field: " + errorData.missing
          : errorData.message || "An error occurred");
        setMessageType("error");
        setEmail("");
        setTimeout(() => { setMessage(""); setMessageType(""); setIsLoading(false); }, 3000);
        return;
      }

      const data = await res.json();
      console.log("Success:", data.message);
      setMessage(`Recovery link sent to ${email}`);
      setMessageType('success');
      setEmail("");
      setTimeout(() => { setMessage(""); setMessageType(""); setIsLoading(false); }, 3000);

    } catch (error) {
      console.error("Server error:", error);
      setMessage("Could not connect to the server. Please try again.");
      setMessageType("error");
      setEmail("");
      setTimeout(() => { setMessage(""); setMessageType(""); setIsLoading(false); }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className="close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {/* Icon */}
        <div className="modal-icon">
          <div className="modal-icon-circle">
            {/* Lock icon — matches the navy/blue palette */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="11" width="14" height="10" rx="2.5"
                fill="#0C67A0" opacity="0.15"/>
              <rect x="5" y="11" width="14" height="10" rx="2.5"
                stroke="#0C67A0" strokeWidth="1.8" fill="none"/>
              <path d="M8 11V7.5a4 4 0 1 1 8 0V11"
                stroke="#0C67A0" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="12" cy="16" r="1.5" fill="#0C67A0"/>
              <line x1="12" y1="17.5" x2="12" y2="19.5"
                stroke="#0C67A0" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="modal-header">
          <h2>Forgot Password?</h2>
          <p>Enter your username or email address and we'll send you a recovery link.</p>
        </div>

        {/* Form */}
        <div className="modal-form-body">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>
                Username or Email <span>*</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username or email"
                required
                autoComplete="email"
              />
            </div>

            {/* Feedback message */}
            {message && (
              <div className={`fp-message ${messageType}`}>
                {message}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="btn-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  Send Recovery Link
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            <div className="modal-footer">
              Remember your password?
              <button className="back-link" type="button" onClick={onClose}>
                Back to login
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
