import { useState, useEffect, useRef } from "react";
import MyProfile from './Pages/myProfile.jsx';
import BotUser from  './Pages/botUsers.jsx';
import BotDashboardUser from './Pages/botDashboardUser.jsx';
import ResourceManagement from './Pages/resourceManagement.jsx';
import Alerts from './Pages/alerts.jsx';
import Settings from './Pages/settings.jsx';
import ConversationFlows from './Pages/conversationFlows.jsx';
import Analytics from './Pages/analytics.jsx';
import DashboardContent from './Pages/dashboardContent.jsx';
// ─── Icons ────────────────────────────────────────────────────────────────────
const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".5"/>
    <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".5"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".5"/>
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
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2a5 5 0 015 5v3.5l1.5 1.5H2.5L4 10.5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M7 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 4h9M5 4V2.5h3V4M4 4l.5 7h4L9 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const WarnIcon = ({ color = "#f59e0b" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8 2L14.5 13H1.5L8 2z" stroke={color} strokeWidth="1.4" fill={`${color}22`} strokeLinejoin="round"/>
    <path d="M8 6v3M8 11v.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);



// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { label: "Dashboard",          icon: DashboardIcon },
  { label: "Bot Dashboard Users", icon: UsersIcon  },
  { label: "Profile",            icon: ProfileIcon },
  { label: "Bot Users",           icon: UsersIcon },
  { label: "Resources",          icon: ResourcesIcon },
  { label: "Conversation Flows", icon: ChatIcon },
  { label: "Analytics",          icon: AnalyticsIcon },
  { label: "Settings",           icon: SettingsIcon  },
  { label: "Alerts",             icon: AlertsIcon },
];

function SidebarNav({ active, onNav }) {
  return (
    <nav style={{ flex:1, padding:"8px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
      {NAV.map(({ label, icon: Icon }) => (
        <button key={label} onClick={() => onNav(label)} style={{
          display:"flex", alignItems:"center", gap:10, width:"100%",
          padding:"9px 12px", border:"none", borderRadius:8,
          background: active===label ? "#1e2d52" : "transparent",
          color: active===label ? "#e8edf8" : "#7a8fb8",
          fontFamily:"inherit", fontSize:13, fontWeight:500,
          cursor:"pointer", textAlign:"left", position:"relative", boxSizing:"border-box",
        }}>
          {active===label && <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:3, height:"60%", background:"#4f8ef7", borderRadius:"0 3px 3px 0" }}/>}
          <span style={{ display:"flex", alignItems:"center", width:18, flexShrink:0 }}><Icon/></span>
          <span style={{ flex:1 }}>{label}</span>
          {active===label && <div style={{ width:6, height:6, borderRadius:"50%", background:"#4f8ef7", boxShadow:"0 0 6px #4f8ef7" }}/>}
        </button>
      ))}
    </nav>
  );
}

// ─── Sidebar Brand (desktop only) ────────────────────────────────────────────
function SidebarBrand({ user }) {
  const initial = (user?.username || user?.role_name || "A").charAt(0).toUpperCase();
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"20px 16px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0, boxSizing:"border-box" }}>
        <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#4f8ef7,#6c63ff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, flexShrink:0 }}>✦</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontSize:13, fontWeight:800, color:"#e8edf8" }}>IQhub<span style={{ color:"#4f8ef7" }}>.AI</span></div>
          <div style={{ fontSize:10, color:"#7a8fb8", marginTop:1 }}>Admin Dashboard</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0, boxSizing:"border-box" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#4f8ef7,#6c63ff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>{initial}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#e8edf8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.username || "Admin"}</div>
          <div style={{ fontSize:10, color:"#7a8fb8" }}>{user?.role_name || "Super Admin"}</div>
        </div>
        <span style={{ fontSize:10, color:"#22d3a8", fontWeight:600, whiteSpace:"nowrap" }}>● Live</span>
      </div>
    </>
  );
}

