// IQHubSplash.jsx
import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&display=swap');

  .iqhub-splash * { margin: 0; padding: 0; box-sizing: border-box; }

  .iqhub-splash {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: radial-gradient(ellipse at 50% 30%, #2e6295 0%, #1a3d6e 40%, #0d2340 100%);
    font-family: 'Source Sans 3', sans-serif;
  }

  .iqhub-network-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.35;
  }

  @keyframes iqhub-fadeSlideDown {
    from { opacity: 0; transform: translateY(-28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .iqhub-subtitle {
    font-size: 18px;
    font-weight: 300;
    color: rgba(200,225,255,0.88);
    text-align: center;
    line-height: 1.6;
    letter-spacing: 0.3px;
    animation: iqhub-fadeSlideDown 0.9s 0.2s ease both;
    margin-bottom: 36px;
  }

  .iqhub-spinner-wrap {
    position: relative;
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: iqhub-fadeSlideDown 0.9s 0.35s ease both;
    margin-bottom: 44px;
  }

  .iqhub-icon-orbit {
    position: absolute;
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .iqhub-orbit-icon {
    position: absolute;
    color: rgba(150,210,255,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .iqhub-orbit-icon:nth-child(1) { top: 0px;    left: 50%; transform: translateX(-50%); }
  .iqhub-orbit-icon:nth-child(2) { top: 18px;   right: 0px; }
  .iqhub-orbit-icon:nth-child(3) { bottom: 18px; right: 0px; }
  .iqhub-orbit-icon:nth-child(4) { bottom: 0px;  left: 50%; transform: translateX(-50%); }
  .iqhub-orbit-icon:nth-child(5) { bottom: 18px; left: 0px; }
  .iqhub-orbit-icon:nth-child(6) { top: 18px;   left: 0px; }

  .iqhub-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
  }

  .iqhub-ring-outer {
    width: 150px; height: 150px;
    margin: -75px 0 0 -75px;
    border: 3px solid transparent;
    border-top-color: #4ab8f7;
    border-right-color: #4ab8f7;
    animation: iqhub-spinCW 2.4s linear infinite;
  }

  .iqhub-ring-mid {
    width: 118px; height: 118px;
    margin: -59px 0 0 -59px;
    border: 4px solid transparent;
    border-top-color: #1e7fcb;
    border-left-color: #1e7fcb;
    animation: iqhub-spinCCW 1.8s linear infinite;
  }

  .iqhub-ring-inner {
    width: 86px; height: 86px;
    margin: -43px 0 0 -43px;
    border: 3px solid transparent;
    border-bottom-color: #0b5ea8;
    border-right-color: #0b5ea8;
    animation: iqhub-spinCW 1.2s linear infinite;
  }

  .iqhub-ring-core {
    width: 56px; height: 56px;
    margin: -28px 0 0 -28px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(20,80,160,0.8), rgba(10,40,90,0.9));
    box-shadow: 0 0 18px rgba(74,184,247,0.35), inset 0 0 12px rgba(100,180,255,0.2);
    animation: iqhub-pulseDot 2s ease-in-out infinite;
  }

  @keyframes iqhub-spinCW  { to { transform: rotate(360deg); } }
  @keyframes iqhub-spinCCW { to { transform: rotate(-360deg); } }
  @keyframes iqhub-pulseDot {
    0%, 100% { box-shadow: 0 0 14px rgba(74,184,247,0.35), inset 0 0 10px rgba(100,180,255,0.2); }
    50%       { box-shadow: 0 0 26px rgba(74,184,247,0.7), inset 0 0 18px rgba(100,180,255,0.45); }
  }

  .iqhub-progress-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    animation: iqhub-fadeSlideDown 0.9s 0.5s ease both;
  }

  .iqhub-progress-track {
    width: 280px;
    height: 5px;
    background: rgba(255,255,255,0.12);
    border-radius: 99px;
    overflow: hidden;
  }

  .iqhub-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #1e7fcb, #4ab8f7);
    box-shadow: 0 0 10px rgba(74,184,247,0.6);
    transition: width 0.4s ease;
  }

  .iqhub-progress-label {
    font-size: 14px;
    font-weight: 300;
    color: rgba(180,215,255,0.75);
    letter-spacing: 0.5px;
  }

  .iqhub-sparkle {
    position: absolute;
    bottom: 40px;
    right: 60px;
    color: rgba(255,255,255,0.45);
    font-size: 32px;
    animation: iqhub-twinkle 2.5s ease-in-out infinite;
  }

  @keyframes iqhub-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.9) rotate(0deg); }
    50%       { opacity: 0.8; transform: scale(1.1) rotate(15deg); }
  }
`;

function NetworkBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 2,
    }));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(160,210,255,0.5)";
    ctx.lineWidth = 0.7;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          ctx.globalAlpha = 1 - dist / 220;
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
      ctx.fillStyle = "rgba(180,220,255,0.65)";
      ctx.fill();
    });
  }, []);

  return <canvas ref={canvasRef} className="iqhub-network-canvas" />;
}



const orbitIcons = [
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="3"/><path d="M3 19c0-4 3-6 6-6s6 2 6 6"/><circle cx="17" cy="8" r="2.5"/><path d="M21 19c0-3-1.8-5-4-5"/></svg>,
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="14" rx="2"/><polyline points="8 20 12 16 16 20"/><path d="M7 9h10M7 12h6"/></svg>,
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
];

export default function IQHubSplash({onComplete}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval);
          setTimeout(()=>{
            if (onComplete)
            onComplete();
          },500)
          return 100; }
        return p + 0.5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="iqhub-splash">
      <NetworkBg />
      <div className="iqhub-logo-glow" />
      <div className="iqhub-subtitle">
        Admin Dashboard - WhatsApp Bot Management<br />
        Loading Your Workspace...
      </div>

      <div className="iqhub-spinner-wrap">
        <div className="iqhub-icon-orbit">
          {orbitIcons.map((icon, i) => (
            <span className="iqhub-orbit-icon" key={i}>{icon}</span>
          ))}
        </div>
        <div className="iqhub-ring iqhub-ring-outer" />
        <div className="iqhub-ring iqhub-ring-mid" />
        <div className="iqhub-ring iqhub-ring-inner" />
        <div className="iqhub-ring iqhub-ring-core" />
      </div>

      <div className="iqhub-progress-wrap">
        <div className="iqhub-progress-track">
          <div className="iqhub-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="iqhub-progress-label">{Math.round(progress)}%</div>
      </div>
      
      <div className="iqhub-sparkle">🌍</div>
    </div>
  );
}
