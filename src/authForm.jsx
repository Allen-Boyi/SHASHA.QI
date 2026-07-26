// authForm.jsx
import { useState, useRef, useEffect } from "react";
import './authForm.css';
import ForgotPassword from './forgotpassword';
import ShashaLogo from './components/ShashaLogo';

// ── Network background canvas ──────────────────────────────────────
function NetworkBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = Array.from({ length: 32 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1.5,
    }));

    ctx.strokeStyle = "rgba(160,210,255,0.5)";
    ctx.lineWidth   = 0.6;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          ctx.globalAlpha = 1 - dist / 200;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180,220,255,0.60)";
      ctx.fill();
    });
  }, []);

  return <canvas ref={canvasRef} className="iqhub-network-canvas" />;
}

// ── Auth form ──────────────────────────────────────────────────────
function AuthForm({ onLoginSuccess }) {
  const [isLogin,        setIsLogin]        = useState(true);
  const [username,       setUsername]       = useState("");
  const [password,       setPassword]       = useState("");
  const [email,          setEmail]          = useState("");
  const [phone,          setPhone]          = useState("");
  const [confirm,        setConfirm]        = useState("");
  const [roles,          setRoles]          = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [message,        setMessage]        = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal  = (e) => { e.preventDefault(); setIsModalVisible(true); };
  const closeModal = ()  => setIsModalVisible(false);

  const baseURL =import.meta.env.VITE_BASEURL;
  console.log("The base url from the env file is: ",baseURL);

  // ── Login ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    try {
      if (!username) { setMessage("Username missing"); setTimeout(() => setMessage(""), 3000); return; }
      if (!password) { setMessage("Password missing"); setTimeout(() => setMessage(""), 3000); return; }

      const res = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // ← important for cookies/session
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.missing ? "There are missing fields." : errorData.message || "Login Failed");
        setTimeout(() => setMessage(""), 3000);
        setUsername(""); setPassword("");
        return;
      }

      const data = await res.json();
      console.log("Login successful:", data.message);
      // onLoginSuccess triggers App to unmount AuthForm via setCurrentStep.
      // Any setState AFTER this call runs on an unmounted component and
      // silently prevents the step transition in some React 17 builds.
      // Rule: onLoginSuccess is always the very last statement on success.
      if (onLoginSuccess) onLoginSuccess(data);

    } catch {
      setMessage("Error connecting to the server");
      setTimeout(() => setMessage(""), 3000);
      setUsername(""); setPassword("");
    }
  };

    // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="auth-page">

      {/* Layer 0 — animated network canvas on dark bg */}
      <NetworkBg />

      <div className="form-container">

        {/*
          ─────────────────────────────────────────────────────────
          LAYER 2 + 3 — Branding block
          Position mirrors "School Pro" layout from the reference:
            circular logo → centered at card top
            portal label  → sits directly beneath it
          Asset: ShashaLogo.jsx full circular SVG (white circle,
          e-learning graduation cap/keyboard scene, shasha.ai text)
          rendered at 110px, seamlessly visible on the white card.
          ─────────────────────────────────────────────────────────
        */}
        <div className="auth-brand">
          <div className="auth-logo-wrap">
            <ShashaLogo width={110} height={110} />
          </div>
          <span className="auth-portal-label">Admin Portal</span>
        </div>       
          <div className="form">
            <h2>Welcome back</h2>

            <input
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <a href="#" onClick={openModal}>Forgot Password?</a>
            <ForgotPassword isOpen={isModalVisible} onClose={closeModal} />

            <button onClick={handleLogin}>Login</button>
            {message && <p className="auth-message">{message}</p>}
          </div>
      </div>
    </div>
  );
}

export default AuthForm;