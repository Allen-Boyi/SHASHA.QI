import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: DashboardIcon, active: true },
  {label:"Profile",icon:ProfileIcon},
  { label: "Users", icon: UsersIcon },
  { label: "Resources", icon: ResourcesIcon },
  { label: "Conversation Flows", icon: ChatIcon },
  { label: "Analytics", icon: AnalyticsIcon },
  { label: "Settings", icon: SettingsIcon },
  { label: "Alerts", icon: AlertsIcon },
];


// ─── SVG Icons ───────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".6" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".6" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".6" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".6" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="3" fill="currentColor" />
      <path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="5" r="2" fill="currentColor" opacity=".5" />
      <path d="M11 13c0-1.5.8-2.8 2-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".5" />
    </svg>
  );
}

function ResourcesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlertsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2a5 5 0 015 5v3l1 1H2l1-1V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 5l3 3-3 3M6 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose,user,onLogout}) {
  const [active, setActive] = useState("Dashboard");
  
  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 40, display: "none",
            // shown via media query logic in inline style below
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">✦</div>
          <div>
            <div className="brand-name">
              IQhub<span className="brand-accent">.AI</span> Admin Dashboard
            </div>
            <div className="brand-sub">WhatsApp Bot Management</div>
          </div>
          {/* Mobile close */}
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "nav-item--active" : ""}`}
              onClick={() => { setActive(label); onClose(); }}
            >
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{label}</span>
              {active === label && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="nav-item logout-item" onClick={onLogout}>
            <span className="nav-icon"><LogOutIcon /></span>
            <span className="nav-label">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Top Header Bar ───────────────────────────────────────────────────────────

function TopHeader({ onMenuToggle,user,onLogout }) {
  const displayname=user?.username||user.role_name;
  console.log("The display name is,",displayname)
  const initial=displayname.charAt().toUpperCase()
  console.log("The display initial is,",initial)
  return (
    <header className="top-header">
      <button className="hamburger" onClick={onMenuToggle} aria-label="Toggle sidebar">
        <MenuIcon />
      </button>
      <div className="header-brand-mobile">
        IQhub<span className="brand-accent">.AI</span>
      </div>
      <button className="nav-item logout-item" onClick={onLogout}>
            <span ><LogOutIcon /></span>
            <span className="nav-label">Log Out</span>
          </button>
      <div className="header-actions">
        <span className="header-badge">● Live</span>
        <div className="header-avatar">{initial}</div>
      </div>
    </header>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export default function AdminLayout({user,onLogout}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  console.log("The current user is ",user);
  
  // Close sidebar on wide screens when resizing
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --sidebar-bg: #1a2444;
          --sidebar-bg-deep: #152038;
          --sidebar-active: #243058;
          --sidebar-hover: #1e2d50;
          --sidebar-border: rgba(255,255,255,0.06);
          --accent: #4f8ef7;
          --accent-green: #22d3a8;
          --text-primary: #e8edf8;
          --text-muted: #7a8fb8;
          --header-bg: #ffffff;
          --sidebar-w: 256px;
          --radius: 10px;
          --font-main: 'DM Sans', sans-serif;
          --font-brand: 'Space Mono', monospace;
        }

        body { font-family: var(--font-main); background: #f0f4f9; }

        /* ── Sidebar ── */
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: var(--sidebar-w);
          height: 100vh;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.3s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }

        .sidebar::before {
          content: '';
          position: absolute;
          top: -60px; left: -60px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(79,142,247,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Brand ── */
        .sidebar-brand {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 22px 18px 20px;
          border-bottom: 1px solid var(--sidebar-border);
          position: relative;
        }

        .brand-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, var(--accent), #6c63ff);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 14px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79,142,247,0.35);
        }

        .brand-name {
          font-family: var(--font-brand);
          font-size: 11.5px;
          color: var(--text-primary);
          line-height: 1.3;
          letter-spacing: -0.3px;
        }

        .brand-accent { color: var(--accent); }

        .brand-sub {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
          letter-spacing: 0.2px;
        }

        .sidebar-close {
          display: none;
          background: none; border: none;
          color: var(--text-muted);
          cursor: pointer;
          margin-left: auto;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .sidebar-close:hover { color: var(--text-primary); background: var(--sidebar-hover); }

        /* ── Nav ── */
        .sidebar-nav {
          flex: 1;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-nav::-webkit-scrollbar { width: 3px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: var(--sidebar-border); border-radius: 3px; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 9px 12px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-family: var(--font-main);
          font-size: 13.5px;
          font-weight: 500;
          border-radius: var(--radius);
          cursor: pointer;
          text-align: left;
          position: relative;
          transition: background 0.18s, color 0.18s;
        }

        .nav-item:hover {
          background: var(--sidebar-hover);
          color: var(--text-primary);
        }

        .nav-item--active {
          background: var(--sidebar-active);
          color: var(--text-primary);
        }

        .nav-item--active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 60%;
          background: var(--accent);
          border-radius: 0 3px 3px 0;
        }

        .nav-icon {
          display: flex; align-items: center; justify-content: center;
          width: 18px; flex-shrink: 0;
        }

        .nav-label { flex: 1; }

        .nav-dot {
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--accent);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── Footer ── */
        .sidebar-footer {
          padding: 10px 10px 20px;
          border-top: 1px solid var(--sidebar-border);
        }

        .logout-item {
          color: #e87878 !important;
          opacity: 0.75;
        }
        .logout-item:hover { opacity: 1; background: rgba(232,120,120,0.1) !important; }

        /* ── Top Header ── */
        .top-header {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: var(--header-bg);
          border-bottom: 1px solid #e5eaf3;
          align-items: center;
          padding: 0 16px;
          z-index: 30;
          gap: 12px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }

        .hamburger {
          background: none; border: none;
          color: #4a5568;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex; align-items: center;
          transition: background 0.2s;
        }
        .hamburger:hover { background: #f0f4f9; }

        .header-brand-mobile {
          font-family: var(--font-brand);
          font-size: 13px;
          color: #1a2444;
          flex: 1;
        }

        .header-actions {
          display: flex; align-items: center; gap: 12px;
        }

        .header-badge {
          font-size: 11px;
          color: var(--accent-green);
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .header-avatar {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, var(--accent), #6c63ff);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: 700;
        }

        /* ── Page Content ── */
        .page-content {
          margin-left: var(--sidebar-w);
          min-height: 100vh;
          padding: 32px;
          transition: margin 0.3s;
        }

        .content-placeholder {
          background: #fff;
          border-radius: 14px;
          padding: 40px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          color: #7a8fb8;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          border: 2px dashed #e5eaf3;
        }

        /* ── Backdrop ── */
        .sidebar-backdrop {
          display: none;
        }

        /* ── MOBILE (<768px) ── */
        @media (max-width: 767px) {
          .sidebar {
            transform: translateX(-100%);
            box-shadow: 4px 0 30px rgba(0,0,0,0.3);
          }
          .sidebar--open { transform: translateX(0); }
          .sidebar-close { display: flex; }
          .sidebar-backdrop { display: block !important; }
          .top-header { display: flex; }
          .page-content { margin-left: 0; padding: 80px 16px 24px; }
        }

        /* ── TABLET (768-1024) ── */
        @media (min-width: 768px) and (max-width: 1024px) {
          :root { --sidebar-w: 220px; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f0f4f9" }}>
        {/* Mobile top bar */}
        <TopHeader user={user} onLogout={onLogout} onMenuToggle={() => setSidebarOpen(o => !o)} />

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 40,
            }}
          />
        )}

        {/* Sidebar */}
        <Sidebar user={user} onLogout={onLogout}  open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Page content */}
        <main className="page-content">
          <div className="content-placeholder">
          <h1>
          ← Select a section from the sidebar
          </h1>
                <div>
                  <h1>Welcome {user?.username||"Geust"}!</h1>
                  <p> Role: {user?.role_name||"Admin"}</p>
                </div>
          </div>
        </main>
      </div>
    </>
  );
}
