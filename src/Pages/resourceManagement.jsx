import { useState, useMemo, useRef, useEffect } from "react";
import UploadResource from '../components/UploadResource';
const baseURL = import.meta.env.VITE_BASEURL;
// ─── Brand tokens (identical to botUsers) ─────────────────────────────────────
const BLUE = "#4B6EF5";
const ORANGE = "#E85D04";
const GREEN = "#059669";
const FONT = "'Sora', 'Segoe UI', sans-serif";

// // ─── Mock data ────────────────────────────────────────────────────────────────
// const INITIAL_RESOURCES = [
//   { id:1,  file:"Mathematics_G7_Notes_Module1.pdf",    level:"G7",      subject:"Mathematics", subjectCat:"Sciences",    resourceType:"Notes",           uploadDate:"15 Apr 2026", uploadedBy:"jonny77",    size:"2.4MB",  downloads:145, status:"Approved"  },
//   { id:2,  file:"Shona_O_Level_Paper1_2024.pdf",       level:"O Level", subject:"Shona",       subjectCat:"Arts",        resourceType:"Question Papers", uploadDate:"12 Apr 2026", uploadedBy:"rosa_m",     size:"1.8MB",  downloads:320, status:"Unlocked"  },
//   { id:3,  file:"Pure_Math_A_Level_Textbook_Vol2.pdf", level:"A Level", subject:"Mathematics", subjectCat:"Sciences",    resourceType:"Textbooks",       uploadDate:"10 Apr 2026", uploadedBy:"tchen_dev",  size:"12.5MB", downloads:98,  status:"Locked"    },
//   { id:4,  file:"HBC_Project_Guide_O_Level.pdf",       level:"O Level", subject:"HBC Projects",subjectCat:"Commercials", resourceType:"HBC Projects",    uploadDate:"05 Apr 2026", uploadedBy:"mianwii199", size:"3.1MB",  downloads:210, status:"Approved"  },
//   { id:5,  file:"Accounts_MarkingGuide_2025.pdf",      level:"O Level", subject:"Accounts",    subjectCat:"Commercials", resourceType:"Marking Guides",  uploadDate:"01 Apr 2026", uploadedBy:"markwillit", size:"1.2MB",  downloads:180, status:"Pending"   },
//   { id:6,  file:"Physics_A_Level_Notes_Unit3.pdf",     level:"A Level", subject:"Physics",     subjectCat:"Sciences",    resourceType:"Notes",           uploadDate:"29 Mar 2026", uploadedBy:"alice_k",    size:"4.7MB",  downloads:260, status:"Unlocked"  },
//   { id:7,  file:"English_O_Level_Comprehension.pdf",   level:"O Level", subject:"English",     subjectCat:"Arts",        resourceType:"Question Papers", uploadDate:"27 Mar 2026", uploadedBy:"bob_s",      size:"0.9MB",  downloads:410, status:"Approved"  },
//   { id:8,  file:"Commerce_G7_Textbook.pdf",            level:"G7",      subject:"Commerce",    subjectCat:"Commercials", resourceType:"Textbooks",       uploadDate:"22 Mar 2026", uploadedBy:"cindy_w",    size:"8.3MB",  downloads:75,  status:"Locked"    },
//   { id:9,  file:"Biology_O_Level_MarkScheme.pdf",      level:"O Level", subject:"Biology",     subjectCat:"Sciences",    resourceType:"Marking Guides",  uploadDate:"18 Mar 2026", uploadedBy:"dave_m",     size:"2.1MB",  downloads:195, status:"Pending"   },
//   { id:10, file:"Geography_G7_Study_Guide.pdf",        level:"G7",      subject:"Geography",   subjectCat:"Arts",        resourceType:"Notes",           uploadDate:"14 Mar 2026", uploadedBy:"eva_p",      size:"3.6MB",  downloads:88,  status:"Unlocked"  },
//   { id:11, file:"Accounting_A_Level_Exam_Pack.pdf",    level:"A Level", subject:"Accounts",    subjectCat:"Commercials", resourceType:"Question Papers", uploadDate:"10 Mar 2026", uploadedBy:"felix_r",    size:"5.2MB",  downloads:302, status:"Approved"  },
//   { id:12, file:"Chemistry_O_Level_Practical.pdf",     level:"O Level", subject:"Chemistry",   subjectCat:"Sciences",    resourceType:"Notes",           uploadDate:"06 Mar 2026", uploadedBy:"grace_n",    size:"1.5MB",  downloads:140, status:"Pending"   },
//   { id:13, file:"Shona_A_Level_Literature.pdf",        level:"A Level", subject:"Shona",       subjectCat:"Arts",        resourceType:"Textbooks",       uploadDate:"02 Mar 2026", uploadedBy:"tchen_dev",  size:"6.8MB",  downloads:57,  status:"Locked"    },
//   { id:14, file:"Business_Studies_G7_Notes.pdf",       level:"G7",      subject:"Business",    subjectCat:"Commercials", resourceType:"Notes",           uploadDate:"26 Feb 2026", uploadedBy:"jonny77",    size:"2.9MB",  downloads:122, status:"Approved"  },
//   { id:15, file:"Physics_O_Level_QP_2023.pdf",         level:"O Level", subject:"Physics",     subjectCat:"Sciences",    resourceType:"Question Papers", uploadDate:"20 Feb 2026", uploadedBy:"rosa_m",     size:"1.4MB",  downloads:375, status:"Unlocked"  },
//   { id:16, file:"Mathematics_O_Level_Advanced.pdf",    level:"O Level", subject:"Mathematics", subjectCat:"Sciences",    resourceType:"Textbooks",       uploadDate:"15 Feb 2026", uploadedBy:"alice_k",    size:"9.1MB",  downloads:245, status:"Approved"  },
//   { id:17, file:"Biology_G7_Introduction.pdf",         level:"G7",      subject:"Biology",     subjectCat:"Sciences",    resourceType:"Notes",           uploadDate:"10 Feb 2026", uploadedBy:"dave_m",     size:"4.3MB",  downloads:63,  status:"Pending"   },
//   { id:18, file:"Commerce_O_Level_Case_Studies.pdf",   level:"O Level", subject:"Commerce",    subjectCat:"Commercials", resourceType:"Notes",           uploadDate:"05 Feb 2026", uploadedBy:"cindy_w",    size:"2.2MB",  downloads:188, status:"Approved"  },
// ];

