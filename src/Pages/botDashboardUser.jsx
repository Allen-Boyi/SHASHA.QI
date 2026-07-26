import { useState, useMemo, useRef, useEffect } from "react";
import AddNewUser from "../components/AddNewUser";
import SendWhatsApp from "../components/SendWhatsApp";  
import ComposeMessage from "../components/ComposeMessage";
// ─── Brand tokens (identical to botUsers) ─────────────────────────────────────
const BLUE   = "#4B6EF5";
const ORANGE = "#E85D04";
const FONT   = "'Sora', 'Segoe UI', sans-serif";
const baseURL=import.meta.env.VITE_BASEURL;
// ─── Mock data ────────────────────────────────────────────────────────────────


// ─── Status palette (same pattern as botUsers) ───────────────────────────────
const STATUS_STYLES = {
  "Active":        { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  "Inactive":      { bg: "#E5E7EB", color: "#374151", border: "#9CA3AF" },
  "Not Confirmed": { bg: "#FEF3C7", color: "#78350F", border: "#FCD34D" },
  "Pending":       { bg: "#DBEAFE", color: "#1E3A8A", border: "#93C5FD" },
};

// ─── Role palette ─────────────────────────────────────────────────────────────
const ROLE_STYLES = {
  "Super Admin": { bg: "#EDE9FE", color: "#5B21B6" },
  "Admin":       { bg: "#EFF6FF", color: "#1E40AF" },
  "Developer":   { bg: "#D1FAE5", color: "#065F46" },
  "Auditor":     { bg: "#FEF3C7", color: "#78350F" },
  "Manager":     { bg: "#FEE2E2", color: "#7F1D1D" },
};

// ─── Icons (same set as botUsers + new ones) ──────────────────────────────────
const Icon = {
  Users:    () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield:   () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Chart:    () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Alert:    () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Calendar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Mail:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  UserPlus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  WA:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  Print:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Export:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Ban:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Eye:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Unlock:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  X:        () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Sort:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>,
};

// ─── StatCard (identical to botUsers) ─────────────────────────────────────────
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
      <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#111827", fontFamily: FONT, lineHeight: 1 }}>{value.toLocaleString()}</p>
    </div>
  );
}

// ─── StatusBadge (identical to botUsers) ─────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10, fontWeight: 600, fontFamily: FONT, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

// ─── RoleBadge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] || { bg: "#F3F4F6", color: "#374151" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 6,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap",
    }}>{role}</span>
  );
}

// ─── ActionBtn (identical to botUsers) ───────────────────────────────────────
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

// ─── Dropdown (identical to botUsers — closes on outside click) ───────────────
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
          minWidth: 240, fontFamily: FONT,
        }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

