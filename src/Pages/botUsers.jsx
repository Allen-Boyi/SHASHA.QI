import { useState, useEffect, useRef } from "react";
import ComposeMessage from "../components/ComposeMessage";
import SendWhatsApp   from "../components/SendWhatsApp";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = "#4B6EF5";
const ORANGE = "#E85D04";
const BG     = "#F0F2F8";
const FONT   = "'Sora', 'Segoe UI', sans-serif";

const API_BASE = `${import.meta.env.VITE_BASEURL}/api/botusers`;

// ─── Status palette ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Active:    { bg:"#D1FAE5", color:"#065F46", border:"#6EE7B7" },
  Inactive:  { bg:"#E5E7EB", color:"#374151", border:"#9CA3AF" },
  Banned:    { bg:"#FEE2E2", color:"#7F1D1D", border:"#FCA5A5" },
  Pending:   { bg:"#DBEAFE", color:"#1E3A8A", border:"#93C5FD" },
  Suspended: { bg:"#FEF3C7", color:"#78350F", border:"#FCD34D" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Online:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Chart:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Alert:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Search:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Calendar: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Mail:     () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  WA:       () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  Print:    () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Export:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Edit:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Ban:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Unlock:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Suspend:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Trash:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Download: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  X:        () => <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: IconComp, label, value, accent, isMobile }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      padding: isMobile ? "13px 12px" : "15px 18px",
      boxShadow: "0 1px 6px rgba(15,23,41,0.07), 0 0 0 1px rgba(15,23,41,0.04)",
      flex: 1, minWidth: isMobile ? "calc(50% - 6px)" : 0,
      borderBottom: `3px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 5,
      transition: "box-shadow 0.18s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,41,0.11)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 6px rgba(15,23,41,0.07), 0 0 0 1px rgba(15,23,41,0.04)"}
    >
      <div style={{ color: accent }}><IconComp /></div>
      <p style={{ margin: 0, fontSize: 10, color: "#6B7280", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#111827", fontFamily: FONT, lineHeight: 1.1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, fontFamily: FONT, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── TSelect ─────────────────────────────────────────────────────────────────
function TSelect({ value, onChange, children, minW = 110 }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ height: 33, padding: "0 28px 0 10px", borderRadius: 8, border: "1px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, color: "#2D3A55", outline: "none", appearance: "none", cursor: "pointer", minWidth: minW }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e  => e.target.style.borderColor = "#E2E6F0"}
      >
        {children}
      </select>
      <span style={{ position: "absolute", right: 8, pointerEvents: "none", color: "#7B8AAB", display: "flex" }}>
        <Icon.ChevDown />
      </span>
    </div>
  );
}

// ─── TBtn ────────────────────────────────────────────────────────────────────
function TBtn({ icon: IconComp, label, onClick, variant = "default" }) {
  const base = {
    height: 33, padding: "0 12px", borderRadius: 8,
    border: "1px solid #E2E6F0", background: "#fff",
    fontFamily: FONT, fontSize: 12, fontWeight: 500, color: "#2D3A55",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    whiteSpace: "nowrap", transition: "all 0.13s",
  };
  const variants = {
    default: {},
    primary: { background: BLUE,      color: "#fff", border: `1px solid ${BLUE}`, fontWeight: 600 },
    success: {},
    orange:  {},
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => {
        if (variant === "primary") { e.currentTarget.style.background = "#3A5DE0"; }
        else if (variant === "success") { e.currentTarget.style.background = "#E6F9F0"; e.currentTarget.style.color = "#17A34A"; e.currentTarget.style.borderColor = "#17A34A"; }
        else if (variant === "orange")  { e.currentTarget.style.background = "#FEF0E7"; e.currentTarget.style.color = ORANGE;    e.currentTarget.style.borderColor = ORANGE; }
        else { e.currentTarget.style.background = "#F0F2F8"; e.currentTarget.style.borderColor = "#CBD2E8"; }
      }}
      onMouseLeave={e => {
        if (variant === "primary") { e.currentTarget.style.background = BLUE; }
        else { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2D3A55"; e.currentTarget.style.borderColor = "#E2E6F0"; }
      }}
    >
      {IconComp && <IconComp />}{label}
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, color }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#1E293B", color: "#fff", padding: "11px 18px", borderRadius: 12, fontFamily: FONT, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.18)", borderLeft: `4px solid ${color}`, pointerEvents: "none", maxWidth: 320 }}>
      {msg}
    </div>
  );
}

// ─── Pagination helper ────────────────────────────────────────────────────────
function buildPageNums(page, total) {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
  if (page < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
function buildApiParams({ page, rowsPerPage, search, statusF, sortBy, sortDir }) {
  const params  = new URLSearchParams({ page, per_page: rowsPerPage, sort_dir: sortDir });
  const sortMap = { username: "username", joined: "joined", active: "last_active" };
  if (search)            params.set("search",  search);
  if (statusF !== "all") params.set("status",  statusF);
  if (sortMap[sortBy])   params.set("sort_by", sortMap[sortBy]);
  return params.toString();
}

function normaliseUser(u) {
  return {
    id:          u.id ?? u.wuser_id,
    name:        u.name ?? u.username?.replace(/^@/, ""),
    username:    u.name ?? u.username?.replace(/^@/, ""),
    jid:         u.jid,
    accountTier: u.account_tier ?? "Free",
    status:      u.status ?? "Active",
    levelName:   u.level_name ?? "General",
    joined:      u.joined ?? "—",
    lastActive:  u.last_active ?? "—",
    downloads:   u.downloads ?? u.download_counts ?? 0,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BotUsers({ isMobile = false }) {

  // ── Server state ───────────────────────────────────────────────────────────
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ total_records: 0, total_pages: 1, current_page: 1, per_page: 10 });
  const [summary, setSummary]       = useState({ total_active: 0, total_banned: 0, total_flagged: 0 });
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(null);

  // ── Filter / sort state ────────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [statusF, setStatusF]         = useState("all");
  const [downloadsF, setDownloadsF]   = useState("all");
  const [sortBy, setSortBy]           = useState("default");
  const [sortDir, setSortDir]         = useState("desc");
  const [dateFrom, setDateFrom]       = useState("");
  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selected, setSelected]         = useState([]);
  const [showCompose, setShowCompose]   = useState(false);  // Email modal
  const [showWhatsApp, setShowWhatsApp] = useState(false);  // WhatsApp modal
  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiError(null);

    fetch(`${API_BASE}?${buildApiParams({ page, rowsPerPage, search, statusF, sortBy, sortDir })}`)
      .then(r => { if (!r.ok) throw new Error(`Server error ${r.status}`); return r.json(); })
      .then(data => {
        if (cancelled) return;
        const rawUsers = Array.isArray(data) ? data : data.users || [];
        setUsers(rawUsers.map(normaliseUser));
        console.table(data.users);
        if (data.pagination) {
          setPagination(data.pagination);
        } else {
          setPagination({ total_records: rawUsers.length, total_pages: 1, current_page: 1, per_page: rowsPerPage });
        }
        
        if (data.summary) {
          setSummary(data.summary);
        } else {
          setSummary({
            total_active: rawUsers.filter(u => u.status === "Active").length,
            total_banned: rawUsers.filter(u => u.status === "Banned").length,
            total_flagged: 0
          });
        }
      })
      .catch(err  => { if (!cancelled) setApiError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, rowsPerPage, search, statusF, sortBy, sortDir]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalPages = pagination.total_pages;
  const safeP      = pagination.current_page;
  const pageRows   = users;
  const pageNums   = buildPageNums(safeP, totalPages);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg, color = BLUE) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, color });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleRow  = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll  = ()  => setSelected(selected.length === pageRows.length ? [] : pageRows.map(r => r.id));
  const allChecked = pageRows.length > 0 && pageRows.every(r => selected.includes(r.id));

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const handleUnblock = () => {
    setUsers(us => us.map(u => selected.includes(u.id) ? { ...u, status: "Active" } : u));
    showToast(`${selected.length} user(s) unblocked`, "#17A34A");
    setSelected([]);
  };

  const handleSuspend = () => {
    setUsers(us => us.map(u => selected.includes(u.id) ? { ...u, status: "Suspended" } : u));
    showToast(`${selected.length} user(s) suspended`, ORANGE);
    setSelected([]);
  };

  // ── Row actions ────────────────────────────────────────────────────────────
  const handleBan = id => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === "Banned" ? "Active" : "Banned" } : u));
    showToast("User status toggled", ORANGE);
  };

  const handleDelete = id => {
    setUsers(us => us.filter(u => u.id !== id));
    setSelected(s => s.filter(x => x !== id));
    showToast("User removed", "#DC2626");
  };

  // ── Sort ───────────────────────────────────────────────────────────────────
  const handleColSort = col => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
    setPage(1);
  };
  const handleUpdateTier = async (newTier) => {
  if (selected.length === 0) return;

  try {
    const res = await fetch(`${API_BASE}/update-tier`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wuser_ids: selected, // Array of selected user IDs
        tier: newTier,       // "Premium" or "Teacher"
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Update local state UI immediately
      setUsers(prev =>
        prev.map(u => selected.includes(u.id) ? { ...u, accountTier: newTier } : u)
      );
      showToast(`${selected.length} user(s) updated to ${newTier}`, newTier === "Premium" ? "#D97706" : "#2563EB");
      setSelected([]);
    } else {
      showToast(data.message || "Failed to update tier", "#DC2626");
    }
  } catch (err) {
    console.error("Tier update error:", err);
  }
};

// Handlers for your action buttons:
const handleMakePremium = () => handleUpdateTier("Premium");
const handleMakeTeacher = () => handleUpdateTier("Teacher");
  // ── Styles ─────────────────────────────────────────────────────────────────
  const pad = isMobile ? "12px" : "20px";

  const inputStyle = {
    height: 33, padding: "0 10px 0 28px", borderRadius: 8,
    border: "1px solid #E2E6F0", background: "#fff",
    fontFamily: FONT, fontSize: 12, color: "#2D3A55",
    outline: "none", flex: 1, minWidth: isMobile ? 0 : 200,
  };

  const thStyle = col => ({
    padding: "10px 12px", textAlign: "left",
    fontFamily: FONT, fontSize: 10.5, fontWeight: 700,
    color: sortBy === col ? BLUE : "#6B7280",
    textTransform: "uppercase", letterSpacing: "0.05em",
    background: "#F7F8FC", borderBottom: "1px solid #E8EBF3",
    whiteSpace: "nowrap", cursor: col ? "pointer" : "default", userSelect: "none",
    position: "sticky", top: 0, zIndex: 2,
  });

  const tdStyle = {
    padding: "9px 12px", fontFamily: FONT, fontSize: 12, color: "#374151",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    borderBottom: "1px solid #F0F2F8", maxWidth: 150,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        .bu-root * { box-sizing: border-box; }
        .bu-root input[type="checkbox"] { width: 14px; height: 14px; border-radius: 4px; accent-color: ${BLUE}; cursor: pointer; }
        .bu-table-wrap::-webkit-scrollbar { height: 5px; width: 0; }
        .bu-table-wrap::-webkit-scrollbar-thumb { background: #CBD2E8; border-radius: 3px; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .bu-bulk-bar { animation: fadeInUp 0.22s ease; }
        .bu-row-hover:hover td { background: #F5F8FF !important; }
      `}</style>

      <div className="bu-root" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: pad, gap: 14 }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 17 : 19, fontWeight: 700, color: "#0F1729", letterSpacing: "-0.3px" }}>User Management</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7B8AAB" }}>Monitor and manage all registered bot users across your platform.</p>
          </div>

          {/* ── Stat cards ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", gap: 10 }}>
            <StatCard icon={Icon.Users}  label="Registered Users" value={pagination.total_records} accent={BLUE}    isMobile={isMobile} />
            <StatCard icon={Icon.Online} label="Active Users"      value={summary.total_active}     accent="#17A34A" isMobile={isMobile} />
            <StatCard icon={Icon.Alert}  label="Banned"            value={summary.total_banned}     accent={ORANGE}  isMobile={isMobile} />
            <StatCard icon={Icon.Chart}  label="Flagged"           value={summary.total_flagged}    accent="#1E3A8A" isMobile={isMobile} />
          </div>

          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(15,23,41,0.06), 0 0 0 1px rgba(15,23,41,0.04)", padding: "9px 12px", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <TSelect value={statusF} onChange={v => { setStatusF(v); setPage(1); }} minW={120}>
              <option value="all">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </TSelect>

            <TSelect value={downloadsF} onChange={v => { setDownloadsF(v); setPage(1); }} minW={140}>
              <option value="all">Downloads: All</option>
              <option value="lt10">&lt; 10</option>
              <option value="lt50">&lt; 50</option>
              <option value="lt100">&lt; 100</option>
              <option value="lt200">&lt; 200</option>
            </TSelect>

            <TSelect value={sortBy} onChange={v => { setSortBy(v); setPage(1); }} minW={140}>
              <option value="default">Sort By: Default</option>
              <option value="username">A–Z Username</option>
              <option value="joined">Date Joined</option>
              <option value="active">Last Active</option>
            </TSelect>

            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 8, color: "#9AA5C0", display: "flex", pointerEvents: "none" }}><Icon.Calendar /></span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ height: 33, padding: "0 10px 0 26px", borderRadius: 8, border: "1px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, color: "#2D3A55", outline: "none", width: 150 }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e  => e.target.style.borderColor = "#E2E6F0"}
              />
            </div>

            <div style={{ width: 1, height: 22, background: "#E2E6F0", flexShrink: 0 }} />

            {/* Send Email → opens ComposeMessage modal */}
            <TBtn icon={Icon.Mail} label="Send Email" onClick={() => setShowCompose(true)} />

            {/* WhatsApp → opens SendWhatsApp modal */}
            <TBtn icon={Icon.WA} label="WhatsApp" onClick={() => setShowWhatsApp(true)} variant="success" />

            <TBtn icon={Icon.Print} label="Print" onClick={() => window.print()} />

            <div style={{ marginLeft: "auto" }}>
              <TBtn icon={Icon.Export} label="Export" variant="primary" onClick={() => showToast("Exporting CSV…", "#fff")} />
            </div>
          </div>

          {/* ── Bulk action bar ──────────────────────────────────────────── */}
          {selected.length > 0 && (
            <div className="bu-bulk-bar" style={{ background: "#EEF1FD", border: "1px solid #C7D1FC", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: BLUE }}>
                {selected.length} user{selected.length > 1 ? "s" : ""} selected
              </span>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {/* Unblock */}
              <button onClick={handleUnblock} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: "1px solid #17A34A", background: "#E6F9F0", color: "#17A34A", fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Icon.Unlock />Unblock
              </button>

              {/* Suspend */}
              <button onClick={handleSuspend} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: `1px solid ${ORANGE}`, background: "#FEF3C7", color: ORANGE, fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Icon.Suspend />Suspend
              </button>

              {/* Make Premium */}
              <button onClick={handleMakePremium} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: "1px solid #D97706", background: "#FFFBEB", color: "#B45309", fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                ★ Make Premium
              </button>

              {/* Make Teacher */}
              <button onClick={handleMakeTeacher} style={{ height: 30, padding: "0 13px", borderRadius: 8, border: "1px solid #2563EB", background: "#EFF6FF", color: "#1D4ED8", fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                🎓 Make Teacher
              </button>
            </div>

              <button onClick={() => setSelected([])} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "#7B8AAB", display: "flex", padding: 2 }}>
                <Icon.X />
              </button>
            </div>
          )}

          {/* ── Search + rows per page ───────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9AA5C0", display: "flex" }}><Icon.Search /></span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by ID or username…"
                style={{ ...inputStyle, paddingLeft: 28, width: "100%" }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e  => e.target.style.borderColor = "#E2E6F0"}
              />
            </div>
            <span style={{ fontSize: 12, color: "#7B8AAB", whiteSpace: "nowrap" }}>Rows per page</span>
            <TSelect value={rowsPerPage} onChange={v => { setRowsPerPage(+v); setPage(1); }} minW={72}>
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </TSelect>
          </div>

          {/* ── Error banner ─────────────────────────────────────────────── */}
          {apiError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", fontFamily: FONT, fontSize: 12.5, color: "#7F1D1D", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon.Alert /> Failed to load users: {apiError}. Check your connection and try refreshing.
            </div>
          )}

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(15,23,41,0.06), 0 0 0 1px rgba(15,23,41,0.04)", overflow: "hidden" }}>
            <div className="bu-table-wrap" style={{ overflowX: "auto", overflowY: "visible" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 980 }}>
                <colgroup>
                  <col style={{ width: 36  }} /> {/* checkbox    */}
                  <col style={{ width: 40  }} /> {/* no.         */}
                  <col style={{ width: 160  }} /> {/* jid          */}
                  <col style={{ width: 130 }} /> {/* username    */}
                  <col style={{ width: 120 }} /> {/* level       */}
                  <col style={{ width: 80 }} /> {/* account type*/}
                  <col style={{ width: 100 }} /> {/* status      */}
                  <col style={{ width: 140 }} /> {/* joined      */}
                  <col style={{ width: 140 }} /> {/* last active */}
                  <col style={{ width: 80  }} /> {/* downloads   */}
                  <col style={{ width: 100 }} /> {/* actions     */}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...thStyle(null), cursor: "default" }}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                    </th>
                    <th style={thStyle(null)}>No.</th>
                    <th style={thStyle(null)}>JID</th>
                    <th style={thStyle("username")} onClick={() => handleColSort("username")}>
                      Username {sortBy === "username" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={thStyle(null)}>Level</th>
                    <th style={thStyle(null)}>Account Type</th>
                    <th style={thStyle(null)}>Status</th>
                    <th style={thStyle("joined")} onClick={() => handleColSort("joined")}>
                      Joined {sortBy === "joined" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={thStyle("active")} onClick={() => handleColSort("active")}>
                      Last Active {sortBy === "active" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={thStyle(null)}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Download />DLs</span>
                    </th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((u, idx) => {
                    const isSel = selected.includes(u.id);
                    const rowBg = isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC";
                    return (
                      <tr key={u.id} className="bu-row-hover" style={{ background: rowBg }}>
                        <td style={{ ...tdStyle, textAlign: "center", padding: "9px 0 9px 12px" }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleRow(u.id)} />
                        </td>
                        <td style={{ ...tdStyle, color: "#9CA3AF", fontWeight: 500, fontSize: 11 }}>
                          {(safeP - 1) * rowsPerPage + idx + 1}
                        </td>
                        <td style={{ ...tdStyle, fontSize: 11, fontWeight: 500 }} title={u.id}>
                          {u.jid}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#0F1729" }} title={u.username}>
                          @{u.username}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500, color: "#4B5563" }} title={u.levelName}>
                          {u.levelName}
                        </td>
                        <td style={{ ...tdStyle }} title={u.accountTier}>
                          <span style={{ padding: "2px 8px", borderRadius: 6, background: u.accountTier?.toLowerCase() === "premium" ? "#FEF3C7" : "#F3F4F6", color: u.accountTier?.toLowerCase() === "premium" ? "#B45309" : "#374151", fontWeight: 600, fontSize: 11 }}>
                            {u.accountTier}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={u.status} />
                        </td>
                        <td style={{ ...tdStyle, fontSize: 11, color: "#6B7280" }}>{u.joined}</td>
                        <td style={{ ...tdStyle, fontSize: 11, color: "#6B7280" }}>{u.lastActive}</td>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: u.downloads > 0 ? "#0F1729" : "#D1D5DB" }}>
                          {u.downloads}
                        </td>
                        <td style={{ ...tdStyle, overflow: "visible" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button title="Edit" onClick={() => showToast(`Editing @${u.username}`, BLUE)}
                              style={{ background: "#EFF6FF", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: BLUE, display: "flex" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                              onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}
                            ><Icon.Edit /></button>
                            <button title={u.status === "Banned" ? "Unban" : "Ban"} onClick={() => handleBan(u.id)}
                              style={{ background: "#FEF3C7", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: ORANGE, display: "flex" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#FDE68A"}
                              onMouseLeave={e => e.currentTarget.style.background = "#FEF3C7"}
                            ><Icon.Ban /></button>
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

                  {loading && (
                    <tr>
                      <td colSpan={11} style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontFamily: FONT, fontSize: 13 }}>
                        Loading users…
                      </td>
                    </tr>
                  )}
                  {!loading && pageRows.length === 0 && (
                    <tr>
                      <td colSpan={11} style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontFamily: FONT, fontSize: 13 }}>
                        No users found{search ? ` matching "${search}"` : ""}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ───────────────────────────────────────────── */}
            <div style={{ padding: "9px 14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 7 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: FONT }}>
                Showing <strong>{pagination.total_records === 0 ? 0 : (safeP - 1) * rowsPerPage + 1}–{Math.min(safeP * rowsPerPage, pagination.total_records)}</strong> of <strong>{pagination.total_records}</strong> users
              </p>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button onClick={() => setPage(1)} disabled={safeP === 1} style={{ ...pgBtn, opacity: safeP === 1 ? 0.35 : 1 }}>«</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safeP === 1} style={{ ...pgBtn, opacity: safeP === 1 ? 0.35 : 1 }}>‹</button>
                {pageNums.map((pn, i) =>
                  pn === "…"
                    ? <span key={`e${i}`} style={{ width: 28, textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>…</span>
                    : <button key={pn} onClick={() => setPage(pn)} style={{ ...pgBtn, background: safeP === pn ? BLUE : "#fff", color: safeP === pn ? "#fff" : "#374151", border: safeP === pn ? "none" : "1px solid #E2E6F0", fontWeight: safeP === pn ? 700 : 500 }}>{pn}</button>
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safeP === totalPages} style={{ ...pgBtn, opacity: safeP === totalPages ? 0.35 : 1 }}>›</button>
                <button onClick={() => setPage(totalPages)} disabled={safeP === totalPages} style={{ ...pgBtn, opacity: safeP === totalPages ? 0.35 : 1 }}>»</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showCompose  && <ComposeMessage  onClose={() => setShowCompose(false)} />}
      {showWhatsApp && <SendWhatsApp    onClose={() => setShowWhatsApp(false)} />}

      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}

// ─── pgBtn style constant ─────────────────────────────────────────────────────
const pgBtn = {
  width: 28, height: 28, borderRadius: 7,
  border: "1px solid #E2E6F0", background: "#fff",
  fontFamily: FONT, fontSize: 13, cursor: "pointer",
  color: "#374151", display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.13s",
};