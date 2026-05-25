import { useState, useRef, useEffect } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = "#4B6EF5";
const GREEN  = "#22C55E";
const ORANGE = "#E85D04";
const RED    = "#EF4444";
const FONT   = "'Sora', 'Segoe UI', sans-serif";

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const Ico = {
  Settings: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Restart:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  ChevDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Burn:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  Use:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Unblock:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Reset:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg>,
  Export:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Print:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Import:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Plus:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ChevUp:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>,
  ChevLeft: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight:() => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, size = "md" }) {
  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 20 : 24;
  const r = size === "sm" ? 8  : 10;
  return (
    <div onClick={() => onChange(!checked)} style={{ width: w, height: h, borderRadius: h, background: checked ? GREEN : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: checked ? w - h + 2 : 2, width: h - 4, height: h - 4, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left .2s" }} />
    </div>
  );
}

// ─── Reusable card wrapper ────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #E8EBF4", ...style }}>
      {children}
    </div>
  );
}

// ─── Styled input ─────────────────────────────────────────────────────────────
function Input({ placeholder, value, onChange, type = "text", style = {} }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E6F0", fontFamily: FONT, fontSize: 13, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box", ...style }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = "#E2E6F0"}
    />
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    active:      { bg: GREEN,   color: "#fff",    label: "active"     },
    "not active":{ bg: "#E5E7EB",color:"#374151", label: "Not active" },
    blocked:     { bg: "#FEE2E2",color:"#7F1D1D", label: "Blocked"    },
  };
  const s = map[status] || map["not active"];
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:99, background:s.bg, color:s.color, fontSize:11, fontWeight:700, fontFamily:FONT, whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

// ─── Small icon button ────────────────────────────────────────────────────────
function IBtn({ children, onClick, title, hoverColor = RED, bgKey = "del" }) {
  const [h,setH] = useState(false);
  const bgs = { del:"#FEF2F2", edit:"#EFF6FF" };
  const cols= { del: RED,     edit: BLUE      };
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background: h ? (bgKey==="del"?"#FEE2E2":"#DBEAFE") : bgs[bgKey], border:"none", borderRadius:6, padding:"5px 6px", cursor:"pointer", color:cols[bgKey], display:"flex", transition:"background .15s" }}>
      {children}
    </button>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12, flexWrap:"wrap", gap:6 }}>
      <span style={{ fontSize:12, color:"#6B7280", fontFamily:FONT }}>
        Showing <b>{from}–{to}</b> of {total} {total===1?"item":"items"}
      </span>
      <div style={{ display:"flex", gap:4 }}>
        <button disabled={page===1} onClick={()=>onChange(page-1)}
          style={{ width:28,height:28,borderRadius:7,border:"1px solid #E2E6F0",background:"#fff",cursor:page===1?"default":"pointer",color:page===1?"#D1D5DB":"#374151",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Ico.ChevLeft/>
        </button>
        {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
          <button key={p} onClick={()=>onChange(p)} style={{ width:28,height:28,borderRadius:7,border:page===p?"none":"1px solid #E2E6F0",background:page===p?BLUE:"#fff",color:page===p?"#fff":"#374151",fontFamily:FONT,fontSize:12,fontWeight:page===p?700:500,cursor:"pointer" }}>
            {p}
          </button>
        ))}
        <button disabled={page===totalPages} onClick={()=>onChange(page+1)}
          style={{ width:28,height:28,borderRadius:7,border:"1px solid #E2E6F0",background:"#fff",cursor:page===totalPages?"default":"pointer",color:page===totalPages?"#D1D5DB":"#374151",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Ico.ChevRight/>
        </button>
      </div>
    </div>
  );
}

// ─── Initial data ─────────────────────────────────────────────────────────────
const INIT_KEYS = [
  { id:1, status:"active",     llm:"Groq",      key:"2344hgh45",     tokens:"8 5000",  date:"12/3/2026" },
  { id:2, status:"not active", llm:"Chart Gpt", key:"7fg84hfh484n",  tokens:"000",     date:"2/4/202"   },
  { id:3, status:"not active", llm:"Gemina",    key:"958tthb 49r4",  tokens:"40 000",  date:"5/5/2026"  },
  { id:4, status:"not active", llm:"claude",    key:"9if40er khr040", tokens:"300",    date:"4/8/2024"  },
];

const INIT_ROLES = [
  { id:1, role:"User Role",  roleType:"Roles" },
  { id:2, role:"User roles", roleType:"Roles" },
  { id:3, role:"User roles", roleType:"Roles" },
];

