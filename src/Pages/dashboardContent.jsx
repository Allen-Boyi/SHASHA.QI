import { useState, useEffect } from "react";
// Import your UploadResource modal component and toast/Icon helpers here if they are in other files
import UploadResource from "../components/UploadResource"; 

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  blue:      "#4f8ef7",
  blueDim:   "#dbeafe",
  navy:      "#141d35",
  navyMid:   "#1e2d52",
  muted:     "#7a8fb8",
  green:     "#22d3a8",
  greenDim:  "#d1faf3",
  amber:     "#f59e0b",
  amberDim:  "#fef3c7",
  red:       "#ef4444",
  redDim:    "#fee2e2",
  purple:    "#8b5cf6",
  purpleDim: "#ede9fe",
  bg:        "#eef2f8",
  card:      "#fff",
  border:    "#e4eaf4",
  text:      "#1e2d4f",
  sub:       "#7a8fb8",
};

// ─── Tiny Inline Fluent Icons ────────────────────────────────────────────────
const Icons = {
  Users:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M22 21v-2a4 4 0 00-3-3.87"/></svg>,
  Alert:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Book:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>,
  Sync:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67"/></svg>,
  Upload:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Check:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, boxShadow: "0 2px 4px rgba(20,29,53,0.02)", ...style }}>
    {children}
  </div>
);

const SectionHead = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.navy }}>{title}</h3>
    {subtitle && <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.muted }}>{subtitle}</p>}
  </div>
);

const StatCard = ({ icon: Icon, title, val, sub, trend, bg, iconColor }) => (
  <Card style={{ flex: 1, minWidth: 220 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.sub }}>{title}</span>
        <h2 style={{ margin: "10px 0 4px 0", fontSize: 28, fontWeight: 700, color: C.navy, letterSpacing: "-0.5px" }}>{val}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          {trend && <span style={{ color: trend > 0 ? C.green : C.red, fontWeight: 600 }}>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>}
          <span style={{ color: C.muted }}>{sub}</span>
        </div>
      </div>
      <div style={{ padding: 12, borderRadius: 10, background: bg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon />
      </div>
    </div>
  </Card>
);

export default function DashboardContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // 🔥 State for controlling the Upload Modal overlay layout
  const [uploadNewResource, setUploadNewResource] = useState(false);

  const fetchStats = () => {
    fetch("/api/dashboard_stats")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData.cards);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSyncResources = () => {
    setSyncing(true);
    fetch("/api/resources/sync_drive_resources", { method: "POST" })
      .then((res) => res.json())
      .then((syncRes) => {
        alert(syncRes.message || "Sync complete!");
        setSyncing(false);
        fetchStats(); // Silently refresh values instead of full page hard reload
      })
      .catch((err) => {
        console.error(err);
        setSyncing(false);
      });
  };

  if (loading) {
    return <div style={{ padding: 40, color: C.muted, fontFamily: "sans-serif" }}>Loading secure operations workspace...</div>;
  }

  const gap = 24;

  return (
    <div style={{ padding: gap, fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* SECTION 1: Metrics Analytics Row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap, marginBottom: gap }}>
        <StatCard icon={Icons.Users} title="Total Students" val={data?.bot_users?.value ?? 0} sub={data?.bot_users?.sub} bg={C.blueDim} iconColor={C.blue} />
        <StatCard icon={Icons.Alert} title="Awaiting Review" val={data?.needs_review?.value ?? 0} sub={data?.needs_review?.sub} bg={C.amberDim} iconColor={C.amber} />
        <StatCard icon={Icons.Book} title="Total Resources" val={data?.total_resources?.value ?? 0} sub={data?.total_resources?.sub} trend={data?.total_resources?.trend_pct} bg={C.greenDim} iconColor={C.green} />
        
        {/* Progress Breakdown Card */}
        <Card style={{ flex: 1, minWidth: 260 }}>
          <SectionHead title="Resources by Level" subtitle="Academic structure breakdown" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Grade 7", val: data?.by_level?.grade_7 ?? 0, color: C.purple },
              { label: "O Level",  val: data?.by_level?.olevel ?? 0,  color: C.blue },
              { label: "A Level",  val: data?.by_level?.alevel ?? 0,  color: C.green },
            ].map((lvl, i) => {
              const maxVal = Math.max((data?.by_level?.grade_7 || 1), (data?.by_level?.olevel || 1), (data?.by_level?.alevel || 1));
              const pct = maxVal > 0 ? (lvl.val / maxVal) * 100 : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.navy, width: 60 }}>{lvl.label}</span>
                  <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: lvl.color, borderRadius: 99, transition: "width 0.4s ease" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, width: 35, textAlign: "right" }}>{lvl.val}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* SECTION 2: Operations Split Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap }}>
        
        {/* System Alerts */}
        <Card>
          <SectionHead title="System Alerts & Health" subtitle="Real-time status nodes" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { label: "Google Drive Synchronizer", val: "Operational", ok: true },
              { label: "WhatsApp Gateway Webhook", val: "99.8% Uptime", ok: true },
              { label: "Data-Lite Parsing Indexer",  val: "Healthy",       ok: true },
              { label: "Pending Revision Flags",    val: data?.needs_review?.value > 0 ? `${data.needs_review.value} Needs Verification` : "0 Flags Clean", ok: data?.needs_review?.value === 0 },
            ].map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ display: "flex", padding: 6, borderRadius: "50%", background: h.ok ? C.greenDim : C.amberDim, color: h.ok ? C.green : C.amber }}>
                  {h.ok ? <Icons.Check /> : <Icons.Alert />}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.navy }}>{h.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: h.ok ? C.muted : C.amber }}>{h.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Management Center Center */}
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <SectionHead title="Quick System Actions" subtitle="Trigger automated maintenance tasks" />
            <p style={{ fontSize: 13, color: C.muted, lineHeight: "1.6", marginBottom: 24 }}>
              Execute data parsing indexing jobs or upload completely new educational resources onto the live student platform dashboard.
            </p>
          </div>
          
          {/* Action Button Container stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            {/* 1. Sync Drive Button */}
            <button 
              onClick={handleSyncResources}
              disabled={syncing}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 8,
                background: syncing ? C.border : C.blue,
                color: syncing ? C.muted : "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: syncing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: syncing ? "none" : "0 4px 12px rgba(79,142,247,0.15)",
                transition: "all 0.2s ease"
              }}
            >
              <Icons.Sync />
              {syncing ? "Synchronizing Storage Index..." : "Sync Google Drive Resources"}
            </button>
            
            {/* 🔥 2. Upload New Resource Button */}
            <button 
              onClick={() => setUploadNewResource(true)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 8,
                background: C.navyMid,
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 4px 12px rgba(30,45,82,0.15)",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = C.navy}
              onMouseLeave={(e) => e.target.style.background = C.navyMid}
            >
              <Icons.Upload />
              Upload Resource
            </button>
          </div>
        </Card>
        
      </div>

      {/* 🔥 Conditional Modal Overlay Execution */}
      {uploadNewResource && (
        <UploadResource  
          onClose={() => setUploadNewResource(false)} 
          onUploadSuccess={() => { 
            fetchStats(); // Update dashboard metric counts instantly on upload success
            alert("Resource uploaded successfully!"); 
          }} 
        />
      )}

    </div>
  );
}