// ─── Filter Dropdown (adapted for this component's filter keys) ───────────────
function FilterDropdown({ filters, onChange }) {
  const sections = [
    { key: "status", label: "Status",  opts: ["All", "Active", "Inactive", "Not Confirmed", "Pending"] },
    { key: "role",   label: "Role",    opts: ["All", "Super Admin", "Admin", "Developer", "Auditor", "Manager"] },
    { key: "sort",   label: "Sort By", opts: ["Default", "A–Z Username", "Date Joined", "Last Activity"] },
  ];
  const activeCount = Object.entries(filters).filter(([, v]) => v !== "All" && v !== "Default").length;
  return (
    <Dropdown trigger={open => (
      <button style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 10px", borderRadius: 8,
        border: `1.5px solid ${open || activeCount > 0 ? BLUE : "#E2E6F0"}`,
        background: open || activeCount > 0 ? "#EFF6FF" : "#fff",
        color: activeCount > 0 ? BLUE : "#374151",
        cursor: "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)", whiteSpace: "nowrap",
      }}>
        <Icon.Filter /> Filter
        {activeCount > 0 && (
          <span style={{ background: BLUE, color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{activeCount}</span>
        )}
        <Icon.ChevDown />
      </button>
    )}>
      {close => (
        <div>
          {sections.map(({ key, label, opts }) => (
            <div key={key} style={{ padding: "8px 14px 10px", borderBottom: "1px solid #F3F4F6" }}>
              <p style={{ margin: "0 0 7px", fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {opts.map(opt => {
                  const active = filters[key] === opt;
                  return (
                    <button key={opt} onClick={() => onChange(key, opt)} style={{
                      padding: "3px 9px", borderRadius: 99, fontSize: 11, fontFamily: FONT,
                      fontWeight: active ? 600 : 400,
                      border: `1.5px solid ${active ? BLUE : "#E2E6F0"}`,
                      background: active ? BLUE : "#fff",
                      color: active ? "#fff" : "#374151", cursor: "pointer",
                    }}>{opt}</button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ padding: "8px 14px" }}>
            <button onClick={() => { onChange("_reset"); close(); }}
              style={{ fontSize: 11, color: "#EF4444", fontFamily: FONT, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// ─── Date Range Dropdown (identical to botUsers) ──────────────────────────────
function DateRangeDropdown({ dateRange, setDateRange }) {
  const hasDate = dateRange.start || dateRange.end;
  return (
    <Dropdown trigger={open => (
      <button style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 10px", borderRadius: 8,
        border: `1.5px solid ${open || hasDate ? BLUE : "#E2E6F0"}`,
        background: open || hasDate ? "#EFF6FF" : "#fff",
        color: hasDate ? BLUE : "#374151",
        cursor: "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)", whiteSpace: "nowrap",
      }}>
        <Icon.Calendar />
        {hasDate ? `${dateRange.start || "…"} → ${dateRange.end || "…"}` : "Date Range"}
        {hasDate
          ? <span onClick={e => { e.stopPropagation(); setDateRange({ start: "", end: "" }); }} style={{ marginLeft: 2, display: "flex", alignItems: "center", color: "#9CA3AF" }}><Icon.X /></span>
          : <Icon.ChevDown />}
      </button>
    )}>
      {close => (
        <div style={{ padding: "14px 16px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#374151" }}>Select Date Range</p>
          {[["Start Date", "start"], ["End Date", "end"]].map(([lbl, key]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 10, color: "#6B7280", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</label>
              <input type="date" value={dateRange[key]} onChange={e => setDateRange(d => ({ ...d, [key]: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 12, boxSizing: "border-box", outline: "none", color: "#111827", background: "#fff" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 7, marginTop: 4 }}>
            <button onClick={() => setDateRange({ start: "", end: "" })} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B7280" }}>Clear</button>
            <button onClick={close} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", background: BLUE, fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}>Apply</button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, color }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, background: "#1E293B", color: "#fff",
      padding: "11px 18px", borderRadius: 12, fontFamily: FONT, fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,0.18)", zIndex: 2000,
      borderLeft: `4px solid ${color}`,
      animation: "fadeInUp .3s ease",
    }}>{msg}</div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BotDashboardUser({ isMobile = false }) {
  const [users, setUsers]       = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [toast, setToast]       = useState(null);
  const [filters, setFilters]   = useState({ status: "All", role: "All", sort: "Default" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const rowsPerPage = isMobile ? 8 : 10;
  // 1. Add state at the top of your component
  const [showAddUser, setShowAddUser] = useState(false);
  const [showWhatsApp,setShowWhatsApp]=useState(false);
  const [showComposeMessage,setShowComposeMessage]=useState(false);


  // ── Filter handler ────────────────────────────────────────────────────────
  const handleFilterChange = (key, val) => {
    if (key === "_reset") { setFilters({ status: "All", role: "All", sort: "Default" }); return; }
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const fetchUsers=async()=>{
    try{
        const res = await fetch(`${baseURL}/api/users`,
          {method:"GET",
            headers:{"Content-Type":"application/json"}
          }
        );
        const data=await res.json();
        if (!res.ok){
          console.warn("Error occurred, ",data.message);
          return;
        }
        console.table(data.users);
        setUsers(data.users);
    }catch(error){
      console.error("Error while connecting to the server, ",error)
    }
  }
  useEffect(()=>{
    fetchUsers()
  },[])
    const formattedDate ='kkkk'
  console.log("^The year is: ",formattedDate)
  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users.filter(u =>
      u.username && typeof u.username === 'string' ? u.username.toLowerCase().includes(search.toLowerCase()) : false ||
      u.email && typeof u.email === 'string' ? u.email.toLowerCase().includes(search.toLowerCase()) : false ||
      u.sid && typeof u.sid === 'string' ? u.sid.toLowerCase().includes(search.toLowerCase()) : false ||
      u.role && typeof u.role === 'string' ? u.role.toLowerCase().includes(search.toLowerCase()) : false
    );

    if (filters.status !== "All") {
      list = list.filter(u => u.status && typeof u.status === 'string' ? u.status === filters.status : false);
    }

    if (filters.role !== "All") {
      list = list.filter(u => u.role && typeof u.role === 'string' ? u.role === filters.role : false);
    }

    if (filters.sort === "A–Z Username" && users[0]?.username) {
      list = [...list].sort((a, b) => a.username.toLowerCase().localeCompare(b.username));
    }

    if (filters.sort === "Date Joined") {
      list = [...list].sort((a, b) => new Date(a.joined) - new Date(b.joined));
    }

    if (filters.sort === "Last Activity" && users[0]?.lastActivity) {
      list = [...list].sort((a, b) => a.lastActivity.toLowerCase().localeCompare(b.lastActivity));
    }

    return list;
  }, [users, search, filters]);


  const totalPages      = Math.ceil(filtered.length / rowsPerPage) || 1;
  const pageRows        = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selected.includes(r.id));

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, color = BLUE) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800); };

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleAll = () => {
    const ids = pageRows.map(r => r.id);
    setSelected(p => allPageSelected ? p.filter(id => !ids.includes(id)) : [...new Set([...p, ...ids])]);
  };
  const toggleRow = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ── Row ops ────────────────────────────────────────────────────────────────
  const handleBan    = id => { setUsers(p => p.map(u => u.id === id ? { ...u, status: "Inactive" } : u)); showToast("User deactivated", ORANGE); };
  const handleDelete = id => { setUsers(p => p.filter(u => u.id !== id)); setSelected(p => p.filter(x => x !== id)); showToast("User deleted", "#EF4444"); };
  const handleUnblock = () => {
    setUsers(p => p.map(u => selected.includes(u.id) && u.status === "Inactive" ? { ...u, status: "Active" } : u));
    showToast(`${selected.length} user(s) unblocked`, "#059669"); setSelected([]);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    registered:     users.length,
    online:         users.filter(u => u.status === "Active").length,
    activeWeek:     users.filter(u => ["Active", "Pending"].includes(u.status)).length,
    inactiveBanned: users.filter(u => ["Inactive", "Not Confirmed"].includes(u.status)).length,
  };

  // ── Pagination pages (identical to botUsers) ───────────────────────────────
  const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, []);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: FONT,
      background: "#F0F2F8",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      padding: isMobile ? "12px" : "20px",
      boxSizing: "border-box",
      /* Page-level scroll: the entire component scrolls as one piece —
         no inner table overflow-y. The table always shows in full.     */
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input[type="checkbox"] { width:14px; height:14px; accent-color:${BLUE}; cursor:pointer; }
        ::-webkit-scrollbar       { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background:#D1D5DB; border-radius:99px; }
      `}</style>

      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: isMobile ? 10 : 12, flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 21, fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
          User Management
        </h1>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6B7280" }}>
          Manage all users in one place. Control access, assign roles, and monitor activity.
        </p>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: isMobile ? 10 : 12, flexShrink: 0 }}>
        <StatCard icon={Icon.Users}  label="Registered Users"  value={stats.registered}    accent={BLUE}    isMobile={isMobile} />
        <StatCard icon={Icon.Shield} label="Online Now"         value={stats.online}         accent="#10B981" isMobile={isMobile} />
        <StatCard icon={Icon.Chart}  label="Active This Week"   value={stats.activeWeek}     accent="#1E3A8A" isMobile={isMobile} />
        <StatCard icon={Icon.Alert}  label="Inactive & Pending" value={stats.inactiveBanned} accent={ORANGE}  isMobile={isMobile} />
      </div>

      {/* ── Main Card (no flex:1 — height driven by table content) ──────── */}
      <div style={{
        background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div style={{
          padding: isMobile ? "11px 12px 9px" : "12px 16px 10px",
          borderBottom: "1px solid #F1F5F9", flexShrink: 0,
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        }}>
          {/* Search (grows to fill available space on the left) */}
          <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "1 1 180px", minWidth: 130 }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", display: "flex", pointerEvents: "none" }}>
              <Icon.Search />
            </span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users…"
              style={{
                width: "100%", padding: "6px 10px 6px 30px",
                borderRadius: 9, border: "1.5px solid #E2E6F0",
                background: "#fff", fontFamily: FONT, fontSize: 12,
                outline: "none", color: "#111827",
              }}
            />
          </div>

          {/* Filter + Date Range (left-aligned controls) */}
          <FilterDropdown filters={filters} onChange={handleFilterChange} />
          <DateRangeDropdown dateRange={dateRange} setDateRange={setDateRange} />

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "#E5E7EB", margin: "0 2px" }} />

          {/* Action buttons (centred/left) */}
          <ActionBtn icon={Icon.Mail} onClick={()=>setShowComposeMessage(true)} label="Send Email" />
          <ActionBtn icon={Icon.WA}    label="WhatsApp" onClick={()=>setShowWhatsApp(true)}  extraStyle={{ color: "#059669", borderColor: "#D1FAE5" }} />
          <ActionBtn icon={Icon.Print} label="Print" />

          {/* Export pushed to the far right */}
          <ActionBtn
            icon={Icon.UserPlus}
            label="Add User"
            onClick={() => setShowAddUser(true)}
            extraStyle={{ marginLeft: "auto", background: BLUE, color: "#fff", borderColor: BLUE, fontWeight: 700 }}
          />
          <ActionBtn icon={Icon.Export} label="Export"
            extraStyle={{ marginLeft: "8px", background: BLUE, color: "#fff", borderColor: BLUE, fontWeight: 700 }}
          />

          {/* ── Bulk actions (appear when rows are selected) ── */}
          {selected.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", width: "100%", paddingTop: 4 }}>
              <div style={{ width: 1, height: 20, background: "#E2E6F0" }} />
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>
                {selected.length} selected
              </span>
              <button onClick={handleUnblock} style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px",
                borderRadius: 9, border: `1.5px solid ${BLUE}`, background: "#EFF6FF", color: BLUE,
                fontFamily: FONT, fontWeight: 700, fontSize: 11, cursor: "pointer",
              }}>
                <Icon.Unlock /> Unblock
              </button>
              <button onClick={() => setSelected([])} style={{
                display: "inline-flex", alignItems: "center", padding: "5px 7px",
                borderRadius: 8, border: "1.5px solid #E2E6F0",
                background: "#fff", color: "#9CA3AF", cursor: "pointer",
              }}>
                <Icon.X />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TABLE WRAPPER
            • overflowX: auto  → horizontal scroll on tablet & mobile
            • overflowY: visible → page-level vertical scroll (no inner scroll)
            • table-layout: fixed  on desktop → fills width, no hscroll
            • table-layout: auto + minWidth on mobile → horizontal scroll
        ════════════════════════════════════════════════════════════════ */}
        <div style={{
          overflowX: "auto",
          overflowY: "visible",
          width: "100%",
          WebkitOverflowScrolling: "touch",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: isMobile ? "auto" : "fixed",
            minWidth:  800 ,/* Ensures horizontal scroll on mobile, full width on desktop  */
          }}>
            {/* Desktop column proportions */}
            {!isMobile && (
              <colgroup>
                <col style={{ width: "40px" }} /> {/* Fixed width for checkbox */}
                <col style={{ width: "5%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "110px" }} /> {/* Fixed width for Actions */}
              </colgroup>
            )}

            {/* Sticky header */}
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E5E7EB" }}>
                {[
                  { el: <input type="checkbox" checked={allPageSelected} onChange={toggleAll} /> },
                  {label:"No."},
                  { label: "JID Number"    },
                  { label: "Email"         },
                  { label: "Username"      },
                  { label: "Role"          },
                  { label: "Last Activity" },
                  { label: "Last Login"    },
                  { label: "Status"        },
                  { label: "Actions"       },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: "9px 10px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, color: "#6B7280",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    fontFamily: FONT, whiteSpace: "nowrap",
                    background: "#F8FAFC",
                  }}>
                    {col.el || col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageRows.map((u, idx) => {
                const isSel = selected.includes(u.id);
                return (
                  <tr key={u.id}
                    style={{ background: isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: "1px solid #F1F5F9", transition: "background .1s" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F5F8FF"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC"; }}
                  >
                    {/* ☐ */}
                    <td style={{ padding: "8px 10px" }}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleRow(u.id)} />
                    </td>
                    {/* No. */}
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "#6B7280", fontFamily: FONT, whiteSpace: "nowrap" }}>
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>
                    {/* JID */}
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "#374151", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.sid}
                    </td>
                    {/* Email */}
                    <td style={{ padding: "8px 10px", fontSize: 11, color: BLUE, fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </td>
                    {/* Username */}
                    <td style={{ padding: "8px 10px", fontSize: 11, fontWeight: 600, color: "#111827", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.username}
                    </td>
                    {/* Role */}
                    <td style={{ padding: "8px 10px" }}>
                      <RoleBadge role={u.role} />
                    </td>
                    {/* Last Activity */}
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "#6B7280", fontFamily: FONT, whiteSpace: "nowrap" }}>
                      {u.joined? new Date(u.joined).toLocaleDateString('en-GB',{
                                  day:'numeric',
                                  month:'short',
                                  year:"numeric"
                                }):"N/A"}
                    </td>
                    {/* Last Login */}
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "#374151", fontFamily: FONT, whiteSpace: "nowrap" }}>
                      {u.lastLogin}
                    </td>
                    {/* Status */}
                    <td style={{ padding: "8px 10px" }}>
                      <StatusBadge status={u.status&&u.is_confirmed?"Active":"Not Active"} />
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {/* Edit */}
                        <button title="Edit" onClick={() => showToast(`Editing @${u.username}`, BLUE)}
                          style={{ background: "#EFF6FF", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: BLUE, display: "flex" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                          onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}
                        ><Icon.Edit /></button>
                        {/* View */}
                        <button title="View" onClick={() => showToast(`Viewing @${u.username}`, "#6B7280")}
                          style={{ background: "#F3F4F6", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: "#6B7280", display: "flex" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#E5E7EB"}
                          onMouseLeave={e => e.currentTarget.style.background = "#F3F4F6"}
                        ><Icon.Eye /></button>
                        {/* Ban */}
                        <button title="Deactivate" onClick={() => handleBan(u.id)}
                          style={{ background: "#FEF3C7", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: ORANGE, display: "flex" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FDE68A"}
                          onMouseLeave={e => e.currentTarget.style.background = "#FEF3C7"}
                        ><Icon.Ban /></button>
                        {/* Delete */}
                        <button title="Delete" onClick={() => handleDelete(u.id)}
                          style={{ background: "#FEF2F2", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: "#DC2626", display: "flex" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                          onMouseLeave={e => e.currentTarget.style.background = "#FEF2F2"}
                        ><Icon.Trash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
                    
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: "36px 0", textAlign: "center", color: "#9CA3AF", fontFamily: FONT, fontSize: 13 }}>
                    No users found{search ? ` matching "${search}"` : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination (identical to botUsers) ───────────────────────── */}
        <div style={{
          padding: "9px 16px", borderTop: "1px solid #F1F5F9", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 7,
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: FONT }}>
            Showing <b>{filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)}</b> of <b>{filtered.length}</b> users
          </p>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {page > 1 && (
              <button onClick={() => setPage(p => p - 1)} style={pgBtn}>‹</button>
            )}
            {paginationPages.map((p, i) =>
              p === "…"
                ? <span key={`e${i}`} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9CA3AF" }}>…</span>
                : <button key={p} onClick={() => setPage(p)} style={{
                    ...pgBtn,
                    border: page === p ? "none" : "1px solid #E2E6F0",
                    background: page === p ? BLUE : "#fff",
                    color: page === p ? "#fff" : "#374151",
                    fontWeight: page === p ? 700 : 500,
                  }}>{p}</button>
            )}
            {page < totalPages && (
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} style={pgBtn}>›</button>
            )}
          </div>
        </div>
      </div>
      {/* // 3. Add the modal just before your closing return tag */}
      {showAddUser && (
        <AddNewUser
          onClose={() => setShowAddUser(false)}
          onSuccess={() => {
            setShowAddUser(false);
            // optionally refresh your user list here
          }}
        />
      )}
      {/* {} */}
      {
        showWhatsApp&& (
          <SendWhatsApp context="dashboard" onClose={()=>setShowWhatsApp(false)}
          onSuccess={()=>{setShowWhatsApp(false);
          }}
          />
        )
      }
      {/*  */}
      {
        showComposeMessage&&(
          <ComposeMessage context="dashboard" onClose={()=>setShowComposeMessage(false)}
          onSuccess={()=>setShowComposeMessage(false)}
          />
        )
      }
      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </div>
    
  );
}

// ─── Style helpers ─────────────────────────────────────────────────────────────
const pgBtn = {
  width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E6F0",
  background: "#fff", fontFamily: FONT, fontSize: 13,
  cursor: "pointer", color: "#374151",
  display: "flex", alignItems: "center", justifyContent: "center",
};