// ─── Main Settings Component ──────────────────────────────────────────────────
export default function Settings({ isMobile = false }) {
  // ── Global ─────────────────────────────────────────────────────────────────
  const [botOn, setBotOn]         = useState(true);
  const [twoFA, setTwoFA]         = useState(true);
  const [twoFASec, setTwoFASec]   = useState(true);
  const [toast, setToast]         = useState(null);

  // ── API Keys ────────────────────────────────────────────────────────────────
  const [keys, setKeys]           = useState(INIT_KEYS);
  const [selKeys, setSelKeys]     = useState([]);
  const [newKey, setNewKey]       = useState({ key:"", llm:"", tokens:"" });
  const [keyPage, setKeyPage]     = useState(1);
  const PER_KEY = 10;

  // ── User Roles ──────────────────────────────────────────────────────────────
  const [roles, setRoles]         = useState(INIT_ROLES);
  const [editRoleId, setEditRoleId]= useState(null);
  const [editRoleVal, setEditRoleVal] = useState("");
  const [rolePage, setRolePage]   = useState(1);
  const PER_ROLE = 10;

  // ── Bot Behavior ────────────────────────────────────────────────────────────
  const [defaultReply, setDefaultReply] = useState("sorry i didnt understand");
  const [sessionTimeout, setSessionTimeout] = useState(15);

  const showToast = (msg, color=BLUE) => { setToast({msg,color}); setTimeout(()=>setToast(null),2600); };

  // ── API key helpers ─────────────────────────────────────────────────────────
  const toggleKey = id => setSelKeys(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const toggleAllKeys = () => setSelKeys(p => p.length===keys.length ? [] : keys.map(k=>k.id));
  const deleteKey = id => { setKeys(p=>p.filter(k=>k.id!==id)); setSelKeys(p=>p.filter(x=>x!==id)); showToast("API key deleted",RED); };
  const addKey = () => {
    if (!newKey.key || !newKey.llm) return;
    setKeys(p=>[...p,{ id:Date.now(), status:"not active", llm:newKey.llm, key:newKey.key, tokens:newKey.tokens||"0", date:new Date().toLocaleDateString() }]);
    setNewKey({key:"",llm:"",tokens:""});
    showToast("API key added", GREEN);
  };

  // ── Role helpers ────────────────────────────────────────────────────────────
  const startEditRole = r => { setEditRoleId(r.id); setEditRoleVal(r.role); };
  const saveEditRole  = () => { setRoles(p=>p.map(r=>r.id===editRoleId?{...r,role:editRoleVal}:r)); setEditRoleId(null); showToast("Role updated", BLUE); };
  const deleteRole    = id => { setRoles(p=>p.filter(r=>r.id!==id)); showToast("Role deleted", RED); };

  const pageKeys  = keys.slice((keyPage-1)*PER_KEY,  keyPage*PER_KEY);
  const pageRoles = roles.slice((rolePage-1)*PER_ROLE, rolePage*PER_ROLE);

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const thStyle = { padding:"9px 12px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:FONT, whiteSpace:"nowrap", textAlign:"left", background:"#F8FAFC", borderBottom:"1.5px solid #E5E7EB" };
  const tdStyle = { padding:"10px 12px", fontSize:12, color:"#374151", fontFamily:FONT, verticalAlign:"middle", borderBottom:"1px solid #F1F5F9" };

  return (
    <div style={{ fontFamily:FONT, background:"#EEF2F8", minHeight:"100%", width:"100%", padding: isMobile ? "12px" : "20px", boxSizing:"border-box", overflowY:"auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        * { box-sizing:border-box; }
        input[type="checkbox"] { width:15px;height:15px;accent-color:${BLUE};cursor:pointer; }
        ::-webkit-scrollbar { width:5px;height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1;border-radius:99px; }
        textarea { resize:vertical; }
        input[type="number"]::-webkit-inner-spin-button { opacity:1; }
      `}</style>

      {/* ════ PAGE HEADER ════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        {/* Title */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Ico.Settings />
          <h1 style={{ margin:0, fontSize: isMobile ? 20 : 24, fontWeight:800, color:"#111827", letterSpacing:"-0.5px" }}>Settings</h1>
        </div>
        {/* Right controls */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          {/* Restart */}
          <button onClick={()=>showToast("Bot restarting…", ORANGE)} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:10, border:"none", background:BLUE, color:"#fff", fontFamily:FONT, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:`0 2px 10px ${BLUE}55` }}
            onMouseEnter={e=>e.currentTarget.style.background="#3A5DE0"}
            onMouseLeave={e=>e.currentTarget.style.background=BLUE}>
            <Ico.Restart /> Restart
          </button>
          {/* Power toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:9, background:"#fff", borderRadius:10, padding:"8px 14px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)", border:"1px solid #E8EBF4" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#374151", fontFamily:FONT, whiteSpace:"nowrap" }}>Power off/on the bot</span>
            <Toggle checked={botOn} onChange={setBotOn} />
          </div>
        </div>
      </div>

      {/* ════ SECURITY MANAGEMENT ════════════════════════════════════════════ */}
      <Card style={{ marginBottom:16 }}>
        {/* Card header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:"#111827" }}>Security Management</h2>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#374151", fontFamily:FONT }}>Two Factor Authentication</span>
            <Toggle checked={twoFA} onChange={setTwoFA} />
          </div>
        </div>

        {/* ── API KEYS sub-section ── */}
        <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>API KEYS</div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:680 }}>
            <thead>
              <tr>
                <th style={thStyle}><input type="checkbox" checked={selKeys.length===keys.length && keys.length>0} onChange={toggleAllKeys} /></th>
                <th style={thStyle}>no</th>
                <th style={thStyle}>status</th>
                <th style={thStyle}>LLM NAME</th>
                <th style={thStyle}>API KEY</th>
                <th style={thStyle}>Total Tokens left</th>
                <th style={thStyle}>Date Issued</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageKeys.map((k, idx) => {
                const isSel = selKeys.includes(k.id);
                return (
                  <tr key={k.id} style={{ background: isSel ? "#EFF6FF" : idx%2===0?"#fff":"#FAFBFC", transition:"background .1s" }}
                    onMouseEnter={e=>{ if(!isSel) e.currentTarget.style.background="#F5F8FF"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background= isSel?"#EFF6FF":idx%2===0?"#fff":"#FAFBFC"; }}>
                    <td style={tdStyle}><input type="checkbox" checked={isSel} onChange={()=>toggleKey(k.id)} /></td>
                    <td style={{...tdStyle, color:"#9CA3AF"}}>{(keyPage-1)*PER_KEY+idx+1}</td>
                    <td style={tdStyle}><StatusPill status={k.status} /></td>
                    <td style={{...tdStyle, fontWeight:600, color:"#111827"}}>{k.llm}</td>
                    <td style={{...tdStyle, fontFamily:"monospace", fontSize:12, color:"#374151"}}>{k.key}</td>
                    <td style={tdStyle}>{k.tokens}</td>
                    <td style={{...tdStyle, whiteSpace:"nowrap"}}>{k.date}</td>
                    <td style={tdStyle}>
                      <div style={{ display:"flex", gap:5 }}>
                        <IBtn title="Delete" bgKey="del" onClick={()=>deleteKey(k.id)}><Ico.Trash /></IBtn>
                        <IBtn title="Edit"   bgKey="edit" onClick={()=>showToast(`Editing key for ${k.llm}`, BLUE)}><Ico.Edit /></IBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {keys.length===0 && (
                <tr><td colSpan={8} style={{...tdStyle, textAlign:"center", color:"#9CA3AF", padding:"28px 0"}}>No API keys added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Key pagination */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
          <span style={{ fontSize:12, color:"#6B7280", fontFamily:FONT }}>
            Showing <b>1–{Math.min(PER_KEY,keys.length)}</b> of {keys.length} API Keys
          </span>
        </div>

        {/* ── Two-column lower section ── */}
        <div style={{ display:"flex", gap:16, marginTop:20, flexWrap:"wrap" }}>

          {/* Add New API Key form */}
          <div style={{ flex:"1 1 260px" }}>
            <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:800, color:"#111827" }}>Add New API Key</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <label style={{ fontSize:13, fontWeight:500, color:"#374151", fontFamily:FONT, minWidth:120, whiteSpace:"nowrap" }}>Enter API Key</label>
                <Input placeholder="eg: Groq-Geminai-49r4" value={newKey.key} onChange={e=>setNewKey(p=>({...p,key:e.target.value}))} style={{ maxWidth:240 }} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <label style={{ fontSize:13, fontWeight:500, color:"#374151", fontFamily:FONT, minWidth:120, whiteSpace:"nowrap" }}>Enter LLM</label>
                <Input placeholder="eg: LLM" value={newKey.llm} onChange={e=>setNewKey(p=>({...p,llm:e.target.value}))} style={{ maxWidth:240 }} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <label style={{ fontSize:13, fontWeight:500, color:"#374151", fontFamily:FONT, minWidth:120, whiteSpace:"nowrap" }}>Enter Initial Tokens</label>
                <Input placeholder="eg: Initial Tokens" value={newKey.tokens} onChange={e=>setNewKey(p=>({...p,tokens:e.target.value}))} style={{ maxWidth:240 }} />
              </div>
              <button onClick={addKey} style={{ marginTop:4, width:140, padding:"10px 0", borderRadius:9, border:"none", background:BLUE, color:"#fff", fontFamily:FONT, fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:`0 2px 8px ${BLUE}44` }}
                onMouseEnter={e=>e.currentTarget.style.background="#3A5DE0"}
                onMouseLeave={e=>e.currentTarget.style.background=BLUE}>
                Add Key
              </button>
            </div>
          </div>

          {/* Floating Action Panel (shows when keys are selected) */}
          {selKeys.length > 0 && (
            <div style={{ flex:"1 1 260px", animation:"fadeUp .25s ease" }}>
              <div style={{ background:"#F8FAFC", border:"1.5px solid #E8EBF4", borderRadius:12, padding:"14px 16px" }}>
                {/* Action row */}
                <div style={{ display:"flex", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                  {[
                    { label:"Burn API",     icon:<Ico.Burn />,    color:ORANGE, action:()=>showToast("API burned",ORANGE)   },
                    { label:"Use API",      icon:<Ico.Use />,     color:BLUE,   action:()=>showToast("API in use",BLUE)     },
                    { label:"Unblock API",  icon:<Ico.Unblock />, color:GREEN,  action:()=>showToast("API unblocked",GREEN) },
                    { label:"Reset API Key",icon:<Ico.Reset />,   color:"#6B7280", action:()=>showToast("API reset") },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 12px", borderRadius:9, border:`1.5px solid ${a.color}22`, background:`${a.color}11`, color:a.color, fontFamily:FONT, fontSize:10, fontWeight:700, cursor:"pointer", minWidth:60 }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${a.color}22`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${a.color}11`}>
                      {a.icon}
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Selected keys grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {selKeys.map(id => {
                    const k = keys.find(k=>k.id===id);
                    if (!k) return null;
                    return (
                      <div key={id} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 10px", background:"#fff", borderRadius:8, border:"1.5px solid #E8EBF4" }}>
                        <div style={{ width:16, height:16, borderRadius:4, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Ico.Check />
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:"#111827", fontFamily:FONT }}>{k.llm}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Count badge */}
                <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {[false, false].map((_,i)=>(
                      <div key={i} style={{ width:16,height:16,borderRadius:4,border:"1.5px solid #E2E6F0",background:"#fff" }} />
                    ))}
                    <div style={{ padding:"4px 12px", borderRadius:8, background:BLUE, color:"#fff", fontFamily:FONT, fontSize:12, fontWeight:700 }}>
                      ({selKeys.length})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ════ LOWER ROW ══════════════════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16, marginBottom:16 }}>

        {/* ── Security & Access ── */}
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:"#111827" }}>Security &amp; Access</h2>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#374151", fontFamily:FONT }}>Two Factor Authentication</span>
              <Toggle checked={twoFASec} onChange={setTwoFASec} size="sm" />
            </div>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:360 }}>
              <thead>
                <tr>
                  {["No.","Status","User Role","Role Type","Actions"].map(h=>(
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRoles.map((r, idx) => (
                  <tr key={r.id} style={{ background:idx%2===0?"#fff":"#FAFBFC", borderBottom:"1px solid #F1F5F9", transition:"background .1s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#F5F8FF"}
                    onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?"#fff":"#FAFBFC"}>
                    <td style={{...tdStyle, color:"#9CA3AF"}}>{(rolePage-1)*PER_ROLE+idx+1}</td>
                    {/* Status dot */}
                    <td style={tdStyle}>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:"#D1FAE5", border:`2px solid ${GREEN}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </td>
                    {/* User Role — editable */}
                    <td style={tdStyle}>
                      {editRoleId === r.id
                        ? <input autoFocus value={editRoleVal} onChange={e=>setEditRoleVal(e.target.value)}
                            onBlur={saveEditRole} onKeyDown={e=>e.key==="Enter"&&saveEditRole()}
                            style={{ padding:"5px 8px", borderRadius:7, border:"1.5px solid "+BLUE, fontFamily:FONT, fontSize:12, fontWeight:700, color:"#111827", outline:"none", width:"100%" }} />
                        : <span style={{ fontWeight:700, color:"#111827", fontFamily:FONT }}>{r.role}</span>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ fontWeight:700, color:"#374151", fontFamily:FONT }}>{r.roleType}</span>
                        <Ico.ChevDown />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display:"flex", gap:5 }}>
                        <IBtn title="Edit"   bgKey="edit" onClick={()=>startEditRole(r)}><Ico.Edit /></IBtn>
                        <IBtn title="Delete" bgKey="del"  onClick={()=>deleteRole(r.id)}><Ico.Trash /></IBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {roles.length===0 && (
                  <tr><td colSpan={5} style={{...tdStyle,textAlign:"center",color:"#9CA3AF",padding:"28px 0"}}>No roles defined</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={rolePage} total={roles.length} perPage={PER_ROLE} onChange={setRolePage} />
        </Card>

        {/* ── Bot Behavior Settings ── */}
        <Card>
          <h2 style={{ margin:"0 0 18px", fontSize:17, fontWeight:800, color:"#111827" }}>Bot Behavior Settings</h2>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", fontFamily:FONT, marginBottom:6 }}>Default Reply</label>
            <textarea value={defaultReply} onChange={e=>setDefaultReply(e.target.value)} rows={4}
              style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:"1.5px solid #E2E6F0", fontFamily:FONT, fontSize:13, color:"#111827", background:"#fff", outline:"none", resize:"vertical" }}
              onFocus={e=>e.target.style.borderColor=BLUE}
              onBlur={e=>e.target.style.borderColor="#E2E6F0"}
            />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#374151", fontFamily:FONT, whiteSpace:"nowrap" }}>Session timeout</label>
            <div style={{ display:"flex", alignItems:"center", border:"1.5px solid #E2E6F0", borderRadius:8, overflow:"hidden", background:"#fff" }}>
              <input type="number" value={sessionTimeout} min={1} max={120}
                onChange={e=>setSessionTimeout(+e.target.value)}
                style={{ width:56, padding:"8px 10px", border:"none", fontFamily:FONT, fontSize:13, color:"#111827", outline:"none", textAlign:"center", background:"transparent" }} />
              <div style={{ display:"flex", flexDirection:"column", borderLeft:"1.5px solid #E2E6F0" }}>
                <button onClick={()=>setSessionTimeout(p=>Math.min(120,p+1))} style={{ padding:"3px 8px", border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", borderBottom:"1px solid #E2E6F0" }}><Ico.ChevUp /></button>
                <button onClick={()=>setSessionTimeout(p=>Math.max(1,p-1))}  style={{ padding:"3px 8px", border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center" }}><Ico.ChevDown /></button>
              </div>
            </div>
          </div>

          <button onClick={()=>showToast("Default message saved!", GREEN)} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:BLUE, color:"#fff", fontFamily:FONT, fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.04em", boxShadow:`0 2px 10px ${BLUE}44` }}
            onMouseEnter={e=>e.currentTarget.style.background="#3A5DE0"}
            onMouseLeave={e=>e.currentTarget.style.background=BLUE}>
            ADD DEFAULT MESSAGE
          </button>
        </Card>
      </div>

      {/* ════ BACKUP & RESTORE ═══════════════════════════════════════════════ */}
      <Card>
        <h2 style={{ margin:"0 0 14px", fontSize:17, fontWeight:800, color:"#111827" }}>Backup &amp; Restore</h2>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[
            { label:"Export", icon:<Ico.Export />, action:()=>showToast("Exporting data…",BLUE)   },
            { label:"Print",  icon:<Ico.Print />,  action:()=>window.print()                        },
            { label:"Import", icon:<Ico.Import />, action:()=>showToast("Import coming soon",ORANGE)},
          ].map(b => (
            <button key={b.label} onClick={b.action} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"1.5px solid #E2E6F0", background:"#fff", fontFamily:FONT, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=BLUE; e.currentTarget.style.color=BLUE; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="#E2E6F0"; e.currentTarget.style.color="#374151"; }}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background:"#1E293B", color:"#fff", padding:"11px 18px", borderRadius:12, fontFamily:FONT, fontSize:13, fontWeight:600, boxShadow:"0 8px 30px rgba(0,0,0,0.18)", zIndex:2000, borderLeft:`4px solid ${toast.color}`, animation:"fadeUp .3s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}