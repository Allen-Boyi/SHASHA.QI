import { useState, useEffect } from "react";

const BLUE   = "#4B6EF5";
const GREEN  = "#22C55E";
const ORANGE = "#E85D04";
const RED    = "#EF4444";
const FONT   = "'Sora', 'Segoe UI', sans-serif";
const baseURL = import.meta.env.VITE_BASEURL;

const Ico = {
  Settings:  () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Restart:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg>,
  Trash:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  ChevDown:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevUp:    () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>,
  ChevLeft:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Check:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Burn:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  Use:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Unblock:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Reset:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg>,
  Export:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Print:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Import:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Sync:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Cloud:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
};

function Toggle({ checked, onChange, size = "md" }) {
  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 20 : 24;
  return (
    <div onClick={() => onChange(!checked)} style={{ width: w, height: h, borderRadius: h, background: checked ? GREEN : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: checked ? w - h + 2 : 2, width: h - 4, height: h - 4, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left .2s" }} />
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #E8EBF4", ...style }}>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text", style = {} }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 13, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box", ...style }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = "#E2E6F0"} />
  );
}

function StatusPill({ status }) {
  const map = {
    active:       { bg: GREEN,    color: "#fff",    label: "Active"     },
    "not active": { bg: "#E5E7EB", color: "#374151", label: "Not active" },
    blocked:      { bg: "#FEE2E2", color: "#7F1D1D", label: "Blocked"   },
  };
  const s = map[status] || map["not active"];
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function IBtn({ children, onClick, title, bgKey = "del" }) {
  const [h, setH] = useState(false);
  const bgs  = { del: "#FEF2F2", edit: "#EFF6FF" };
  const hbgs = { del: "#FEE2E2", edit: "#DBEAFE" };
  const cols = { del: RED, edit: BLUE };
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? hbgs[bgKey] : bgs[bgKey], border: "none", borderRadius: 6, padding: "5px 6px", cursor: "pointer", color: cols[bgKey], display: "flex", transition: "background .15s" }}>
      {children}
    </button>
  );
}

function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>Showing <b>{from}–{to}</b> of {total}</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button disabled={page === 1} onClick={() => onChange(page - 1)}
          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E6F0", background: "#fff", cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "#D1D5DB" : "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico.ChevLeft />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)}
            style={{ width: 28, height: 28, borderRadius: 7, border: page === p ? "none" : "1px solid #E2E6F0", background: page === p ? BLUE : "#fff", color: page === p ? "#fff" : "#374151", fontFamily: FONT, fontSize: 12, fontWeight: page === p ? 700 : 500, cursor: "pointer" }}>
            {p}
          </button>
        ))}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)}
          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E6F0", background: "#fff", cursor: page === totalPages ? "default" : "pointer", color: page === totalPages ? "#D1D5DB" : "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico.ChevRight />
        </button>
      </div>
    </div>
  );
}

function SyncBanner({ result, onClose }) {
  if (!result) return null;
  const isErr = result.error;
  return (
    <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 10, background: isErr ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${isErr ? "#FCA5A5" : "#86EFAC"}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{isErr ? "❌" : "✅"}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: isErr ? "#991B1B" : "#166534", fontFamily: FONT, fontWeight: 700 }}>{result.message}</p>
        {!isErr && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { label: "Synced",  val: result.synced,             color: GREEN  },
              { label: "Skipped", val: result.skipped_duplicates, color: ORANGE },
              { label: "Failed",  val: result.failed,             color: RED    },
            ].map(s => (
              <span key={s.label} style={{ fontSize: 12, fontFamily: FONT, color: "#374151", fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block", marginRight: 4 }} />
                {s.label}: <b>{s.val}</b>
              </span>
            ))}
          </div>
        )}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 0 }}>×</button>
    </div>
  );
}

const INIT_KEYS = [
  { id: 1, status: "active",     llm: "Groq",      key: "2344hgh45",      tokens: "85000", date: "12/3/2026" },
  { id: 2, status: "not active", llm: "Chart Gpt", key: "7fg84hfh484n",   tokens: "000",   date: "2/4/2026"  },
  { id: 3, status: "not active", llm: "Gemina",    key: "958tthb 49r4",   tokens: "40000", date: "5/5/2026"  },
  { id: 4, status: "not active", llm: "claude",    key: "9if40er khr040", tokens: "300",   date: "4/8/2024"  },
];

const INIT_ROLES = [
  { id: 1, role: "Admin",  roleType: "Roles" },
  { id: 2, role: "Editor", roleType: "Roles" },
  { id: 3, role: "Viewer", roleType: "Roles" },
];

