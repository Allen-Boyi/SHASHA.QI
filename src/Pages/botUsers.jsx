import { useState, useMemo, useEffect, useRef } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = "#4B6EF5";
const ORANGE = "#E85D04";
const BG     = "#F0F2F8";
const FONT   = "'Sora', 'Segoe UI', sans-serif";

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id:1,  sid:"WA-1234560001", email:"allen@domain.com",        username:"jonny77",    status:"Active",    joined:"Mar 12, 2023", lastActive:"1 min ago",    credits:128, maxCredits:200, downloads:15 },
  { id:2,  sid:"WA-1234560002", email:"jonsmith@jid.io",         username:"olly659",    status:"Inactive",  joined:"Jun 27, 2022", lastActive:"1 month ago",  credits:75,  maxCredits:200, downloads:30 },
  { id:3,  sid:"WA-1234560003", email:"dwarren3g@domain.com",    username:"dwarren3",   status:"Banned",    joined:"Jan 8, 2024",  lastActive:"4 days ago",   credits:200, maxCredits:200, downloads:4  },
  { id:4,  sid:"WA-1234560004", email:"chloehhye@domain.com",    username:"chloehh",    status:"Pending",   joined:"Oct 5, 2021",  lastActive:"10 days ago",  credits:0,   maxCredits:200, downloads:30 },
  { id:5,  sid:"WA-1234560005", email:"reeds777@domain.com",     username:"reeds7",     status:"Suspended", joined:"Feb 19, 2023", lastActive:"3 months ago", credits:150, maxCredits:200, downloads:4  },
  { id:6,  sid:"WA-1234560006", email:"belleclark@domain.com",   username:"bellecl",    status:"Active",    joined:"Aug 30, 2022", lastActive:"1 week ago",   credits:99,  maxCredits:200, downloads:30 },
  { id:7,  sid:"WA-1234560007", email:"lucamich@domain.com",     username:"lucamich",   status:"Active",    joined:"Apr 24, 2024", lastActive:"4 hours ago",  credits:110, maxCredits:200, downloads:3  },
  { id:8,  sid:"WA-1234560008", email:"markwill32@domain.com",   username:"markwill32", status:"Banned",    joined:"Nov 14, 2020", lastActive:"2 months ago", credits:180, maxCredits:200, downloads:13 },
  { id:9,  sid:"WA-1234560009", email:"nicolas009@domain.com",   username:"nicolass",   status:"Suspended", joined:"Jul 6, 2023",  lastActive:"3 hours ago",  credits:50,  maxCredits:200, downloads:3  },
  { id:10, sid:"WA-1234560010", email:"mianaddiin@domain.com",   username:"mianaddiin", status:"Inactive",  joined:"Dec 31, 2021", lastActive:"4 months ago", credits:10,  maxCredits:200, downloads:10 },
  { id:11, sid:"WA-1234560011", email:"miamvill99@domain.com",   username:"noemi",      status:"Active",    joined:"Aug 10, 2024", lastActive:"15 mins ago",  credits:135, maxCredits:200, downloads:4  },
  { id:12, sid:"WA-1234560012", email:"sarah.k@domain.com",      username:"sarahk99",   status:"Active",    joined:"May 3, 2023",  lastActive:"2 hours ago",  credits:190, maxCredits:200, downloads:22 },
  { id:13, sid:"WA-1234560013", email:"tomhansen@domain.com",    username:"tomh",       status:"Pending",   joined:"Sep 15, 2023", lastActive:"6 days ago",   credits:0,   maxCredits:200, downloads:0  },
  { id:14, sid:"WA-1234560014", email:"priya.m@domain.com",      username:"priyam",     status:"Active",    joined:"Feb 2, 2024",  lastActive:"30 mins ago",  credits:77,  maxCredits:200, downloads:8  },
  { id:15, sid:"WA-1234560015", email:"oscar.t@domain.com",      username:"oscartt",    status:"Active",    joined:"Jun 10, 2023", lastActive:"2 days ago",   credits:160, maxCredits:200, downloads:17 },
  { id:16, sid:"WA-1234560016", email:"fatima.z@domain.com",     username:"fatimazk",   status:"Inactive",  joined:"Mar 22, 2024", lastActive:"5 hours ago",  credits:45,  maxCredits:200, downloads:6  },
  { id:17, sid:"WA-1234560017", email:"henry.c@domain.com",      username:"henryc",     status:"Banned",    joined:"Jan 3, 2020",  lastActive:"1 year ago",   credits:5,   maxCredits:200, downloads:1  },
  { id:18, sid:"WA-1234560018", email:"lina.m@domain.com",       username:"linamo",     status:"Pending",   joined:"Nov 1, 2023",  lastActive:"8 days ago",   credits:0,   maxCredits:200, downloads:0  },
  { id:19, sid:"WA-1234560019", email:"sam.k@domain.com",        username:"samkilo",    status:"Active",    joined:"Sep 9, 2024",  lastActive:"Just now",     credits:88,  maxCredits:200, downloads:11 },
  { id:20, sid:"WA-1234560020", email:"grace.o@domain.com",      username:"graceo",     status:"Suspended", joined:"Dec 5, 2022",  lastActive:"3 weeks ago",  credits:120, maxCredits:200, downloads:9  },
];