// ─── MOBILE HEADER — sticky, exposes ref so sidebar can measure its height ────
function MobileHeader({ onToggle, onLogout, user, headerRef, active }) {
  const initial = (user?.username || user?.role_name || "A").charAt(0).toUpperCase();
  const isDashboard = active === "Dashboard";
  return (
    <header ref={headerRef} style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "#fff",
      borderBottom: "1px solid #e4eaf4",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      boxSizing: "border-box",
      width: "100%",
    }}>
      <div style={{ display:"flex", alignItems:"center", height:56, padding:"0 14px", gap:8, boxSizing:"border-box" }}>
        <button onClick={onToggle} style={{ background:"none", border:"none", color:"#4a5568", cursor:"pointer", padding:6, borderRadius:8, display:"flex", flexShrink:0 }}>
          <MenuIcon/>
        </button>
        <span style={{ fontFamily:"Syne, sans-serif", fontSize:15, fontWeight:800, color:"#141d35", flexShrink:0 }}>
          IQhub<span style={{ color:"#4f8ef7" }}>.AI</span>
        </span>
        <div style={{ flex:1 }}/>
        <span style={{ fontSize:11, color:"#22d3a8", fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>● Live</span>
        <button style={{ background:"none", border:"none", color:"#4a5568", cursor:"pointer", padding:6, borderRadius:8, display:"flex", flexShrink:0 }}><BellIcon/></button>
        <button onClick={onLogout} style={{ background:"none", border:"none", color:"#4a5568", cursor:"pointer", padding:6, borderRadius:8, display:"flex", flexShrink:0 }}><LogOutIcon/></button>
        <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#4f8ef7,#6c63ff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>{initial}</div>
      </div>
      {isDashboard && (
        <div style={{ padding:"0 14px 10px", boxSizing:"border-box" }}>
          <div style={{ display:"flex", alignItems:"center", background:"#f0f4f9", border:"1px solid #e4eaf4", borderRadius:8 }}>
            <span style={{ display:"flex", alignItems:"center", padding:"0 10px", color:"#a0aec0", flexShrink:0 }}><SearchIcon/></span>
            <input placeholder="Search users, resources, flows…" style={{ flex:1, border:"none", background:"transparent", outline:"none", color:"#1e2d4f", fontFamily:"inherit", fontSize:13, padding:"9px 8px 9px 0", minWidth:0 }}/>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── MOBILE SIDEBAR ───────────────────────────────────────────────────────────
// Starts at `headerHeight` so the header is never covered.
// Shows brand, profile, search, nav, logout all fully visible inside the drawer.
function MobileSidebar({ open, onClose, active, onNav, onLogout, user, headerHeight }) {
  const handleNav = (label) => { onNav(label); onClose(); };
  const initial = (user?.username || user?.role_name || "A").charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop — only covers area below the header */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: headerHeight,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
          }}
        />
      )}

      {/* Drawer panel */}
      <aside style={{
        position: "fixed",
        top: headerHeight,      // ← flush below the sticky header
        left: 0,
        bottom: 0,
        width: 270,
        background: "#141d35",
        display: "flex",
        flexDirection: "column",
        zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
        overflowX: "hidden",
        overflowY: "auto",
        boxSizing: "border-box",
        boxShadow: open ? "4px 0 28px rgba(0,0,0,0.3)" : "none",
      }}>

        {/* Brand row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "18px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          flexShrink: 0, boxSizing: "border-box",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#4f8ef7,#6c63ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15, flexShrink: 0,
          }}>✦</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 800, color: "#e8edf8" }}>
              IQhub<span style={{ color: "#4f8ef7" }}>.AI</span>
            </div>
            <div style={{ fontSize: 10, color: "#7a8fb8", marginTop: 1 }}>Admin Dashboard</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: "none", color: "#a0b0cc",
              cursor: "pointer", padding: 6, borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CloseIcon/>
          </button>
        </div>

        {/* Profile row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          flexShrink: 0, boxSizing: "border-box",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#4f8ef7,#6c63ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username || "Admin"}
            </div>
            <div style={{ fontSize: 10, color: "#7a8fb8" }}>{user?.role_name || "Super Admin"}</div>
          </div>
          <span style={{ fontSize: 10, color: "#22d3a8", fontWeight: 600, whiteSpace: "nowrap" }}>● Live</span>
        </div>

        {/* Nav items */}
        <SidebarNav active={active} onNav={handleNav}/>

        {/* Log Out */}
        <div style={{ padding: "10px 10px 18px", borderTop: "1px solid rgba(255,255,255,.07)", flexShrink: 0, boxSizing: "border-box" }}>
          <button
            onClick={onLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", border: "none", borderRadius: 8, background: "transparent", color: "#e87878", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", boxSizing: "border-box" }}
          >
            <span style={{ display: "flex", width: 18 }}><LogOutIcon/></span>Log Out
          </button>
        </div>
      </aside>
    </>
  );
}


// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar({ active, onNav, onLogout, user, width }) {
  return (
    <aside style={{ position:"fixed", top:0, left:0, bottom:0, width, background:"#141d35", display:"flex", flexDirection:"column", zIndex:50, overflowX:"hidden", overflowY:"auto", boxSizing:"border-box" }}>
      <SidebarBrand user={user}/>
      <SidebarNav active={active} onNav={onNav}/>
      <div style={{ padding:"10px 10px 18px", borderTop:"1px solid rgba(255,255,255,.07)", flexShrink:0, boxSizing:"border-box" }}>
        <button onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 12px", border:"none", borderRadius:8, background:"transparent", color:"#e87878", fontFamily:"inherit", fontSize:13, fontWeight:500, cursor:"pointer", boxSizing:"border-box" }}>
          <span style={{ display:"flex", width:18 }}><LogOutIcon/></span>Log Out
        </button>
      </div>
    </aside>
  );
}

function DesktopTitleBar({ active }) {
  const isDashboard = active === "Dashboard";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap", boxSizing:"border-box" }}>
      <div style={{ fontFamily:"Syne, sans-serif", fontSize:20, fontWeight:800, color:"#141d35" }}>
        IQhub<span style={{ color:"#4f8ef7" }}>.AI</span>
        <span style={{ color:"#7a8fb8", fontWeight:400, fontSize:16 }}> / {active}</span>
      </div>
      {isDashboard && (
        <div style={{ flex:1, maxWidth:320, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", background:"#fff", border:"1px solid #e4eaf4", borderRadius:8 }}>
            <span style={{ display:"flex", alignItems:"center", padding:"0 10px", color:"#a0aec0" }}><SearchIcon/></span>
            <input placeholder="Search users, resources, flows…" style={{ flex:1, border:"none", background:"transparent", outline:"none", color:"#1e2d4f", fontFamily:"inherit", fontSize:13, padding:"9px 8px 9px 0", minWidth:0 }}/>
          </div>
        </div>
      )}
      {isDashboard && <span style={{ fontSize:13, color:"#7a8fb8", marginLeft:"auto" }}>WhatsApp Bot Management</span>}
    </div>
  );
}

// ─── useWindowWidth ───────────────────────────────────────────────────────────
function useWindowWidth() {
  function getW() {
    if (typeof window === "undefined") return 1200;
    return window.visualViewport ? window.visualViewport.width : window.innerWidth;
  }
  const [w, setW] = useState(getW);
  useEffect(() => {
    const upd = () => setW(getW());
    upd();
    window.addEventListener("resize", upd);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("resize", upd);
      if (window.visualViewport) window.visualViewport.removeEventListener("resize", upd);
    };
  }, []);
  return w;
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export default function AdminLayout( props ) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive]           = useState("Dashboard");
  const [headerHeight, setHeaderHeight] = useState(0);
  const {onLogout}=props;
  const [user,setUser]=useState(props.user||JSON.parse(localStorage.getItem("user"))||"{}");
  const headerRef = useRef(null);

  const winW     = useWindowWidth();
  const isMobile = winW < 768;
  const isTablet = winW >= 768 && winW < 1024;
  const sbWidth  = isTablet ? 230 : 260;

  useEffect(()=>{
    if(props.user){
      setUser(props.user);
    }
  },[props.user]);

    useEffect(()=>{
    const handleProfileUpdate=()=>{
      const freshData=localStorage.getItem("user");
      if(freshData){
        setUser(JSON.parse(freshData));
      }
    };  
    window.addEventListener('userUpdated',handleProfileUpdate);
    return ()=> {
      window.removeEventListener('userUpdated',handleProfileUpdate);
    }
    },[]);

  // Dynamically measure the header height so sidebar top is always exact
  useEffect(() => {
    if (!isMobile || !headerRef.current) return;
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, [isMobile]);


  //----------renderMainContent──────────────────────────────────────────────────────────────
const renderMainContent = () => {
  switch (active) {
    case "Dashboard":
      return <DashboardContent isMobile={isMobile} isTablet={isTablet} />;

    case "Profile":
      return (
       <MyProfile user = {user} isMobile={isMobile}/>
      );

    case "Bot Users":
      return (
        <BotUser user={user} isMobile={isMobile}/> 
      );
    case "Bot Dashboard Users":
      return(
        <BotDashboardUser user={user} isMobile={isMobile}/>
      );
   case "Resources":
      return (
        <ResourceManagement user={user} isMobile={isMobile}/>
      );

    case "Conversation Flows":
      return (
        <ConversationFlows user={user} isMobile={isMobile}/>
      );

    case "Analytics":
      return (
       <Analytics user={user} isMobile={isMobile}/>
      );

    case "Settings":
      return (
       <Settings user={user} isMobile={isMobile}/>
      );

    case "Alerts":
      return (
        <Alerts user={user} isMobile={isMobile}/>
      );

    default:
      return <DashboardContent isMobile={isMobile} isTablet={isTablet} />;
  }
};
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; width: 100%; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#eef2f8", fontFamily:"'DM Sans', sans-serif", overflowX:"hidden", width:"100%", position:"relative" }}>

            {/* ── MOBILE ── */}
      {isMobile && (
        <div style={{ width: "100%" }}> {/* Removed overflowX: "hidden" here */}
          {/* Wrap the header in a sticky container */}
          <div style={{ 
            position: "sticky", 
            top: 0, 
            zIndex: 100, 
            width: "100%",
            background: "#fff" // Ensure it's not transparent when scrolling
          }}>
            <MobileHeader
              headerRef={headerRef}
              onToggle={() => setSidebarOpen(o => !o)}
              onLogout={onLogout}
              user={user}
            />
          </div>

          <MobileSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            active={active}
            onNav={setActive}
            onLogout={onLogout}
            user={user}
            headerHeight={headerHeight}
          />

          {/* Ensure main doesn't have overflow-x: hidden if sticky fails */}
          <main style={{ 
            padding: "12px 12px 32px", 
            width: "100%", 
            boxSizing: "border-box",
            marginTop: headerHeight || 60, // Fallback if headerHeight isn't measured yet 
          }}>
            {renderMainContent()}
          </main>
        </div>
      )}

        {/* ── TABLET / DESKTOP ── */}
        {!isMobile && (
          <>
            <DesktopSidebar active={active} onNav={setActive} onLogout={onLogout} user={user} width={sbWidth}/>
            <main style={{ marginLeft:sbWidth, width:`calc(100% - ${sbWidth}px)`, overflowY: "visible",height: "auto",minHeight:"100vh", padding:isTablet?20:28, overflowX:"visible", boxSizing:"border-box", position:"relative" }}>
              <DesktopTitleBar active={active}/>
              {renderMainContent()}
            </main>
          </>
        )}

      </div>
    </>
  );
}