export default function Settings({ isMobile = false }) {
  const [botOn, setBotOn]       = useState(true);
  const [twoFA, setTwoFA]       = useState(true);
  const [twoFASec, setTwoFASec] = useState(true);
  const [toast, setToast]       = useState(null);

  const [keys, setKeys]           = useState(INIT_KEYS);
  const [selKeys, setSelKeys]     = useState([]);
  const [newKey, setNewKey]       = useState({ key: "", llm: "", tokens: "" });
  const [keyPage, setKeyPage]     = useState(1);
  const PER_KEY = 10;

  const [roles, setRoles]             = useState(INIT_ROLES);
  const [editRoleId, setEditRoleId]   = useState(null);
  const [editRoleVal, setEditRoleVal] = useState("");
  const [rolePage, setRolePage]       = useState(1);
  const PER_ROLE = 10;

  const [defaultReply, setDefaultReply]     = useState("sorry i didnt understand");
  const [sessionTimeout, setSessionTimeout] = useState(15);

  const [syncing, setSyncing]         = useState(false);
  const [syncResult, setSyncResult]   = useState(null);
  const [syncLogs, setSyncLogs]       = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPage, setLogPage]         = useState(1);
  const PER_LOG = 5;

  const showToast = (msg, color = BLUE) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2600); };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res  = await fetch(`${baseURL}/api/resources/sync_logs`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) setSyncLogs(data.logs || []);
      } catch (e) { console.error("Failed to load sync logs:", e); }
      finally { setLogsLoading(false); }
    };
    fetchLogs();
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res  = await fetch(`${baseURL}/api/resources/sync_drive_resources`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(data);
        const logsRes  = await fetch(`${baseURL}/api/resources/sync_logs`, { credentials: "include" });
        const logsData = await logsRes.json();
        if (logsRes.ok) { setSyncLogs(logsData.logs || []); setLogPage(1); }
      } else {
        setSyncResult({ error: true, message: data.message || "Sync failed." });
      }
    } catch (e) {
      setSyncResult({ error: true, message: "Could not connect to server." });
    } finally {
      setSyncing(false);
    }
  };

  const toggleKey     = id => setSelKeys(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllKeys = () => setSelKeys(p => p.length === keys.length ? [] : keys.map(k => k.id));
  const deleteKey     = id => { setKeys(p => p.filter(k => k.id !== id)); setSelKeys(p => p.filter(x => x !== id)); showToast("API key deleted", RED); };
  const addKey        = () => {
    if (!newKey.key || !newKey.llm) return;
    setKeys(p => [...p, { id: Date.now(), status: "not active", llm: newKey.llm, key: newKey.key, tokens: newKey.tokens || "0", date: new Date().toLocaleDateString() }]);
    setNewKey({ key: "", llm: "", tokens: "" });
    showToast("API key added", GREEN);
  };

  const startEditRole = r => { setEditRoleId(r.id); setEditRoleVal(r.role); };
  const saveEditRole  = () => { setRoles(p => p.map(r => r.id === editRoleId ? { ...r, role: editRoleVal } : r)); setEditRoleId(null); showToast("Role updated", BLUE); };
  const deleteRole    = id => { setRoles(p => p.filter(r => r.id !== id)); showToast("Role deleted", RED); };

  const pageKeys  = keys.slice((keyPage  - 1) * PER_KEY,  keyPage  * PER_KEY);
  const pageRoles = roles.slice((rolePage - 1) * PER_ROLE, rolePage * PER_ROLE);
  const pageLogs  = syncLogs.slice((logPage - 1) * PER_LOG, logPage * PER_LOG);

  const thStyle = { padding: "9px 12px", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT, whiteSpace: "nowrap", textAlign: "left", background: "#F8FAFC", borderBottom: "1.5px solid #E5E7EB" };
  const tdStyle = { padding: "10px 12px", fontSize: 12, color: "#374151", fontFamily: FONT, verticalAlign: "middle", borderBottom: "1px solid #F1F5F9" };

  return (
    <div style={{ fontFamily: FONT, background: "#EEF2F8", minHeight: "100%", width: "100%", padding: isMobile ? "10px" : "20px", boxSizing: "border-box", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input[type="checkbox"] { width:15px; height:15px; accent-color:${BLUE}; cursor:pointer; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
        textarea { resize:vertical; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ico.Settings />
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 24, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>Settings</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => showToast("Bot restarting…", ORANGE)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: isMobile ? "8px 12px" : "9px 18px", borderRadius: 10, border: "none", background: BLUE, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            <Ico.Restart /> {!isMobile && "Restart"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: "1px solid #E8EBF4" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: FONT, whiteSpace: "nowrap" }}>{isMobile ? "Bot" : "Power off/on the bot"}</span>
            <Toggle checked={botOn} onChange={setBotOn} />
          </div>
        </div>
      </div>

      {/* Security Management */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? 15 : 17, fontWeight: 800, color: "#111827" }}>Security Management</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: FONT }}>2FA</span>
            <Toggle checked={twoFA} onChange={setTwoFA} size="sm" />
          </div>
        </div>

        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: 10, border: "1px solid #E5E7EB" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                <th style={thStyle}><input type="checkbox" checked={selKeys.length === keys.length && keys.length > 0} onChange={toggleAllKeys} /></th>
                {["Status", "LLM", "API Key", "Tokens", "Date Added", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {pageKeys.map((k, idx) => (
                <tr key={k.id} style={{ background: idx % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                  <td style={tdStyle}><input type="checkbox" checked={selKeys.includes(k.id)} onChange={() => toggleKey(k.id)} /></td>
                  <td style={tdStyle}><StatusPill status={k.status} /></td>
                  <td style={tdStyle}><span style={{ fontWeight: 700, color: "#111827" }}>{k.llm}</span></td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, background: "#F1F5F9", padding: "2px 6px", borderRadius: 5, display: "inline-block", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.key}</span>
                  </td>
                  <td style={tdStyle}>{k.tokens}</td>
                  <td style={tdStyle}>{k.date}</td>
                  <td style={tdStyle}><IBtn title="Delete" bgKey="del" onClick={() => deleteKey(k.id)}><Ico.Trash /></IBtn></td>
                </tr>
              ))}
              {keys.length === 0 && <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", padding: "28px 0" }}>No API keys added yet</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={keyPage} total={keys.length} perPage={PER_KEY} onChange={setKeyPage} />

        <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 230px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800, color: "#111827" }}>Add New API Key</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { label: "API Key", k: "key",    ph: "eg: Groq-49r4" },
                { label: "LLM",     k: "llm",    ph: "eg: Groq"      },
                { label: "Tokens",  k: "tokens", ph: "eg: 85000"     },
              ].map(f => (
                <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: FONT, minWidth: 70 }}>{f.label}</label>
                  <Input placeholder={f.ph} value={newKey[f.k]} onChange={e => setNewKey(p => ({ ...p, [f.k]: e.target.value }))} style={{ maxWidth: 220 }} />
                </div>
              ))}
              <button onClick={addKey} style={{ width: 110, padding: "9px 0", borderRadius: 9, border: "none", background: BLUE, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Add Key
              </button>
            </div>
          </div>

          {selKeys.length > 0 && (
            <div style={{ flex: "1 1 230px", animation: "fadeUp .25s ease" }}>
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E8EBF4", borderRadius: 12, padding: "14px 14px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Burn",    icon: <Ico.Burn />,    color: ORANGE   },
                    { label: "Use",     icon: <Ico.Use />,     color: BLUE     },
                    { label: "Unblock", icon: <Ico.Unblock />, color: GREEN    },
                    { label: "Reset",   icon: <Ico.Reset />,   color: "#6B7280" },
                  ].map(a => (
                    <button key={a.label} onClick={() => showToast(`${a.label} applied`, a.color)}
                      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 10px", borderRadius: 9, border: `1.5px solid ${a.color}22`, background: `${a.color}11`, color: a.color, fontFamily: FONT, fontSize: 10, fontWeight: 700, cursor: "pointer", minWidth: 52 }}>
                      {a.icon}{a.label}
                    </button>
                  ))}
                </div>
                <div style={{ padding: "5px 12px", borderRadius: 8, background: BLUE, color: "#fff", fontFamily: FONT, fontSize: 12, fontWeight: 700, display: "inline-block" }}>
                  {selKeys.length} selected
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lower grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Security & Access */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827" }}>Security &amp; Access</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: FONT }}>2FA</span>
              <Toggle checked={twoFASec} onChange={setTwoFASec} size="sm" />
            </div>
          </div>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: 10, border: "1px solid #E5E7EB" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}>
              <thead>
                <tr>{["No.", "Status", "User Role", "Role Type", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {pageRoles.map((r, idx) => (
                  <tr key={r.id} style={{ background: idx % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                    <td style={{ ...tdStyle, color: "#9CA3AF" }}>{(rolePage - 1) * PER_ROLE + idx + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D1FAE5", border: `2px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {editRoleId === r.id
                        ? <input autoFocus value={editRoleVal} onChange={e => setEditRoleVal(e.target.value)} onBlur={saveEditRole} onKeyDown={e => e.key === "Enter" && saveEditRole()}
                            style={{ padding: "5px 8px", borderRadius: 7, border: "1.5px solid " + BLUE, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: "#111827", outline: "none", width: "100%" }} />
                        : <span style={{ fontWeight: 700, color: "#111827", fontFamily: FONT }}>{r.role}</span>}
                    </td>
                    <td style={tdStyle}><span style={{ fontWeight: 600, color: "#374151", fontFamily: FONT }}>{r.roleType}</span></td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <IBtn title="Edit"   bgKey="edit" onClick={() => startEditRole(r)}><Ico.Edit /></IBtn>
                        <IBtn title="Delete" bgKey="del"  onClick={() => deleteRole(r.id)}><Ico.Trash /></IBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", padding: "20px 0" }}>No roles defined</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={rolePage} total={roles.length} perPage={PER_ROLE} onChange={setRolePage} />
        </Card>

        {/* Bot Behavior */}
        <Card>
          <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#111827" }}>Bot Behavior Settings</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: FONT, marginBottom: 5 }}>Default Reply</label>
            <textarea value={defaultReply} onChange={e => setDefaultReply(e.target.value)} rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 13, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = BLUE}
              onBlur={e => e.target.style.borderColor = "#E2E6F0"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: FONT, whiteSpace: "nowrap" }}>Session timeout</label>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E2E6F0", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
              <input type="number" value={sessionTimeout} min={1} max={120} onChange={e => setSessionTimeout(+e.target.value)}
                style={{ width: 52, padding: "8px 10px", border: "none", fontFamily: FONT, fontSize: 13, color: "#111827", outline: "none", textAlign: "center", background: "transparent" }} />
              <div style={{ display: "flex", flexDirection: "column", borderLeft: "1.5px solid #E2E6F0" }}>
                <button onClick={() => setSessionTimeout(p => Math.min(120, p + 1))} style={{ padding: "3px 7px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", borderBottom: "1px solid #E2E6F0" }}><Ico.ChevUp /></button>
                <button onClick={() => setSessionTimeout(p => Math.max(1, p - 1))}  style={{ padding: "3px 7px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}><Ico.ChevDown /></button>
              </div>
            </div>
          </div>
          <button onClick={() => showToast("Default message saved!", GREEN)}
            style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: BLUE, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            SAVE DEFAULT MESSAGE
          </button>
        </Card>
      </div>

      {/* Google Drive Sync */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 14, flexDirection: isMobile ? "column" : "row", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#4B6EF5,#22C55E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Ico.Cloud />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827" }}>Google Drive Sync</h2>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280", fontFamily: FONT }}>Scan Drive and import new PDF resources into the database</p>
            </div>
          </div>
          <button onClick={handleSync} disabled={syncing}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: syncing ? "#6B7280" : GREEN, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: syncing ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: syncing ? 0.8 : 1, flexShrink: 0 }}>
            <span style={{ display: "inline-block", animation: syncing ? "spin 1s linear infinite" : "none" }}><Ico.Sync /></span>
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
        </div>

        <SyncBanner result={syncResult} onClose={() => setSyncResult(null)} />

        <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#374151", fontFamily: FONT }}>Sync History</h3>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: 10, border: "1px solid #E5E7EB" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>{["Date & Time", "Synced", "Skipped", "Failed", "Triggered By", "Notes"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {logsLoading ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", padding: "24px 0" }}>Loading…</td></tr>
              ) : pageLogs.length === 0 ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", padding: "24px 0" }}>No sync history yet — run a sync to get started</td></tr>
              ) : pageLogs.map((log, idx) => (
                <tr key={log.sync_id} style={{ background: idx % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{new Date(log.synced_at).toLocaleString()}</td>
                  <td style={tdStyle}><span style={{ fontWeight: 700, color: GREEN }}>{log.files_synced}</span></td>
                  <td style={tdStyle}><span style={{ fontWeight: 700, color: ORANGE }}>{log.files_skipped}</span></td>
                  <td style={tdStyle}><span style={{ fontWeight: 700, color: log.files_failed > 0 ? RED : "#9CA3AF" }}>{log.files_failed}</span></td>
                  <td style={tdStyle}>{log.triggered_by_name || "—"}</td>
                  <td style={{ ...tdStyle, maxWidth: 160 }}>
                    <span style={{ fontSize: 11, color: "#6B7280", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.notes || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={logPage} total={syncLogs.length} perPage={PER_LOG} onChange={setLogPage} />
      </Card>

      {/* Backup & Restore */}
      <Card>
        <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111827" }}>Backup &amp; Restore</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Export", icon: <Ico.Export />, action: () => showToast("Exporting data…", BLUE)     },
            { label: "Print",  icon: <Ico.Print />,  action: () => window.print()                          },
            { label: "Import", icon: <Ico.Import />, action: () => showToast("Import coming soon", ORANGE) },
          ].map(b => (
            <button key={b.label} onClick={b.action}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, border: "1.5px solid #E2E6F0", background: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E6F0"; e.currentTarget.style.color = "#374151"; }}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </Card>

      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 16, background: "#1E293B", color: "#fff", padding: "11px 16px", borderRadius: 12, fontFamily: FONT, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.18)", zIndex: 2000, borderLeft: `4px solid ${toast.color}`, animation: "fadeUp .3s ease", maxWidth: "calc(100vw - 32px)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}