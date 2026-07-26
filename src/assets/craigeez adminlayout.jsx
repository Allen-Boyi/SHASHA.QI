import { useState, useEffect, useRef } from "react";

// ─── HOOKS ──────────────────────────────────────────────────────────────────

function useViewportFix() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="viewport"]');
    const content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
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

// ─── ICONS ───────────────────────────────────────────────────────────────────

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/></svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" fill="currentColor"/><path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="12" cy="5" r="2" fill="currentColor" opacity=".5"/><path d="M11 13c.3-1.8 1.3-3 2.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".5" strokeLinecap="round"/></svg>
);
const ResourcesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);
const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 5l3 3-3 3M6 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

// ─── DASHBOARD SUB-COMPONENTS ───────────────────────────────────────────────

function CreditsBar({ used, total }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#4f8ef7", borderRadius: 10 }}/>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, extra, isMobile }) {
  return (
    <div className="card-pressable" style={{
      background: "#fff", border: "1px solid #e4eaf4", borderRadius: 14,
      padding: 16, display: "flex", gap: 12, 
      flex: isMobile ? "0 0 240px" : "1", // Fixed width on mobile for scroll
      scrollSnapAlign: "start", minWidth: 0,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "#7a8fb8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#141d35", fontFamily: "Syne, sans-serif", marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: "#7a8fb8", marginTop: 2 }}>{sub}</div>}
        {extra}
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
  const sbWidth = isTablet ? 220 : 260;

  return (
    <div className="admin-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background: #f4f7fc; }
        
        .admin-root { min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #141d35; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .card-pressable { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .card-pressable:active { transform: scale(0.97); }

        .mobile-scroll-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px 0 16px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .desktop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
      `}</style>

      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "#fff",
          display: "flex", alignItems: "center", padding: "0 16px", zIndex: 100, borderBottom: "1px solid #e4eaf4"
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", padding: 8, display: "flex" }}>
            <MenuIcon/>
          </button>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "Syne", fontWeight: 800, fontSize: 16 }}>IQhub.AI</div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4f8ef7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {(user?.username || "A").charAt(0).toUpperCase()}
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
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
           <div style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 800, color: "#fff" }}>✦ IQhub<span style={{ color: "#4f8ef7" }}>.AI</span></div>
           <div style={{ fontSize: 10, color: "#7a8fb8", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>Sovereign Solution</div>
        </div>

        <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {["Dashboard", "Users", "Resources", "Analytics", "Settings"].map(item => (
            <button key={item} onClick={() => { setActive(item); setSidebarOpen(false); }} style={{
              padding: "12px 16px", border: "none", borderRadius: 10, textAlign: "left",
              background: active === item ? "#4f8ef7" : "transparent",
              color: active === item ? "#fff" : "#7a8fb8",
              fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer"
            }}>{item}</button>
          ))}
        </nav>

        <div style={{ padding: 16 }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "12px", background: "rgba(232,120,120,0.1)", color: "#e87878", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: isMobile ? 0 : sbWidth,
        padding: isMobile ? "80px 16px 40px" : "40px",
        minHeight: "100vh"
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Syne", fontSize: isMobile ? 22 : 28, margin: 0 }}>{active}</h1>
          <p style={{ color: "#7a8fb8", fontSize: 14, marginTop: 4 }}>Admin: {user?.username || "Founder"}</p>
        </div>

        {active === "Dashboard" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 4 Cards Horizontal Row */}
            <div className={`${isMobile ? "mobile-scroll-row no-scrollbar" : "desktop-grid"}`}>
              <StatCard isMobile={isMobile} icon={<UsersIcon/>} label="Students" value="1,250" color="#4f8ef7" sub="+12% growth" />
              <StatCard isMobile={isMobile} icon={<ResourcesIcon/>} label="E-Books" value="320" color="#22d3a8" sub="Local Curriculum" />
              <StatCard isMobile={isMobile} icon={<ChatIcon/>} label="AI Queries" value="5,840" color="#a78bfa" sub="Ollama Active" />
              <StatCard isMobile={isMobile} icon={<DashboardIcon/>} label="Cloud" value="84%" color="#f59e0b" extra={<CreditsBar used={84} total={100}/>} />
            </div>

            {/* Secondary Content Area */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
              <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #e4eaf4" }}>
                <div style={{ fontWeight: 700, marginBottom: 16 }}>Recent Signups</div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f4f9" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0f4f9" }}/>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Student User #{i}</div>
                    <div style={{ fontSize: 11, color: "#7a8fb8" }}>2m ago</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#141d35", padding: 20, borderRadius: 16, color: "#fff" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>System Sovereign Status</div>
                <p style={{ fontSize: 12, color: "#7a8fb8", lineHeight: 1.5 }}>IQhub is running independently of external API dependencies where possible. Local LLM inference is currently stable.</p>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <div style={{ padding: "4px 10px", background: "rgba(34,211,168,0.2)", color: "#22d3a8", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>● ONLINE</div>
                  <div style={{ padding: "4px 10px", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>GPU NODE: ACTIVE</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", padding: 60, borderRadius: 16, textAlign: "center", border: "1px solid #e4eaf4" }}>
             <h2 style={{ fontFamily: "Syne" }}>{active} Page</h2>
             <p style={{ color: "#7a8fb8" }}>This module is currently being optimized for the local network.</p>
          </div>
        )}
      </main>

      {/* Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 150 }} />
      )}
    </div>
  );
}