// ─── Palette maps ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  "approved": { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7", dot: "#10B981" },
  "unlocked": { bg: "#DBEAFE", color: "#1E3A8A", border: "#93C5FD", dot: "#3B82F6" },
  "locked": { bg: "#FEE2E2", color: "#7F1D1D", border: "#FCA5A5", dot: "#EF4444" },
  "pending": { bg: "#FEF3C7", color: "#78350F", border: "#FCD34D", dot: "#F59E0B" },
};
const LEVEL_STYLES = {
  "grade 7": { bg: "#D1FAE5", color: "#065F46" },
  "ordinary level": { bg: "#DBEAFE", color: "#1E40AF" },
  "advance level": { bg: "#FEE2E2", color: "#991B1B" },
};
const TYPE_STYLES = {
  "notes": { bg: "#EFF6FF", color: "#1E40AF" },
  "question papers": { bg: "#FFF7ED", color: "#92400E" },
  "textbooks": { bg: "#1E3A5F", color: "#fff" },
  "hbc projects": { bg: "#EDE9FE", color: "#5B21B6" },
  "marking guides": { bg: "#FEF3C7", color: "#78350F" },
};

// ─── Filter option arrays ─────────────────────────────────────────────────────
const UPLOADERS = ["All", "jonny77", "rosa_m", "tchen_dev", "mianwii199", "markwillit", "alice_k", "bob_s", "cindy_w", "dave_m", "eva_p", "felix_r", "grace_n"];
const SUBJECTS = ["All", "Mathematics", "Physics", "Shona", "Accounts", "HBC Projects", "Biology", "Chemistry", "Commerce", "Geography", "English", "Business"];
const LEVELS_OPT = ["All", "G7", "O Level", "A Level"];
const RES_TYPES = ["All", "Notes", "Question Papers", "Textbooks", "HBC Projects", "Marking Guides"];
const SUBJ_CATS = ["All", "Sciences", "Arts", "Commercials"];
const STATUSES = ["All", "Approved", "Unlocked", "Locked", "Pending"];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  G7: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>,
  OLevel: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /></svg>,
  ALevel: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Filter: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Calendar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  User: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Print: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
  // Upload:   () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>),
  Export: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  PDF: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Eye: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>,
  Download: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" /></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>,
  Lock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Unlock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>,
  X: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

