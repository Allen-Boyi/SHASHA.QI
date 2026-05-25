import { useState, useMemo, useRef, useEffect } from "react";

// ─── Brand Tokens (identical to botUsers) ─────────────────────────────────────
const BLUE   = "#4B6EF5";
const GREEN  = "#32a84e";
const ORANGE = "#E85D04";
const RED    = "#EF4444";
const FONT   = "'Sora', 'Segoe UI', sans-serif";

// ─── Mock Alert Data ───────────────────────────────────────────────────────────
const INITIAL_ALERTS = [
  { id:1,  type:"error",       message:"Tsunye failed to download physics text. It was not found.", bot:"Bot: Alex",       hapAt:"2024-05-01 10:15", resAt:"2024-05-01 11:00", resBy:"User1" },
  { id:2,  type:"warning",     message:"Bot has gone offline unexpectedly.",                         bot:"Bot: jonny77",    hapAt:"2024-05-01 09:45", resAt:"2024-05-01 10:05", resBy:"User2" },
  { id:3,  type:"error",       message:"Gemini API key failed. Check: markwill32.",                  bot:"Bot: markwill32", hapAt:"2024-05-01 08:30", resAt:"",                  resBy:""      },
  { id:4,  type:"information", message:"The bot has been powered off by Allex.",                    bot:"",                hapAt:"2024-05-01 07:50", resAt:"2024-05-01 08:00", resBy:"User3" },
  { id:5,  type:"error",       message:"Resource not found: 404 error.",                            bot:"Bot: miamvill99", hapAt:"2024-05-01 06:30", resAt:"2024-05-01 07:00", resBy:"User4" },
  { id:6,  type:"error",       message:"API request failed: Timeout error.",                        bot:"Bot: miamvill99", hapAt:"2024-05-01 05:45", resAt:"2024-05-01 06:00", resBy:"User1" },
  { id:7,  type:"warning",     message:"Rate limit approaching for GPT-4 API calls.",               bot:"Bot: jonny77",    hapAt:"2024-04-30 22:10", resAt:"2024-04-30 22:45", resBy:"User2" },
  { id:8,  type:"information", message:"New user registered: rosa_m@domain.com.",                   bot:"",                hapAt:"2024-04-30 20:05", resAt:"2024-04-30 20:05", resBy:"User3" },
  { id:9,  type:"error",       message:"Database connection lost. Retrying in 30s.",                bot:"",                hapAt:"2024-04-30 18:00", resAt:"",                  resBy:""      },
  { id:10, type:"warning",     message:"Disk usage above 85% on server node-02.",                   bot:"",                hapAt:"2024-04-30 15:30", resAt:"2024-04-30 16:00", resBy:"User2" },
  { id:11, type:"error",       message:"WhatsApp session expired for bot lucamich.",                bot:"Bot: lucamich",   hapAt:"2024-04-30 12:00", resAt:"",                  resBy:""      },
  { id:12, type:"information", message:"Scheduled maintenance completed successfully.",             bot:"",                hapAt:"2024-04-30 09:00", resAt:"2024-04-30 09:30", resBy:"User4" },
];