// ─── Status palette ────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Active:    { bg:"#D1FAE5", color:"#065F46", border:"#6EE7B7" },
  Inactive:  { bg:"#E5E7EB", color:"#374151", border:"#9CA3AF" },
  Banned:    { bg:"#FEE2E2", color:"#7F1D1D", border:"#FCA5A5" },
  Pending:   { bg:"#DBEAFE", color:"#1E3A8A", border:"#93C5FD" },
  Suspended: { bg:"#FEF3C7", color:"#78350F", border:"#FCD34D" },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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
  Credits:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Unlock:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Trash:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  X:        () => <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Sort:     () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>,
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
      <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#111827", fontFamily: FONT, lineHeight: 1.1 }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
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

// ─── CreditBar ────────────────────────────────────────────────────────────────
function CreditBar({ val, max }) {
  const pct = Math.min(100, Math.round((val / max) * 100));
  const color = pct >= 90 ? "#E85D04" : pct >= 60 ? BLUE : "#17A34A";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#111827", fontFamily: FONT }}>{val}<span style={{ color: "#9CA3AF", fontWeight: 400 }}>/{max}</span></span>
        <span style={{ fontSize: 9.5, color, fontWeight: 600, fontFamily: FONT }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "#E5E7EB", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

// ─── ToolbarSelect ────────────────────────────────────────────────────────────
function TSelect({ value, onChange, children, minW = 110 }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          height: 33, padding: "0 28px 0 10px", borderRadius: 8,
          border: "1px solid #E2E6F0", background: "#fff",
          fontFamily: FONT, fontSize: 12, color: "#2D3A55",
          outline: "none", appearance: "none", cursor: "pointer",
          minWidth: minW,
        }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e => e.target.style.borderColor = "#E2E6F0"}
      >
        {children}
      </select>
      <span style={{ position: "absolute", right: 8, pointerEvents: "none", color: "#7B8AAB", display: "flex" }}>
        <Icon.ChevDown />
      </span>
    </div>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
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
    primary: { background: BLUE, color: "#fff", border: `1px solid ${BLUE}`, fontWeight: 600 },
    success: {},
    orange:  {},
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => {
        if (variant === "primary") { e.currentTarget.style.background = "#3A5DE0"; }
        else if (variant === "success") { e.currentTarget.style.background = "#E6F9F0"; e.currentTarget.style.color = "#17A34A"; e.currentTarget.style.borderColor = "#17A34A"; }
        else if (variant === "orange") { e.currentTarget.style.background = "#FEF0E7"; e.currentTarget.style.color = ORANGE; e.currentTarget.style.borderColor = ORANGE; }
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

// ─── Add Credits Modal ────────────────────────────────────────────────────────
function AddCreditsModal({ count, onClose, onApply }) {
  const [amount, setAmount] = useState(50);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 3000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: 24, width: 340, maxWidth: "90vw",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: "#111827" }}>Add AI Credits</p>
          <button onClick={onClose} style={{ border: "none", background: "#F3F4F6", borderRadius: 6, padding: "4px 5px", cursor: "pointer", display: "flex", color: "#6B7280" }}><Icon.X /></button>
        </div>
        <p style={{ margin: "0 0 14px", fontFamily: FONT, fontSize: 12, color: "#6B7280" }}>
          Adding credits to <strong style={{ color: BLUE }}>{count} selected user{count !== 1 ? "s" : ""}</strong>
        </p>
        <label style={{ display: "block", marginBottom: 6, fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: "#374151" }}>Credits to Add</label>
        <input type="number" min={1} max={500} value={amount}
          onChange={e => setAmount(Math.max(1, +e.target.value))}
          style={{
            width: "100%", height: 36, padding: "0 10px", borderRadius: 8,
            border: `1px solid ${BLUE}`, fontFamily: FONT, fontSize: 13,
            color: "#111827", outline: "none", boxSizing: "border-box",
            boxShadow: `0 0 0 3px rgba(75,110,245,0.12)`,
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          {[25, 50, 100, 200].map(v => (
            <button key={v} onClick={() => setAmount(v)}
              style={{
                flex: 1, height: 28, borderRadius: 7, border: `1px solid ${amount === v ? BLUE : "#E2E6F0"}`,
                background: amount === v ? "#EEF1FD" : "#fff", color: amount === v ? BLUE : "#6B7280",
                fontFamily: FONT, fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
            >+{v}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, height: 36, borderRadius: 9, border: "1px solid #E2E6F0",
            background: "#fff", fontFamily: FONT, fontSize: 12.5, fontWeight: 500, color: "#6B7280", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => onApply(amount)} style={{
            flex: 2, height: 36, borderRadius: 9, border: "none",
            background: BLUE, fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer",
          }}>Apply +{amount} Credits</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, color }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#1E293B", color: "#fff", padding: "11px 18px",
      borderRadius: 12, fontFamily: FONT, fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,0.18)", borderLeft: `4px solid ${color}`,
      pointerEvents: "none", maxWidth: 320,
    }}>{msg}</div>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BotUsers({ isMobile = false }) {
  const [users, setUsers]           = useState(INITIAL_USERS);
  const [search, setSearch]         = useState("");
  const [statusF, setStatusF]       = useState("all");
  const [creditsF, setCreditsF]     = useState("all");
  const [downloadsF, setDownloadsF] = useState("all");
  const [sortBy, setSortBy]         = useState("default");
  const [sortDir, setSortDir]       = useState("asc");
  const [dateFrom, setDateFrom]     = useState("");
  const [page, setPage]             = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected]     = useState([]);
  const [showCredits, setShowCredits] = useState(false);
  const [toast, setToast]           = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, color = BLUE) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, color });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = users.filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || u.sid.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      const matchS = statusF === "all" || u.status === statusF;
      const matchC = creditsF === "all"
        || (creditsF === "high"   && u.credits > u.maxCredits * 0.7)
        || (creditsF === "low"    && u.credits <= u.maxCredits * 0.7);
      const matchD = downloadsF === "all"
        || (downloadsF === "lt10"  && u.downloads < 10)
        || (downloadsF === "lt50"  && u.downloads < 50)
        || (downloadsF === "lt100" && u.downloads < 100)
        || (downloadsF === "lt200" && u.downloads < 200);
      return matchQ && matchS && matchC && matchD;
    });

    d = [...d].sort((a, b) => {
      if (sortBy === "username") return sortDir === "asc" ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username);
      if (sortBy === "joined")   return sortDir === "asc" ? a.id - b.id : b.id - a.id;
      if (sortBy === "active")   return sortDir === "asc" ? a.id - b.id : b.id - a.id;
      return a.id - b.id;
    });
    return d;
  }, [users, search, statusF, creditsF, downloadsF, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safeP      = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safeP - 1) * rowsPerPage, safeP * rowsPerPage);
  const pageNums   = buildPageNums(safeP, totalPages);

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleRow   = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll   = () => setSelected(selected.length === pageRows.length ? [] : pageRows.map(r => r.id));
  const allChecked  = pageRows.length > 0 && pageRows.every(r => selected.includes(r.id));

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleBan    = id => { setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === "Banned" ? "Active" : "Banned" } : u)); showToast(`User status toggled`, ORANGE); };
  const handleDelete = id => { setUsers(us => us.filter(u => u.id !== id)); setSelected(s => s.filter(x => x !== id)); showToast("User removed", "#DC2626"); };
  const handleUnblock = () => { setUsers(us => us.map(u => selected.includes(u.id) ? { ...u, status: "Active" } : u)); showToast(`${selected.length} user(s) unblocked`, "#17A34A"); setSelected([]); };
  const handleApplyCredits = (amount) => {
    setUsers(us => us.map(u => selected.includes(u.id) ? { ...u, credits: Math.min(u.maxCredits, u.credits + amount) } : u));
    showToast(`+${amount} credits added to ${selected.length} user(s)`, BLUE);
    setShowCredits(false); setSelected([]);
  };

  // ── Column sort toggle ─────────────────────────────────────────────────────
  const handleColSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
    setPage(1);
  };

  const pad = isMobile ? "12px" : "20px";

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputStyle = {
    height: 33, padding: "0 10px 0 28px", borderRadius: 8,
    border: "1px solid #E2E6F0", background: "#fff",
    fontFamily: FONT, fontSize: 12, color: "#2D3A55",
    outline: "none", flex: 1, minWidth: isMobile ? 0 : 200,
  };

  const thStyle = (col) => ({
    padding: "10px 12px", textAlign: "left",
    fontFamily: FONT, fontSize: 10.5, fontWeight: 700,
    color: sortBy === col ? BLUE : "#6B7280",
    textTransform: "uppercase", letterSpacing: "0.05em",
    background: "#F7F8FC", borderBottom: "1px solid #E8EBF3",
    whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
    position: "sticky", top: 0, zIndex: 2,
  });

  const tdStyle = {
    padding: "9px 12px", fontFamily: FONT, fontSize: 12,
    color: "#374151", whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
    borderBottom: "1px solid #F0F2F8",
    maxWidth: 160,
  };

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        .bu-root * { box-sizing: border-box; }
        .bu-root input[type="checkbox"] {
          width: 14px; height: 14px; border-radius: 4px;
          accent-color: ${BLUE}; cursor: pointer;
        }
        .bu-table-wrap::-webkit-scrollbar { height: 5px; width: 0; }
        .bu-table-wrap::-webkit-scrollbar-track { background: transparent; }
        .bu-table-wrap::-webkit-scrollbar-thumb { background: #CBD2E8; border-radius: 3px; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .bu-bulk-bar { animation: fadeInUp 0.22s ease; }
        .bu-row-hover:hover td { background: #F5F8FF !important; }
      `}</style>

      <div className="bu-root" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: pad, gap: 14 }}>

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 17 : 19, fontWeight: 700, color: "#0F1729", letterSpacing: "-0.3px" }}>
              User Management
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7B8AAB" }}>Monitor and manage all registered bot users across your platform.</p>
          </div>

          {/* ── Stats ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", gap: 10 }}>
            <StatCard icon={Icon.Users}  label="Registered Users"  value={1234} accent={BLUE}      isMobile={isMobile} />
            <StatCard icon={Icon.Online} label="Online Now"         value={640}  accent="#17A34A"   isMobile={isMobile} />
            <StatCard icon={Icon.Chart}  label="Active This Week"   value={400}  accent="#1E3A8A"   isMobile={isMobile} />
            <StatCard icon={Icon.Alert}  label="Inactive / Banned"  value={80}   accent={ORANGE}    isMobile={isMobile} />
          </div>

          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <div style={{
            background: "#fff", borderRadius: 12,
            boxShadow: "0 1px 4px rgba(15,23,41,0.06), 0 0 0 1px rgba(15,23,41,0.04)",
            padding: "9px 12px", display: "flex", alignItems: "center",
            gap: 7, flexWrap: "wrap",
          }}>
            {/* Filters */}
            <TSelect value={statusF} onChange={v => { setStatusF(v); setPage(1); }} minW={120}>
              <option value="all">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </TSelect>

            <TSelect value={creditsF} onChange={v => { setCreditsF(v); setPage(1); }} minW={130}>
              <option value="all">Credits: All</option>
              <option value="high">High to Low</option>
              <option value="low">Low to High</option>
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

            {/* Date */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 8, color: "#9AA5C0", display: "flex", pointerEvents: "none" }}><Icon.Calendar /></span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ height: 33, padding: "0 10px 0 26px", borderRadius: 8, border: "1px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, color: "#2D3A55", outline: "none", width: 150 }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = "#E2E6F0"}
              />
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 22, background: "#E2E6F0", flexShrink: 0 }} />

            {/* Action buttons */}
            <TBtn icon={Icon.Mail}  label="Send Email" onClick={() => showToast("Opening email composer…", BLUE)} />
            <TBtn icon={Icon.WA}    label="WhatsApp"   onClick={() => showToast("Opening WhatsApp…", "#17A34A")} variant="success" />
            <TBtn icon={Icon.Print} label="Print"      onClick={() => window.print()}  />

            {/* Export – pushed right */}
            <div style={{ marginLeft: "auto" }}>
              <TBtn icon={Icon.Export} label="Export" variant="primary" onClick={() => showToast("Exporting CSV…", "#fff")} />
            </div>
          </div>

          {/* ── Bulk action bar (contextual) ─────────────────────────────── */}
          {selected.length > 0 && (
            <div className="bu-bulk-bar" style={{
              background: "#EEF1FD", border: `1px solid #C7D1FC`,
              borderRadius: 10, padding: "8px 14px",
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
            }}>
              <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: BLUE }}>
                {selected.length} user{selected.length > 1 ? "s" : ""} selected
              </span>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => setShowCredits(true)} style={{
                  height: 30, padding: "0 13px", borderRadius: 8,
                  border: "none", background: BLUE, color: "#fff",
                  fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Icon.Credits />+ Add Credits
                </button>
                <button onClick={handleUnblock} style={{
                  height: 30, padding: "0 13px", borderRadius: 8,
                  border: "1px solid #17A34A", background: "#E6F9F0", color: "#17A34A",
                  fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Icon.Unlock />Unblock Users
                </button>
              </div>
              <button onClick={() => setSelected([])} style={{
                marginLeft: "auto", border: "none", background: "transparent",
                cursor: "pointer", color: "#7B8AAB", display: "flex", padding: 2,
              }}><Icon.X /></button>
            </div>
          )}

          {/* ── Search + rows-per-page ───────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9AA5C0", display: "flex" }}><Icon.Search /></span>
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by SID, email or username…"
                style={{ ...inputStyle, paddingLeft: 28, width: "100%" }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = "#E2E6F0"}
              />
            </div>
            <span style={{ fontSize: 12, color: "#7B8AAB", whiteSpace: "nowrap" }}>Rows per page</span>
            <TSelect value={rowsPerPage} onChange={v => { setRowsPerPage(+v); setPage(1); }} minW={72}>
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </TSelect>
          </div>

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div style={{
            background: "#fff", borderRadius: 12,
            boxShadow: "0 1px 4px rgba(15,23,41,0.06), 0 0 0 1px rgba(15,23,41,0.04)",
            overflow: "hidden",
          }}>
            {/* Horizontal scroll wrapper */}
            <div className="bu-table-wrap" style={{ overflowX: "auto", overflowY: "visible" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 860 }}>
                <colgroup>
                  <col style={{ width: 36 }} />
                  <col style={{ width: 44 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 170 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...thStyle(null), cursor: "default" }}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                    </th>
                    <th style={thStyle(null)}>No.</th>
                    <th style={thStyle(null)}>SID Number</th>
                    <th style={thStyle(null)}>Email</th>
                    <th style={thStyle("username")} onClick={() => handleColSort("username")}>
                      Username {sortBy === "username" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={thStyle(null)}>Status</th>
                    <th style={thStyle("joined")} onClick={() => handleColSort("joined")}>
                      Joined {sortBy === "joined" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={thStyle("active")} onClick={() => handleColSort("active")}>
                      Last Active {sortBy === "active" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={thStyle(null)}>AI Credits</th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((u, idx) => {
                    const isSel = selected.includes(u.id);
                    const rowBg = isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC";
                    return (
                      <tr key={u.id} className="bu-row-hover"
                        style={{ background: rowBg }}
                      >
                        <td style={{ ...tdStyle, textAlign: "center", padding: "9px 0 9px 12px" }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleRow(u.id)} />
                        </td>
                        <td style={{ ...tdStyle, color: "#9CA3AF", fontWeight: 500, fontSize: 11 }}>
                          {(safeP - 1) * rowsPerPage + idx + 1}
                        </td>
                        <td style={{ ...tdStyle, fontSize: 11, color: "#374151", fontFamily: FONT, fontWeight: 500 }} title={u.sid}>
                          {u.sid}
                        </td>
                        <td style={{ ...tdStyle, color: BLUE }} title={u.email}>
                          {u.email}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#0F1729" }} title={u.username}>
                          @{u.username}
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={u.status} />
                        </td>
                        <td style={{ ...tdStyle, fontSize: 11, color: "#6B7280" }}>{u.joined}</td>
                        <td style={{ ...tdStyle, fontSize: 11, color: "#6B7280" }}>{u.lastActive}</td>
                        <td style={{ ...tdStyle }}>
                          <CreditBar val={u.credits} max={u.maxCredits} />
                        </td>
                        <td style={{ ...tdStyle, overflow: "visible" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {/* Edit */}
                            <button title="Edit" onClick={() => showToast(`Editing @${u.username}`, BLUE)}
                              style={{ background: "#EFF6FF", border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color: BLUE, display: "flex" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                              onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}
                            ><Icon.Edit /></button>
                            {/* Ban */}
                            <button title={u.status === "Banned" ? "Unban" : "Ban"} onClick={() => handleBan(u.id)}
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
                      <td colSpan={10} style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontFamily: FONT, fontSize: 13 }}>
                        No users found{search ? ` matching "${search}"` : ""}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              padding: "9px 14px", borderTop: "1px solid #F1F5F9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 7,
            }}>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: FONT }}>
                Showing <strong>{filtered.length === 0 ? 0 : (safeP - 1) * rowsPerPage + 1}–{Math.min(safeP * rowsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> users
              </p>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button onClick={() => setPage(1)} disabled={safeP === 1}
                  style={{ ...pgBtn, opacity: safeP === 1 ? 0.35 : 1 }}>«</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safeP === 1}
                  style={{ ...pgBtn, opacity: safeP === 1 ? 0.35 : 1 }}>‹</button>
                {pageNums.map((pn, i) =>
                  pn === "…"
                    ? <span key={`e${i}`} style={{ width: 28, textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>…</span>
                    : <button key={pn} onClick={() => setPage(pn)} style={{
                        ...pgBtn,
                        background: safeP === pn ? BLUE : "#fff",
                        color: safeP === pn ? "#fff" : "#374151",
                        border: safeP === pn ? "none" : "1px solid #E2E6F0",
                        fontWeight: safeP === pn ? 700 : 500,
                      }}>{pn}</button>
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safeP === totalPages}
                  style={{ ...pgBtn, opacity: safeP === totalPages ? 0.35 : 1 }}>›</button>
                <button onClick={() => setPage(totalPages)} disabled={safeP === totalPages}
                  style={{ ...pgBtn, opacity: safeP === totalPages ? 0.35 : 1 }}>»</button>
              </div>
            </div>
          </div>

        </div>{/* end inner pad */}
      </div>{/* end root */}

      {showCredits && <AddCreditsModal count={selected.length} onClose={() => setShowCredits(false)} onApply={handleApplyCredits} />}
      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}

// ─── Style constant ───────────────────────────────────────────────────────────
const pgBtn = {
  width: 28, height: 28, borderRadius: 7,
  border: "1px solid #E2E6F0", background: "#fff",
  fontFamily: FONT, fontSize: 13, cursor: "pointer",
  color: "#374151", display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.13s",
};
