import { useState, useEffect, useRef } from "react";

// ─── HOOKS ──────────────────────────────────────────────────────────────────

function useViewportFix() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="viewport"]');
    // FIXED: Removed restrictive scales that often freeze mobile viewports
    const content = "width=device-width, initial-scale=1.0";
    if (existing) {
      existing.setAttribute("content", content);
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = content;
      document.head.prepend(meta);
    }
  }, []);
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390);
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return w;
}

// ─── SVG COMPONENTS ──────────────────────────────────────────────────────────

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" fill="currentColor"/>
    <path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="5" r="2" fill="currentColor" opacity=".5"/>
    <path d="M11 13c.3-1.8 1.3-3 2.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".5" strokeLinecap="round"/>
  </svg>
);

const ResourcesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const AlertsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2a5 5 0 015 5v3l1 1H2l1-1V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 5l3 3-3 3M6 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── CHARTS ──────────────────────────────────────────────────────────────────

let _spkId = 0;
function Sparkline({ data, color }) {
  const id = useRef(`spk_${++_spkId}`).current;
  const w = 200, h = 60;
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / (mx - mn || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function BarChart({ data }) {
  const w = 200, h = 80;
  const mx = Math.max(...data.map(d => d.v));
  const bw = 28, gap = (w - data.length * bw) / (data.length + 1);
  return (
    <svg viewBox={`0 0 ${w} ${h + 18}`} style={{ width: "100%", height: "100%", display: "block" }}>
      {data.map((d, i) => {
        const bh = (d.v / mx) * h;
        const x = gap + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={bw} height={bh} rx="4" fill={d.active ? "#4f8ef7" : "rgba(79,142,247,0.25)"}/>
            <text x={x + bw / 2} y={h + 14} textAnchor="middle" fill="#7a8fb8" fontSize="9" fontWeight="500">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CreditsBar({ used, total }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#7a8fb8" }}>{used.toLocaleString()} tokens</span>
        <span style={{ fontSize: 10, color: "#7a8fb8" }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(79,142,247,0.15)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4f8ef7,#22d3a8)", borderRadius: 99 }}/>
      </div>
    </div>
  );
}

// ─── LAYOUT DATA ─────────────────────────────────────────────────────────────

const NAV = [
  { label: "Dashboard",          icon: DashboardIcon },
  { label: "Profile",            icon: ProfileIcon   },
  { label: "Users",              icon: UsersIcon     },
  { label: "Resources",          icon: ResourcesIcon },
  { label: "Conversation Flows", icon: ChatIcon      },
  { label: "Analytics",          icon: AnalyticsIcon },
  { label: "Settings",           icon: SettingsIcon  },
  { label: "Alerts",             icon: AlertsIcon    },
];

// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────

function SidebarNav({ active, onNav }) {
  return (
    <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
      {NAV.map(({ label, icon: Icon }) => (
        <button key={label} onClick={() => onNav(label)}
          className="nav-btn"
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", border: "none", borderRadius: 8,
            background: active === label ? "#1e2d52" : "transparent",
            color: active === label ? "#e8edf8" : "#7a8fb8",
            fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            cursor: "pointer", textAlign: "left", position: "relative",
          }}>
          {active === label && (
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "#4f8ef7", borderRadius: "0 3px 3px 0" }}/>
          )}
          <span style={{ display: "flex", width: 18, flexShrink: 0 }}><Icon/></span>
          <span style={{ flex: 1 }}>{label}</span>
          {active === label && (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", boxShadow: "0 0 6px #4f8ef7" }}/>
          )}
        </button>
      ))}
    </nav>
  );
}

function SidebarBrand({ user, onClose }) {
  const initial = (user?.username || "A").charAt(0).toUpperCase();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#4f8ef7,#6c63ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, flexShrink: 0 }}>✦</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 800, color: "#e8edf8" }}>
            IQhub<span style={{ color: "#4f8ef7" }}>.AI</span>
          </div>
          <div style={{ fontSize: 10, color: "#7a8fb8", marginTop: 1 }}>Zimbabwe Sovereign EdTech</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7a8fb8", cursor: "pointer", padding: 4, display: "flex" }}>
            <CloseIcon/>
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#6c63ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#e8edf8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.username || "Administrator"}
          </div>
          <div style={{ fontSize: 10, color: "#7a8fb8" }}>{user?.role_name || "Self-Taught Dev"}</div>
        </div>
        <span style={{ fontSize: 10, color: "#22d3a8", fontWeight: 600 }}>● Live</span>
      </div>
    </>
  );
}

// ─── PAGE CONTENT: DASHBOARD ─────────────────────────────────────────────────

function DashboardContent({ isMobile, isTablet }) {
  const queries = [42, 58, 45, 70, 55, 80, 65, 90, 72, 95, 78, 100];
  const bars = [
    { label: "Math",    v: 85, active: true  },
    { label: "Sci", v: 62, active: false },
    { label: "Eng", v: 48, active: false },
    { label: "Hist", v: 35, active: false },
  ];

  const gridCols = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const mainCols = isMobile || isTablet ? "1fr" : "repeat(3, 1fr)";

  const StatCard = ({ icon, label, value, sub, color, extra }) => (
    <div className="card-pressable" style={{
      background: "#fff", border: "1px solid #e4eaf4", borderRadius: 12,
      padding: isMobile ? 12 : 18, display: "flex", gap: 12, minWidth: 0, overflow: "hidden"
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, color, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "#7a8fb8", fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#141d35", fontFamily: "Syne, sans-serif", margin: "2px 0" }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: "#7a8fb8" }}>{sub}</div>}
        {extra}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14 }}>
        <StatCard icon={<UsersIcon/>} label="Users" value="1,250" sub="+12% from Zimbabwe" color="#4f8ef7" />
        <StatCard icon={<ResourcesIcon/>} label="Resources" value="320" sub="Total E-books" color="#22d3a8" />
        <StatCard icon={<ChatIcon/>} label="Ollama Inference" value="580" sub="Local GPU usage" color="#a78bfa" />
        <StatCard icon={<DashboardIcon/>} label="API Credits" value="84%" color="#f59e0b" extra={<CreditsBar used={4200} total={5000}/>} />
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: mainCols, gap: 16 }}>
        {/* Activity */}
        <div style={{ background: "#fff", border: "1px solid #e4eaf4", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#141d35" }}>Live Activity</div>
          {[
            { n: "Kelsey Mugugu", a: "Downloaded Physics P2", t: "2m ago" },
            { n: "Passmore M.", a: "Chatted with AI Tutor", t: "12m ago" },
            { n: "Mr. Makwenya", a: "Uploaded Geography Map", t: "1h ago" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f4f9" : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f8ef7", marginTop: 4 }}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#141d35" }}><strong>{item.n}</strong> {item.a}</div>
                <div style={{ fontSize: 10, color: "#7a8fb8" }}>{item.t}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Resources */}
        <div style={{ background: "#fff", border: "1px solid #e4eaf4", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#141d35" }}>Resource Inventory</div>
          {[
            { n: "Biology A-Level Guide", d: 450 },
            { n: "Technical Graphics 101", d: 290 },
            { n: "Business Ent. Case Studies", d: 180 },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f4f9" }}>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.n}</div>
              <div style={{ fontSize: 10, color: "#7a8fb8", marginLeft: 8 }}>{r.d} DLs</div>
            </div>
          ))}
          <button style={{ width: "100%", marginTop: 14, padding: "8px", background: "#4f8ef7", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View All</button>
        </div>

        {/* Local LLM Stats */}
        <div style={{ background: "#fff", border: "1px solid #e4eaf4", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#141d35" }}>Local LLM Health</div>
          <div style={{ height: 60, marginBottom: 10 }}><Sparkline data={queries} color="#4f8ef7"/></div>
          <div style={{ height: 80 }}><BarChart data={bars}/></div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN LAYOUT ─────────────────────────────────────────────────────────────

export default function AdminLayout({ user, onLogout }) {
  useViewportFix();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const winW = useWindowWidth();
  const isMobile = winW < 768;
  const isTablet = winW >= 768 && winW < 1024;
  const sbWidth = isTablet ? 230 : 260;

  return (
    <div className="admin-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        /* FIXED: Changed body/html to allow scrolling and ensure full height */
        html, body { 
          margin: 0; 
          padding: 0; 
          width: 100%; 
          /* DO NOT use height: 100% or 100vh here */
          min-height: 100%; 
          background: #eef2f8; 
          overflow-x: hidden;
          overflow-y: auto !important; /* Forces the browser to provide a scrollbar */
        }
        
        .admin-root {
          /* Changed from height to min-height */
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #141d35;
          display: flex;
          flex-direction: row;
        }

        .nav-btn:active { transform: scale(0.97); transition: transform 0.1s; }
        
        .card-pressable { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .card-pressable:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .card-pressable:active { transform: scale(0.98); }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); borderRadius: 10px; }
      `}</style>

      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "#fff",
          display: "flex", alignItems: "center", padding: "0 16px", zIndex: 100, borderBottom: "1px solid #e4eaf4"
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#4a5568", padding: 8, display: "flex" }}>
            <MenuIcon/>
          </button>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "Syne", fontWeight: 800, fontSize: 16 }}>IQhub</div>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#4f8ef7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
            {(user?.username || "A").charAt(0)}
          </div>
        </header>
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: sbWidth,
        background: "#141d35", zIndex: 200, display: "flex", flexDirection: "column",
        transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "none",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        <SidebarBrand user={user} onClose={isMobile ? () => setSidebarOpen(false) : null} />
        <SidebarNav active={active} onNav={(l) => { setActive(l); setSidebarOpen(false); }} />
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "10px", background: "rgba(232,120,120,0.1)", color: "#e87878", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <LogOutIcon/> Log Out
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 150 }} />
      )}

      {/* Main Content Area */}
      <main style={{
        marginLeft: isMobile ? 0 : sbWidth,
        padding: isMobile ? "80px 16px 40px" : "32px",
        flex: 1,
        // FIXED: Using minHeight and ensuring it acts as a normal block to push the body height
        minHeight: "100vh",
        display: "block",
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "Syne", fontSize: isMobile ? 20 : 26, margin: 0 }}>{active}</h1>
            <p style={{ color: "#7a8fb8", fontSize: 13, margin: "4px 0 0" }}>Welcome back, CEO of CIARA INC.</p>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 10 }}>
               <button style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e4eaf4", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Generate Report</button>
               <button style={{ padding: "8px 16px", background: "#4f8ef7", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Resource</button>
            </div>
          )}
        </div>

        {active === "Dashboard" ? (
          <DashboardContent isMobile={isMobile} isTablet={isTablet} />
        ) : (
          <div style={{ textAlign: "center", padding: "100px 0", color: "#7a8fb8" }}>
            <h2 style={{ fontFamily: "Syne", color: "#141d35" }}>{active} Module</h2>
            <p>Database synchronization in progress...</p>
          </div>
        )}
      </main>
    </div>
  );
}