const ALERT_CFG = {
  error:       { bg: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5", dot: "#EF4444", label: "Error"       },
  warning:     { bg: "#FFFBEB", color: "#92400E", border: "#FCD34D", dot: "#F59E0B", label: "Warning"     },
  information: { bg: "#EFF6FF", color: "#1E40AF", border: "#93C5FD", dot: "#3B82F6", label: "Information" },
};

const RES_BY_OPTS = ["User1", "User2", "User3", "User4"];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Online:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Active:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  AlertIco: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Calendar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Print:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Export:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Resolve:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>,
  MarkRead: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  User:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  X:        () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ icon: IconComp, label, value, accent, isMobile }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      padding: isMobile ? "13px 11px" : "14px 16px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      flex: 1, minWidth: isMobile ? "calc(50% - 5px)" : 0,
      borderBottom: `3px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <div style={{ color: accent }}><IconComp /></div>
      <p style={{ margin: 0, fontSize: 10, color: "#6B7280", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#111827", fontFamily: FONT, lineHeight: 1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function AlertBadge({ type }) {
  const c = ALERT_CFG[type] || ALERT_CFG.information;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 99,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: 10, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function StatusBadge({ resolved }) {
  return resolved ? (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:99, background:"#D1FAE5", color:"#065F46", border:"1px solid #6EE7B7", fontSize:10, fontWeight:700, fontFamily:FONT, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:"#10B981", flexShrink:0 }} /> Resolved
    </span>
  ) : (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:99, background:"#FEF3C7", color:"#92400E", border:"1px solid #FCD34D", fontSize:10, fontWeight:700, fontFamily:FONT, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:"#F59E0B", flexShrink:0 }} /> Pending
    </span>
  );
}

// ActionBtn — exact copy from botUsers
function ActionBtn({ icon: IconComp, label, onClick, extraStyle = {} }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "5px 10px", borderRadius: 8, border: "1.5px solid #E2E6F0",
      background: "#fff", color: "#374151", cursor: "pointer",
      fontSize: 11, fontFamily: FONT, fontWeight: 500,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)", whiteSpace: "nowrap",
      ...extraStyle,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = extraStyle.borderColor || "#E2E6F0"; e.currentTarget.style.color = extraStyle.color || "#374151"; }}
    >
      {IconComp && <IconComp />}{label}
    </button>
  );
}

// Dropdown — exact copy from botUsers
function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen(o => !o)}>{trigger(open)}</div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          background: "#fff", borderRadius: 12, border: "1px solid #E2E6F0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.11)", zIndex: 500,
          minWidth: 220, fontFamily: FONT,
        }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

// Alert Type Filter — pill options inside a Dropdown
function AlertTypeDropdown({ value, onChange }) {
  const opts = ["All", "Error", "Warning", "Information"];
  const active = value !== "All";
  return (
    <Dropdown trigger={open => (
      <button style={{
        display:"inline-flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8,
        border:`1.5px solid ${open||active ? BLUE : "#E2E6F0"}`,
        background: open||active ? "#EFF6FF" : "#fff",
        color: active ? BLUE : "#374151",
        cursor:"pointer", fontSize:11, fontFamily:FONT, fontWeight:500,
        boxShadow:"0 1px 2px rgba(0,0,0,0.04)", whiteSpace:"nowrap",
      }}>
        <Icon.Filter />
        {active ? `Type: ${value}` : "Alert Type"}
        {active
          ? <span onClick={e=>{e.stopPropagation();onChange("All");}} style={{marginLeft:2,display:"flex",alignItems:"center",color:"#9CA3AF"}}><Icon.X /></span>
          : <Icon.ChevDown />}
      </button>
    )}>
      {close => (
        <div style={{ padding:"10px 14px 12px" }}>
          <p style={{margin:"0 0 8px",fontSize:9,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.08em"}}>Alert Type</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {opts.map(opt => {
              const sel = value === opt;
              return (
                <button key={opt} onClick={()=>{onChange(opt);close();}} style={{
                  padding:"3px 10px", borderRadius:99, fontSize:11, fontFamily:FONT,
                  fontWeight: sel ? 600 : 400,
                  border:`1.5px solid ${sel ? BLUE : "#E2E6F0"}`,
                  background: sel ? BLUE : "#fff", color: sel ? "#fff" : "#374151", cursor:"pointer",
                }}>{opt}</button>
              );
            })}
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// Resolved By Dropdown
function ResolvedByDropdown({ value, onChange }) {
  const opts = ["All", ...RES_BY_OPTS];
  const active = value !== "All";
  return (
    <Dropdown trigger={open => (
      <button style={{
        display:"inline-flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8,
        border:`1.5px solid ${open||active ? BLUE : "#E2E6F0"}`,
        background: open||active ? "#EFF6FF" : "#fff",
        color: active ? BLUE : "#374151",
        cursor:"pointer", fontSize:11, fontFamily:FONT, fontWeight:500,
        boxShadow:"0 1px 2px rgba(0,0,0,0.04)", whiteSpace:"nowrap",
      }}>
        <Icon.User />
        {active ? value : "Resolved By"}
        {active
          ? <span onClick={e=>{e.stopPropagation();onChange("All");}} style={{marginLeft:2,display:"flex",alignItems:"center",color:"#9CA3AF"}}><Icon.X /></span>
          : <Icon.ChevDown />}
      </button>
    )}>
      {close => (
        <div style={{ padding:"10px 14px 12px" }}>
          <p style={{margin:"0 0 8px",fontSize:9,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.08em"}}>Resolved By</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {opts.map(opt => {
              const sel = value === opt;
              return (
                <button key={opt} onClick={()=>{onChange(opt);close();}} style={{
                  padding:"3px 10px", borderRadius:99, fontSize:11, fontFamily:FONT,
                  fontWeight: sel ? 600 : 400,
                  border:`1.5px solid ${sel ? BLUE : "#E2E6F0"}`,
                  background: sel ? BLUE : "#fff", color: sel ? "#fff" : "#374151", cursor:"pointer",
                }}>{opt}</button>
              );
            })}
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// Date Dropdown — mirrors botUsers DateRangeDropdown
function DateDropdown({ label, value, onChange }) {
  const active = Boolean(value);
  return (
    <Dropdown trigger={open => (
      <button style={{
        display:"inline-flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8,
        border:`1.5px solid ${open||active ? BLUE : "#E2E6F0"}`,
        background: open||active ? "#EFF6FF" : "#fff",
        color: active ? BLUE : "#374151",
        cursor:"pointer", fontSize:11, fontFamily:FONT, fontWeight:500,
        boxShadow:"0 1px 2px rgba(0,0,0,0.04)", whiteSpace:"nowrap",
      }}>
        <Icon.Calendar />
        {active ? value : label}
        {active
          ? <span onClick={e=>{e.stopPropagation();onChange("");}} style={{marginLeft:2,display:"flex",alignItems:"center",color:"#9CA3AF"}}><Icon.X /></span>
          : <Icon.ChevDown />}
      </button>
    )}>
      {close => (
        <div style={{ padding:"14px 16px" }}>
          <p style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:"#374151"}}>{label}</p>
          <input
            type="date" value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:"1.5px solid #E2E6F0", fontFamily:FONT, fontSize:12, boxSizing:"border-box", outline:"none", color:"#111827", background:"#fff" }}
          />
          <div style={{ display:"flex", gap:7, marginTop:10 }}>
            <button onClick={()=>{onChange("");close();}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1px solid #E2E6F0",background:"#fff",fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",color:"#6B7280"}}>Clear</button>
            <button onClick={close} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:BLUE,fontFamily:FONT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff"}}>Apply</button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Alerts({ user, isMobile = false }) {
  const [alerts,   setAlerts]  = useState(INITIAL_ALERTS);
  const [selected, setSelected]= useState([]);
  const [search,   setSearch]  = useState("");
  const [page,     setPage]    = useState(1);
  const [toast,    setToast]   = useState(null);
  const [fType,    setFType]   = useState("All");
  const [fHapAt,   setFHapAt]  = useState("");
  const [fResAt,   setFResAt]  = useState("");
  const [fResBy,   setFResBy]  = useState("All");

  const rowsPerPage = isMobile ? 8 : 10;

  const stats = useMemo(() => ({
    raised:   alerts.length,
    resolved: alerts.filter(a => Boolean(a.resAt)).length,
    pending:  alerts.filter(a => !a.resAt).length,
    errors:   alerts.filter(a => a.type === "error").length,
  }), [alerts]);

  const filtered = useMemo(() => {
    let list = alerts.filter(a =>
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.resBy.toLowerCase().includes(search.toLowerCase()) ||
      a.bot.toLowerCase().includes(search.toLowerCase())
    );
    if (fType !== "All")  list = list.filter(a => a.type === fType.toLowerCase());
    if (fHapAt)           list = list.filter(a => a.hapAt.startsWith(fHapAt));
    if (fResAt)           list = list.filter(a => a.resAt.startsWith(fResAt));
    if (fResBy !== "All") list = list.filter(a => a.resBy === fResBy);
    return list;
  }, [alerts, search, fType, fHapAt, fResAt, fResBy]);

  const totalPages      = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRows        = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selected.includes(r.id));

  const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, []);

  const showToast       = (msg, color = BLUE) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800); };
  const toggleAll       = () => { const ids = pageRows.map(r => r.id); setSelected(p => allPageSelected ? p.filter(id => !ids.includes(id)) : [...new Set([...p, ...ids])]); };
  const toggleRow       = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleDelete    = id => { setAlerts(p => p.filter(a => a.id !== id)); setSelected(p => p.filter(x => x !== id)); showToast("Alert deleted", RED); };
  const handleBulkDelete= () => { setAlerts(p => p.filter(a => !selected.includes(a.id))); showToast(`${selected.length} alert(s) deleted`, RED); setSelected([]); };
  const handleBulkResolve = () => {
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    setAlerts(p => p.map(a => selected.includes(a.id) ? { ...a, resAt: now, resBy: user?.username || "Admin" } : a));
    showToast(`${selected.length} alert(s) resolved`, GREEN); setSelected([]);
  };
  const handleBulkMarkRead = () => { showToast(`${selected.length} alert(s) marked as read`, BLUE); setSelected([]); };

  return (
    <div style={{
      fontFamily: FONT,
      background: "#F0F2F8",
      width: "100%",
      height:  "auto",
      minHeight:1200,
      display: "flex",
      flexDirection: "column",
      padding: isMobile ? "12px" : "20px",
      paddingBottom: selected.length > 0 ? (isMobile ? "100px" : "90px") : (isMobile ? "12px" : "20px"),
      boxSizing: "border-box",
      overflow: "visible",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp  { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        * { box-sizing: border-box; }
        input[type="checkbox"] { width:14px; height:14px; accent-color:${BLUE}; cursor:pointer; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#D1D5DB; border-radius:99px; }
      `}</style>

      {/* Heading */}
      <div style={{ marginBottom: isMobile ? 10 : 14, flexShrink: 0 }}>
        <h1 style={{ margin:0, fontSize: isMobile ? 18 : 22, fontWeight:700, color:"#111827", letterSpacing:"-0.4px" }}>
          Bot Alerts
        </h1>
        <p style={{ margin:"3px 0 0", fontSize:12, color:"#6B7280" }}>
          Monitor, triage and resolve bot alerts. Track resolution status across all bots.
        </p>
      </div>

      {/* Stat Cards — 4-col desktop / 2-col mobile (flex wrap, identical to botUsers) */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:9, marginBottom: isMobile ? 10 : 14, flexShrink:0 }}>
        <StatCard icon={Icon.Users}   label="Alerts Raised"   value={stats.raised}    accent={BLUE}    isMobile={isMobile} />
        <StatCard icon={Icon.Online}  label="Alerts Resolved" value={stats.resolved}  accent="#10B981" isMobile={isMobile} />
        <StatCard icon={Icon.Active}  label="Alerts Pending"  value={stats.pending}   accent="#1E3A8A" isMobile={isMobile} />
        <StatCard icon={Icon.AlertIco}label="Error Alerts"    value={stats.errors}    accent={ORANGE}  isMobile={isMobile} />
      </div>

      {/* Main Panel — exact botUsers structure */}
      <div style={{
        background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
        display: "flex", flexDirection: "column",
        flex: isMobile ? "unset" : "1 1 0",
        overflow: "hidden",
        minHeight: isMobile ? 420 : 0,
      }}>

        {/* Toolbar */}
        <div style={{
          padding: isMobile ? "11px 12px 9px" : "12px 16px 10px",
          borderBottom: "1px solid #F1F5F9", flexShrink: 0,
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        }}>
          {/* Search */}
          <div style={{ position:"relative", flex: isMobile ? "1 1 100%" : "1 1 180px", minWidth:130 }}>
            <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", display:"flex", pointerEvents:"none" }}>
              <Icon.Search />
            </span>
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search alerts…"
              style={{ width:"100%", padding:"6px 10px 6px 30px", borderRadius:9, border:"1.5px solid #E2E6F0", background:"#fff", fontFamily:FONT, fontSize:12, outline:"none", color:"#111827" }}
            />
          </div>

          {/* Filters */}
          <AlertTypeDropdown  value={fType}  onChange={v => { setFType(v);  setPage(1); }} />
          <DateDropdown label="Happens At"   value={fHapAt} onChange={v => { setFHapAt(v); setPage(1); }} />
          <DateDropdown label="Resolved At"  value={fResAt} onChange={v => { setFResAt(v); setPage(1); }} />
          <ResolvedByDropdown value={fResBy} onChange={v => { setFResBy(v); setPage(1); }} />

          {/* Print */}
          <ActionBtn icon={Icon.Print} label="Print" />

          {/* Export — pushed to far right */}
          <ActionBtn icon={Icon.Export} label="Export" extraStyle={{ marginLeft:"auto" }} />
        </div>

        {/* Table wrapper — exact botUsers scroll pattern */}
        <div style={{
          flex: "none",
          overflowY: "visible",
          overflowX: "auto",
          width: "100%",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
            minWidth: 980,
          }}>
            <colgroup>
              <col style={{ width:"3.5%" }} />
              <col style={{ width:"4%"   }} />
              <col style={{ width:"10%"  }} />
              <col style={{ width:"9%"   }} />
              <col style={{ width:"24%"  }} />
              <col style={{ width:"11%"  }} />
              <col style={{ width:"11%"  }} />
              <col style={{ width:"9%"   }} />
              <col style={{ width:"8%"   }} />
            </colgroup>

            {/* Sticky header */}
            <thead style={{ position:"sticky", top:0, zIndex:10 }}>
              <tr style={{ background:"#F8FAFC", borderBottom:"1.5px solid #E5E7EB" }}>
                {[
                  { el: <input type="checkbox" checked={allPageSelected} onChange={toggleAll} /> },
                  { label:"No."         },
                  { label:"Alert Type"  },
                  { label:"Status"      },
                  { label:"Message"     },
                  { label:"Happens At"  },
                  { label:"Resolved At" },
                  { label:"Resolved By" },
                  { label:"Actions"     },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding:"9px 10px", textAlign:"left",
                    fontSize:10, fontWeight:700, color:"#6B7280",
                    textTransform:"uppercase", letterSpacing:"0.06em",
                    fontFamily:FONT, whiteSpace:"nowrap",
                    background:"#F8FAFC",
                  }}>
                    {col.el || col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageRows.map((a, idx) => {
                const isSel    = selected.includes(a.id);
                const resolved = Boolean(a.resAt);
                return (
                  <tr key={a.id}
                    style={{ background: isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom:"1px solid #F1F5F9", transition:"background .1s" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F5F8FF"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC"; }}
                  >
                    <td style={{ padding:"9px 10px" }}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleRow(a.id)} />
                    </td>
                    <td style={{ padding:"9px 10px", fontSize:11, color:"#9CA3AF", fontFamily:FONT }}>
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>
                    <td style={{ padding:"9px 10px" }}>
                      <AlertBadge type={a.type} />
                    </td>
                    <td style={{ padding:"9px 10px" }}>
                      <StatusBadge resolved={resolved} />
                    </td>
                    <td style={{ padding:"9px 10px" }}>
                      <div style={{ fontSize:12, color:"#111827", fontFamily:FONT, lineHeight:1.4, wordBreak:"break-word" }}>
                        {a.message}
                      </div>
                      {a.bot && (
                        <div style={{ fontSize:10, color:"#9CA3AF", marginTop:2, fontFamily:FONT }}>{a.bot}</div>
                      )}
                    </td>
                    <td style={{ padding:"9px 10px", fontSize:11, color:"#374151", fontFamily:FONT, whiteSpace:"nowrap" }}>
                      {a.hapAt || "—"}
                    </td>
                    <td style={{ padding:"9px 10px", fontSize:11, fontFamily:FONT, whiteSpace:"nowrap", color: resolved ? "#374151" : "#D1D5DB" }}>
                      {a.resAt || "—"}
                    </td>
                    <td style={{ padding:"9px 10px", fontSize:11, fontFamily:FONT, whiteSpace:"nowrap" }}>
                      {a.resBy
                        ? <span style={{ background:"#F0F2F8", borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:600, color:"#374151" }}>{a.resBy}</span>
                        : <span style={{ color:"#D1D5DB" }}>—</span>}
                    </td>
                    <td style={{ padding:"9px 10px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        <button
                          title="Edit"
                          style={{ background:"#EFF6FF", border:"none", borderRadius:7, padding:"5px 6px", cursor:"pointer", color:BLUE, display:"flex" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                          onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}
                        >
                          <Icon.Edit />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(a.id)}
                          style={{ background:"#FEF2F2", border:"none", borderRadius:7, padding:"5px 6px", cursor:"pointer", color:RED, display:"flex" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                          onMouseLeave={e => e.currentTarget.style.background = "#FEF2F2"}
                        >
                          <Icon.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding:"40px 0", textAlign:"center", color:"#9CA3AF", fontFamily:FONT, fontSize:13 }}>
                    No alerts found{search ? ` matching "${search}"` : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — exact botUsers pattern */}
        <div style={{
          padding:"9px 16px", borderTop:"1px solid #F1F5F9", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:7,
        }}>
          <p style={{ margin:0, fontSize:11, color:"#6B7280", fontFamily:FONT }}>
            Showing <b>{filtered.length===0 ? 0 : (page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage, filtered.length)}</b> of <b>{filtered.length}</b> alerts
          </p>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            {page > 1 && (
              <button onClick={() => setPage(p => p-1)} style={{ width:28, height:28, borderRadius:7, border:"1px solid #E2E6F0", background:"#fff", fontFamily:FONT, fontSize:13, cursor:"pointer", color:"#374151" }}>‹</button>
            )}
            {paginationPages.map((p, i) =>
              p === "…"
                ? <span key={`e${i}`} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#9CA3AF" }}>…</span>
                : <button key={p} onClick={() => setPage(p)} style={{ width:28, height:28, borderRadius:7, border: page===p ? "none" : "1px solid #E2E6F0", background: page===p ? BLUE : "#fff", color: page===p ? "#fff" : "#374151", fontFamily:FONT, fontWeight: page===p ? 700 : 500, fontSize:11, cursor:"pointer" }}>{p}</button>
            )}
            {page < totalPages && (
              <button onClick={() => setPage(p => Math.min(p+1, totalPages))} style={{ width:28, height:28, borderRadius:7, border:"1px solid #E2E6F0", background:"#fff", fontFamily:FONT, fontSize:13, cursor:"pointer", color:"#374151" }}>›</button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selected.length > 0 && (
        <div style={{
          position:"fixed", bottom:24, left:"50%",
          transform:"translateX(-50%)",
          background:"#1E293B", borderRadius:999,
          padding: isMobile ? "10px 14px" : "11px 18px",
          display:"flex", alignItems:"center", gap: isMobile ? 6 : 10,
          boxShadow:"0 12px 40px rgba(0,0,0,0.3)",
          zIndex:1000, fontFamily:FONT,
          flexWrap: isMobile ? "wrap" : "nowrap",
          justifyContent:"center",
          maxWidth: isMobile ? "calc(100vw - 24px)" : "none",
          animation:"slideUp .25s ease",
        }}>
          <span style={{ fontSize:12, color:"#94A3B8", fontWeight:600, whiteSpace:"nowrap" }}>
            {selected.length} selected
          </span>
          <div style={{ width:1, height:20, background:"#334155", flexShrink:0 }} />

          {/* Resolve */}
          <button onClick={handleBulkResolve} style={{
            display:"inline-flex", alignItems:"center", gap:5,
            padding:"7px 14px", borderRadius:999, border:"none",
            background:GREEN, color:"#fff",
            fontFamily:FONT, fontWeight:700, fontSize:12, cursor:"pointer",
            boxShadow:`0 2px 10px ${GREEN}55`, whiteSpace:"nowrap",
          }}>
            <Icon.Resolve /> Resolve ({selected.length})
          </button>

          {/* Mark as Read */}
          <button onClick={handleBulkMarkRead} style={{
            display:"inline-flex", alignItems:"center", gap:5,
            padding:"7px 14px", borderRadius:999, border:"none",
            background:BLUE, color:"#fff",
            fontFamily:FONT, fontWeight:700, fontSize:12, cursor:"pointer",
            boxShadow:`0 2px 10px ${BLUE}55`, whiteSpace:"nowrap",
          }}>
            <Icon.MarkRead /> Mark as Read ({selected.length})
          </button>

          {/* Delete */}
          <button onClick={handleBulkDelete} style={{
            display:"inline-flex", alignItems:"center", gap:5,
            padding:"7px 14px", borderRadius:999, border:"none",
            background:RED, color:"#fff",
            fontFamily:FONT, fontWeight:700, fontSize:12, cursor:"pointer",
            boxShadow:`0 2px 10px ${RED}55`, whiteSpace:"nowrap",
          }}>
            <Icon.Trash /> Delete Selected
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setSelected([])}
            style={{ background:"transparent", border:"none", cursor:"pointer", color:"#64748B", display:"flex", padding:4 }}
            title="Clear selection"
          >
            <Icon.X />
          </button>
        </div>
      )}

      {/* Toast notification — exact botUsers pattern */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, background:"#1E293B", color:"#fff",
          padding:"11px 18px", borderRadius:12, fontFamily:FONT, fontSize:13, fontWeight:600,
          boxShadow:"0 8px 30px rgba(0,0,0,0.18)", zIndex:2000,
          borderLeft:`4px solid ${toast.color}`,
          animation:"fadeInUp .3s ease",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}