// ─── StatCard  (identical to botUsers) ───────────────────────────────────────
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

// ─── StatusBadge with dot indicator ──────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Level pill ───────────────────────────────────────────────────────────────
function LevelPill({ level }) {
  const s = LEVEL_STYLES[level.toLowerCase()] || { bg: "#E5E7EB", color: "#374151" };
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" }}>
      {level}
    </span>
  );
}

// ─── Type pill ────────────────────────────────────────────────────────────────
function TypePill({ type }) {
  const s = TYPE_STYLES[type.toLowerCase()] || { bg: "#E5E7EB", color: "#374151" };
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, fontSize: 10, fontWeight: 600, fontFamily: FONT, whiteSpace: "nowrap" }}>
      {type}
    </span>
  );
}

// ─── ActionBtn  (identical to botUsers) ──────────────────────────────────────
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

// ─── Dropdown  (identical to botUsers — outside-click close) ─────────────────
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
          minWidth: 260, fontFamily: FONT,
        }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

// ─── Resource Filter Dropdown (adapted FilterDropdown from botUsers) ──────────
function ResourceFilterDropdown({ filters, onChange }) {
  const sections = [
    { key: "level", label: "Level", opts: LEVELS_OPT },
    { key: "subject", label: "Subject", opts: SUBJECTS },
    { key: "resourceType", label: "Resource Type", opts: RES_TYPES },
    { key: "subjectCat", label: "Subject Category", opts: SUBJ_CATS },
    { key: "status", label: "Status", opts: STATUSES },
    { key: "sort", label: "Sort By", opts: ["Default", "A–Z File Name", "Downloads ↓", "Downloads ↑", "Date Newest", "Date Oldest"] },
  ];
  const activeCount = Object.entries(filters).filter(([k, v]) => k === "sort" ? v !== "Default" : v !== "All").length;
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
        {activeCount > 0 && <span style={{ background: BLUE, color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{activeCount}</span>}
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

// ─── Uploaded At Dropdown  (same as botUsers DateRangeDropdown) ───────────────
function UploadedAtDropdown({ dateRange, setDateRange }) {
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
        {hasDate ? `${dateRange.start || "…"} → ${dateRange.end || "…"}` : "Uploaded At"}
        {hasDate
          ? <span onClick={e => { e.stopPropagation(); setDateRange({ start: "", end: "" }); }} style={{ marginLeft: 2, display: "flex", alignItems: "center", color: "#9CA3AF" }}><Icon.X /></span>
          : <Icon.ChevDown />}
      </button>
    )}>
      {close => (
        <div style={{ padding: "14px 16px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#374151" }}>Upload Date Range</p>
          {[["From", "start"], ["To", "end"]].map(([lbl, key]) => (
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

// ─── Uploaded By Dropdown ─────────────────────────────────────────────────────
function UploadedByDropdown({ value, onChange }) {
  const active = value !== "All";
  return (
    <Dropdown trigger={open => (
      <button style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 10px", borderRadius: 8,
        border: `1.5px solid ${open || active ? BLUE : "#E2E6F0"}`,
        background: open || active ? "#EFF6FF" : "#fff",
        color: active ? BLUE : "#374151",
        cursor: "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)", whiteSpace: "nowrap",
      }}>
        <Icon.User />
        {active ? `@${value}` : "Uploaded By"}
        {active
          ? <span onClick={e => { e.stopPropagation(); onChange("All"); }} style={{ marginLeft: 2, display: "flex", alignItems: "center", color: "#9CA3AF" }}><Icon.X /></span>
          : <Icon.ChevDown />}
      </button>
    )}>
      {close => (
        <div style={{ padding: "8px 0" }}>
          <p style={{ margin: "0 0 6px", padding: "0 14px", fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Select Uploader</p>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {UPLOADERS.map(u => (
              <button key={u} onClick={() => { onChange(u); close(); }} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 14px", fontSize: 12, fontFamily: FONT,
                fontWeight: value === u ? 700 : 400,
                color: value === u ? BLUE : "#374151",
                background: value === u ? "#EFF6FF" : "transparent",
                border: "none", cursor: "pointer",
              }}>
                {value === u && <span style={{ marginRight: 6 }}>✓</span>}
                {u === "All" ? "All Uploaders" : `@${u}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// ─── Small icon button (table actions) ───────────────────────────────────────
function IconBtn({ children, onClick, title, bg, hoverBg, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? hoverBg : bg, border: "none", borderRadius: 7, padding: "5px 6px", cursor: "pointer", color, display: "flex", transition: "background .15s" }}>
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResourceManagement({ isMobile = false }) {
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({ level: "All", subject: "All", resourceType: "All", subjectCat: "All", status: "All", sort: "Default" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [uploadedBy, setUploadedBy] = useState("All");
  const [uploadNewResource, setUploadNewResource] = useState(false);
  const rowsPerPage = isMobile ? 8 : 10;

  const fetchResource = async () => {
    try {
      const res = await fetch(`${baseURL}/api/resources`, {
        method: "GET", headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) {
        console.warn("Error occurred: ", data.message);
        return;
      }
      console.log(data);
      console.table(data.resources);
      setResources(data.resources);
    } catch (error) {
      console.error("Error while connecting to the server");
    }
  }

  useEffect(() => {
    fetchResource()
  }, []);
  // ── Filter handler (same as botUsers) ─────────────────────────────────────
  const handleFilterChange = (key, val) => {
    if (key === "_reset") { setFilters({ level: "All", subject: "All", resourceType: "All", subjectCat: "All", status: "All", sort: "Default" }); return; }
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = resources.filter(r => {
      const q = search.toLowerCase();
      if (q && !r.file.toLowerCase().includes(q) && !r.uploadedBy.toLowerCase().includes(q) && !r.subject.toLowerCase().includes(q)) return false;
      if (filters.level !== "All" && r.level !== filters.level) return false;
      if (filters.subject !== "All" && r.subject !== filters.subject) return false;
      if (filters.resourceType !== "All" && r.resourceType !== filters.resourceType) return false;
      if (filters.subjectCat !== "All" && r.subjectCat !== filters.subjectCat) return false;
      if (filters.status !== "All" && r.status !== filters.status) return false;
      if (uploadedBy !== "All" && r.uploadedBy !== uploadedBy) return false;
      return true;
    });
    if (filters.sort === "A–Z File Name") list = [...list].sort((a, b) => a.file.localeCompare(b.file));
    if (filters.sort === "Downloads ↓") list = [...list].sort((a, b) => b.downloads - a.downloads);
    if (filters.sort === "Downloads ↑") list = [...list].sort((a, b) => a.downloads - b.downloads);
    if (filters.sort === "Date Newest") list = [...list].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    if (filters.sort === "Date Oldest") list = [...list].sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    return list;
  }, [resources, search, filters, uploadedBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRows = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selected.includes(r.id));

  const showToast = (msg, color = BLUE) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800); };

  // ── Selection (identical to botUsers) ────────────────────────────────────
  const toggleAll = () => { const ids = pageRows.map(r => r.id); setSelected(p => allPageSelected ? p.filter(id => !ids.includes(id)) : [...new Set([...p, ...ids])]); };
  const toggleRow = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ── Row / bulk ops ────────────────────────────────────────────────────────
  const handleDelete = id => { setResources(p => p.filter(r => r.id !== id)); setSelected(p => p.filter(x => x !== id)); showToast("Resource deleted", "#EF4444"); };
  const bulkApprove = () => { setResources(p => p.map(r => selected.includes(r.id) ? { ...r, status: "Approved" } : r)); showToast(`${selected.length} approved`, GREEN); setSelected([]); };
  const bulkLock = () => { setResources(p => p.map(r => selected.includes(r.id) ? { ...r, status: "Locked" } : r)); showToast(`${selected.length} locked`, ORANGE); setSelected([]); };
  const bulkUnlock = () => { setResources(p => p.map(r => selected.includes(r.id) && r.status === "Locked" ? { ...r, status: "Unlocked" } : r)); showToast(`Unlocked`, BLUE); setSelected([]); };
  const bulkDelete = () => { setResources(p => p.filter(r => !selected.includes(r.id))); showToast(`${selected.length} deleted`, "#EF4444"); setSelected([]); };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: resources.length + 1216,
    g7: resources.filter(r => r.level === "G7").length + 636,
    oLevel: resources.filter(r => r.level === "O Level").length + 389,
    aLevel: resources.filter(r => r.level === "A Level").length + 75,
  };

  // ── Pagination pages (identical to botUsers) ──────────────────────────────
  const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
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
      /* Page-level vertical scroll — the table itself has no overflow-y.
         Horizontal scroll is handled by the table wrapper below.           */
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
        <div style={{ fontSize: 10, color: "#8A95B0", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
          Hub.AI / PDF Stats
        </div>
        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 21, fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
          Resource Management
        </h1>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6B7280" }}>
          Manage all PDF resources. Control access, approve uploads, and monitor downloads.
        </p>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: isMobile ? 10 : 12, flexShrink: 0 }}>
        <StatCard icon={Icon.Upload} label="Total Uploads" value={stats.total} accent={BLUE} isMobile={isMobile} />
        <StatCard icon={Icon.G7} label="Grade 7 PDFs" value={stats.g7} accent="#10B981" isMobile={isMobile} />
        <StatCard icon={Icon.OLevel} label="O Level PDFs" value={stats.oLevel} accent={BLUE} isMobile={isMobile} />
        <StatCard icon={Icon.ALevel} label="A Level PDFs" value={stats.aLevel} accent={ORANGE} isMobile={isMobile} />
      </div>

      {/* ── Main white card ──────────────────────────────────────────────── */}
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
          {/* Search */}
          <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "1 1 200px", minWidth: 140 }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", display: "flex", pointerEvents: "none" }}>
              <Icon.Search />
            </span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search files, subjects, uploaders…"
              style={{ width: "100%", padding: "6px 10px 6px 30px", borderRadius: 9, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 12, outline: "none", color: "#111827" }}
            />
          </div>

          {/* Left-aligned filter controls */}
          <ResourceFilterDropdown filters={filters} onChange={handleFilterChange} />
          <UploadedAtDropdown dateRange={dateRange} setDateRange={setDateRange} />
          <UploadedByDropdown value={uploadedBy} onChange={v => { setUploadedBy(v); setPage(1); }} />

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "#E5E7EB", margin: "0 2px" }} />

          {/* Action button */}
          <ActionBtn icon={Icon.Print} label="Print" />

          {/* Export — pushed to the far right */}
          <ActionBtn icon={Icon.Upload} label="Upload Resource" onClick={() => setUploadNewResource(true)}
            extraStyle={{ marginLeft: "auto", background: BLUE, color: "#fff", borderColor: BLUE, fontWeight: 700 }}
          />
          <ActionBtn icon={Icon.Export} label="Export"
            extraStyle={{ marginLeft: "auto", background: BLUE, color: "#fff", borderColor: BLUE, fontWeight: 700 }}
          />

          {/* ── Bulk actions (appear when rows selected — same as botUsers) ── */}
          {selected.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", width: "100%", paddingTop: 4 }}>
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>
                {selected.length} selected
              </span>
              <button onClick={bulkApprove} style={bkBtn(GREEN)}>   <Icon.Check />  Approve</button>
              <button onClick={bulkLock} style={bkBtn(ORANGE)}>  <Icon.Lock />   Lock</button>
              <button onClick={bulkUnlock} style={bkBtn(BLUE)}>    <Icon.Unlock /> Unlock</button>
              <button onClick={bulkDelete} style={bkBtn("#EF4444")}><Icon.Trash />  Delete</button>
              <button onClick={() => setSelected([])} style={{ display: "inline-flex", alignItems: "center", padding: "5px 7px", borderRadius: 8, border: "1.5px solid #E2E6F0", background: "#fff", color: "#9CA3AF", cursor: "pointer" }}>
                <Icon.X />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TABLE WRAPPER
            • overflowX: auto  → horizontal scroll (table is 1 200 px wide)
            • overflowY: visible → NO inner vertical scroll; page scrolls
            • sticky thead anchors to the page scroll container automatically
        ═════════════════════════════════════════════════════════════════ */}
        <div style={{ overflowX: "auto", overflowY: "visible", width: "100%" }}>
          <table style={{
            minWidth: 1200,          /* forces hscroll on narrow screens */
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
            fontSize: 12,
            fontFamily: FONT,
          }}>
            {/* Sticky header */}
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E5E7EB" }}>
                {[
                  { el: <input type="checkbox" checked={allPageSelected} onChange={toggleAll} /> },
                  { label: "No." },
                  { label: "File Name" },
                  { label: "Status" },
                  { label: "Level" },
                  { label: "Subject" },
                  { label: "Subject Cat." },
                  { label: "Resource Type" },
                  { label: "Upload Date" },
                  { label: "Uploaded By" },
                  { label: "Size" },
                  { label: "Downloads" },
                  { label: "Actions" },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: "9px 12px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, color: "#6B7280",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    fontFamily: FONT, whiteSpace: "nowrap", background: "#F8FAFC",
                  }}>
                    {col.el || col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                    No resources found{search ? ` matching "${search}"` : ""}
                  </td>
                </tr>
              ) : pageRows.map((r, idx) => {
                const isSel = selected.includes(r.id);
                const short = r.title.replace(".pdf", "").slice(0, 32) + (r.title.length > 36 ? "…" : "");
                return (
                  <tr key={r.id}
                    style={{
                      background: isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC",
                      borderBottom: "1px solid #F1F5F9", transition: "background .1s"
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F5F8FF"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? "#EFF6FF" : idx % 2 === 0 ? "#fff" : "#FAFBFC"; }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "10px 12px" }}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleRow(r.id)} />
                    </td>
                    {/* No. */}
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>
                    {/* File Name — blue link style with PDF icon */}
                    <td style={{ padding: "10px 12px", minWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ flexShrink: 0 }}><Icon.PDF /></span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: BLUE, fontFamily: FONT, whiteSpace: "nowrap" }} title={r.title}>
                          {short}
                        </span>
                      </div>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "10px 12px" }}><StatusBadge status={r.status} /></td>
                    {/* Level */}
                    <td style={{ padding: "10px 12px" }}><LevelPill level={r.level} /></td>
                    {/* Subject */}
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#374151", fontFamily: FONT, whiteSpace: "nowrap" }}>{r.subject}</td>
                    {/* Subject Cat. */}
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 500, fontFamily: FONT, whiteSpace: "nowrap" }}>
                        {r.subjectCat}
                      </span>
                    </td>
                    {/* Resource Type */}
                    <td style={{ padding: "10px 12px" }}><TypePill type={r.subjectType} /></td>
                    {/* Upload Date */}
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#374151", fontFamily: FONT, whiteSpace: "nowrap" }}>{r.uploadDate}</td>
                    {/* Uploaded By */}
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: "#F0F2F8", color: "#4B5563", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600, fontFamily: FONT }}>
                        {r.uploadedBy}
                      </span>
                    </td>
                    {/* Size */}
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#6B7280", fontFamily: FONT, whiteSpace: "nowrap" }}>{r.size}</td>
                    {/* Downloads */}
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#374151", fontFamily: FONT, fontWeight: 600 }}>{r.downloads.toLocaleString()}</td>
                    {/* Actions: edit · view · download · delete */}
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <IconBtn title="Edit" bg="#EFF6FF" hoverBg="#DBEAFE" color={BLUE} onClick={() => showToast(`Editing: ${r.file}`, BLUE)}><Icon.Edit /></IconBtn>
                        <IconBtn title="View" bg="#F3F4F6" hoverBg="#E5E7EB" color="#6B7280" onClick={() => showToast(`Viewing: ${r.file}`, "#6B7280")}><Icon.Eye /></IconBtn>
                        <IconBtn title="Download" bg="#ECFDF5" hoverBg="#D1FAE5" color={GREEN} onClick={() => showToast(`Downloading…`, GREEN)}><Icon.Download /></IconBtn>
                        <IconBtn title="Delete" bg="#FEF2F2" hoverBg="#FEE2E2" color="#DC2626" onClick={() => handleDelete(r.id)}><Icon.Trash /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination (identical to botUsers) ───────────────────────── */}
        <div style={{
          padding: "9px 16px", borderTop: "1px solid #F1F5F9", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 7,
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: FONT }}>
            Showing <b>{filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)}</b> of <b>{filtered.length}</b> resources
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
      {/* ── Upload New Resource Modal (identical to botUsers AddUserModal) ── */}
      {uploadNewResource && (
        <UploadResource onClose={() => setUploadNewResource(false)} />
      )}
      {/* ── Toast (identical to botUsers) ───────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#1E293B", color: "#fff",
          padding: "11px 18px", borderRadius: 12, fontFamily: FONT, fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 30px rgba(0,0,0,0.18)", zIndex: 2000,
          borderLeft: `4px solid ${toast.color}`,
          animation: "fadeInUp .3s ease",
        }}>{toast.msg}</div>
      )}
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

function bkBtn(color) {
  return {
    display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px",
    borderRadius: 9, border: `1.5px solid ${color}`,
    background: color + "18", color,
    fontFamily: FONT, fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
  };
}