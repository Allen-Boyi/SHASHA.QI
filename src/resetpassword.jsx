// resetpassword.jsx
import React, { useEffect, useState } from 'react';
import './resetpassword.css';

// ── Password strength helper ───────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', cls: '' };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;
  const map = ['', 'weak', 'fair', 'good', 'strong'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score], cls: map[score] };
}

const ResetPasswordModal = ({ onSuccess, onClose }) => {
  const token = window.location.pathname.split('/').pop();

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [message,         setMessage]         = useState('');
  const [messageType,     setMessageType]     = useState('');
  const [tokenValid,      setTokenValid]      = useState(false);
  const [checkingToken,   setCheckingToken]   = useState(true);

  const WEBSITE_URL =import.meta.env.VITE_BASEURL;
  const strength    = getStrength(password);

  // ── 1. Validate token on mount ──────────────────────────────────
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
        const res  = await fetch(`${WEBSITE_URL}/reset-password/${token}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
          setTokenValid(true);
        } else {
          setMessage(data.message || "Your token is invalid or has expired");
          setMessageType("error");
          console.log(data.message, data.username);
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

  // ── 2. Submit new password ──────────────────────────────────────
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
      const res  = await fetch(`${WEBSITE_URL}/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: password, confirm_password: confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || data.missing || "An error occurred");
        setMessageType("error");
        setIsLoading(false);
      } else {
        setMessage("Password changed successfully!");
        setMessageType("success");
        setTimeout(() => { setIsLoading(false); if (onSuccess) onSuccess(); }, 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("Error connecting to the server.");
      setMessageType("error");
      setIsLoading(false);
    }
  };

  // ── State A: Checking token ─────────────────────────────────────
  if (checkingToken) {
    return (
      <div className="rp-overlay">
        <div className="rp-container">
          <div className="rp-state-body">
            <div className="rp-checking-spinner" />
            <h3>Verifying your link...</h3>
            <p>Please wait while we validate your reset token.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── State B: Token invalid ──────────────────────────────────────
  if (!tokenValid) {
    return (
      <div className="rp-overlay">
        <div className="rp-container">
          <div className="rp-state-body">
            <div className="rp-invalid-icon">
              {/* Warning icon */}
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                stroke="#c0392b" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <circle cx="12" cy="16" r="0.5" fill="#c0392b"/>
              </svg>
            </div>
            <h3>Link Invalid or Expired</h3>
            <p>{message || "This password reset link is no longer valid. Please request a new one."}</p>
            <button className="rp-home-btn" onClick={() => window.location.href = '/'}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── State C: Valid — show form ──────────────────────────────────
  return (
    <div className="rp-overlay">
      <div className="rp-container">

        {/* Close */}
        <button className="rp-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {/* Icon */}
        <div className="rp-icon">
          <div className="rp-icon-circle">
            {/* Shield-check icon */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 6.5V12c0 4.418 3.582 8 8 9 4.418-1 8-4.582 8-9V6.5L12 3z"
                fill="#0C67A0" opacity="0.12"
                stroke="#0C67A0" strokeWidth="1.8"
                strokeLinejoin="round"/>
              <polyline points="9 12 11 14 15 10"
                stroke="#0C67A0" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="rp-header">
          <h2>Reset Password</h2>
          <p>Choose a strong new password for your account.</p>
        </div>

        {/* Form */}
        <div className="rp-form-body">
          <form onSubmit={handleSubmit}>

            {/* New password */}
            <div className="rp-form-group">
              <label>New Password <span>*</span></label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              {/* Strength bar */}
              {password && (
                <>
                  <div className="rp-strength-bar">
                    {[1,2,3,4].map((n) => (
                      <span
                        key={n}
                        className={
                          strength.score >= n
                            ? `active-${strength.cls}`
                            : ''
                        }
                      />
                    ))}
                  </div>
                  <div className={`rp-strength-label ${strength.cls}`}>
                    {strength.label}
                  </div>
                </>
              )}
            </div>

            {/* Confirm password */}
            <div className="rp-form-group">
              <label>Confirm Password <span>*</span></label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {/* Feedback */}
            {message && (
              <div className={`rp-message ${messageType}`}>
                {message}
              </div>
            )}

            <button type="submit" className="rp-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="rp-btn-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  Save New Password
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            <div className="rp-footer">
              Remember your password?
              <button className="rp-back-link" type="button" onClick={onClose}>
                Back to login
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordModal;
