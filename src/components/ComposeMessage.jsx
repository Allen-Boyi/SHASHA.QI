import { useState, useRef, useEffect, useMemo } from "react";
import { useUsers, CONTEXT_CONFIG } from "./useUsers";

const FONT      = "'Sora', 'Segoe UI', sans-serif";
const BLUE      = "#1a56db";
const BG_LIGHT  = "#f8f9fa";
const MAX_CHIPS = 3;

// ─── Status styles (covers both string and boolean statuses) ──────────────────
const STATUS_STYLES = {
  Active:    { bg:"#D1FAE5", color:"#065F46", border:"#6EE7B7" },
  Inactive:  { bg:"#E5E7EB", color:"#374151", border:"#9CA3AF" },
  Banned:    { bg:"#FEE2E2", color:"#7F1D1D", border:"#FCA5A5" },
  Pending:   { bg:"#DBEAFE", color:"#1E3A8A", border:"#93C5FD" },
  Suspended: { bg:"#FEF3C7", color:"#78350F", border:"#FCD34D" },
};

// ─── SVG icon map ─────────────────────────────────────────────────────────────
const SVG = {
  x:        ["M18 6 6 18","M6 6l12 12"],
  chev:     ["M6 9l6 6 6-6"],
  bold:     ["M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z","M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"],
  italic:   ["M19 4h-9","M14 20H5","M15 4 9 20"],
  under:    ["M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3","M4 21h16"],
  alignL:   ["M21 6H3","M15 12H3","M17 18H3"],
  alignC:   ["M21 6H3","M17 12H7","M19 18H5"],
  alignR:   ["M21 6H3","M21 12H9","M21 18H11"],
  alignJ:   ["M21 6H3","M21 12H3","M21 18H3"],
  listOl:   ["M10 6h11","M10 12h11","M10 18h11","M4 6h1v4","M4 10H6","M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"],
  listUl:   ["M9 6h11","M9 12h11","M9 18h11","M5 6v.01","M5 12v.01","M5 18v.01"],
  image:    ["M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7","M16 5h6","M19 2v6","M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2","M21 15l-5-5L5 21"],
  clip:     ["M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"],
  sparkle:  ["M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"],
  para:     ["M13 4v16","M17 4v16","M7 4H5a2 2 0 0 0 0 4h8"],
  mail:     ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  users:    ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  search:   ["M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"],
  check:    ["M20 6 9 17 4 12"],
  send:     ["M22 2L11 13","M22 2L15 22 11 13 2 9l20-7z"],
};

function Ico({ name, size=16, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(SVG[name]||[]).map((p,i) => <path key={i} d={p}/>)}
    </svg>
  );
}

function ToolBtn({ name, active, onClick, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:30,height:30,borderRadius:6,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:active?"#dde8fd":hov?"#f1f3f4":"transparent",color:active?BLUE:"#444",transition:"background 0.15s" }}>
      <Ico name={name} size={15}/>
    </button>
  );
}

function Avatar({ name, size=22 }) {
  const cols = ["#1a56db","#17A34A","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];
  const c = cols[(name?.charCodeAt(0) ?? 0) % cols.length];
  return (
    <span style={{ width:size,height:size,borderRadius:"50%",background:c,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:size*0.44,color:"#fff",fontWeight:700,flexShrink:0 }}>
      {(name?.[0] ?? "?").toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }) {
  // status may be boolean (dashboard) or string (botusers)
  const label = status === true ? "Active" : status === false ? "Inactive" : status;
  const s = STATUS_STYLES[label] || STATUS_STYLES.Inactive;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:99,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:10,fontWeight:600,fontFamily:FONT,whiteSpace:"nowrap" }}>
      <span style={{ width:4,height:4,borderRadius:"50%",background:s.color,flexShrink:0,display:"inline-block" }}/>
      {label}
    </span>
  );
}

function Chip({ user, config, onRemove }) {
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"#f1f3f4",borderRadius:20,padding:"3px 8px 3px 4px",fontSize:12,color:"#202124",fontFamily:FONT,border:"1px solid #e0e0e0",whiteSpace:"nowrap",flexShrink:0 }}>
      <Avatar name={user.username} size={18}/>
      {config.displayField(user)}
      <button type="button" onClick={()=>onRemove(user.id)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",color:"#5f6368",marginLeft:1 }}>
        <Ico name="x" size={11}/>
      </button>
    </span>
  );
}

// ─── Individual mode filter dropdowns — rendered based on context ──────────────
function IndividualFilters({ config, statusF, setStatusF, creditsF, setCreditsF, roleF, setRoleF, confirmedF, setConfirmedF }) {
  const filters = config.individualFilters;
  const selectStyle = { height:26,padding:"0 22px 0 8px",borderRadius:7,border:"1px solid #e2e8f0",background:"#fff",fontFamily:FONT,fontSize:11,color:"#374151",outline:"none",appearance:"none",cursor:"pointer" };
  const wrap = { position:"relative",display:"inline-flex",alignItems:"center" };
  const chevron = <span style={{ position:"absolute",right:5,pointerEvents:"none",color:"#9CA3AF",display:"flex" }}><Ico name="chev" size={10}/></span>;

  return (
    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
      {filters.includes("status") && (
        <div style={wrap}>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={selectStyle}>
            <option value="all">All Status</option>
            {config === CONTEXT_CONFIG.botusers
              ? ["Active","Inactive","Banned","Pending","Suspended"].map(s=><option key={s} value={s}>{s}</option>)
              : [["true","Active"],["false","Inactive"]].map(([v,l])=><option key={v} value={v}>{l}</option>)
            }
          </select>
          {chevron}
        </div>
      )}
      {filters.includes("credits") && (
        <div style={wrap}>
          <select value={creditsF} onChange={e=>setCreditsF(e.target.value)} style={selectStyle}>
            <option value="all">All Credits</option>
            <option value="zero">Out of Credits</option>
            <option value="low">Low Credits</option>
            <option value="high">High Credits</option>
          </select>
          {chevron}
        </div>
      )}
      {filters.includes("role") && (
        <div style={wrap}>
          <select value={roleF} onChange={e=>setRoleF(e.target.value)} style={selectStyle}>
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
          </select>
          {chevron}
        </div>
      )}
      {filters.includes("confirmed") && (
        <div style={wrap}>
          <select value={confirmedF} onChange={e=>setConfirmedF(e.target.value)} style={selectStyle}>
            <option value="all">All</option>
            <option value="true">Confirmed</option>
            <option value="false">Unconfirmed</option>
          </select>
          {chevron}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ComposeMessage({ context = "botusers", onClose }) {
  const config = CONTEXT_CONFIG[context];
  const { users: ALL_USERS, loading: usersLoading, error: usersError } = useUsers(
    config.fetchUrl, config.normalise, config.paginates
  );

  // ── Mode & recipients ──────────────────────────────────────────────────────
  const [mode, setMode]               = useState("group");
  const [activeGroup, setActiveGroup] = useState(null);
  const [selected, setSelected]       = useState([]);

  // ── Individual filters ─────────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [statusF, setStatusF]       = useState("all");
  const [creditsF, setCreditsF]     = useState("all");
  const [roleF, setRoleF]           = useState("all");
  const [confirmedF, setConfirmedF] = useState("all");
  const [showDrop, setShowDrop]     = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);

  // ── Compose fields ─────────────────────────────────────────────────────────
  const [subject, setSubject]     = useState("");
  const [bold, setBold]           = useState(false);
  const [italic, setItalic]       = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign]         = useState("left");
  const [listType, setListType]   = useState(null);
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [visible, setVisible]     = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 600);

  const editorRef   = useRef(null);
  const fileImgRef  = useRef(null);
  const fileAttRef  = useRef(null);
  const dropRef     = useRef(null);
  const overflowRef = useRef(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  useEffect(() => {
    const fn = e => {
      if (dropRef.current     && !dropRef.current.contains(e.target))     setShowDrop(false);
      if (overflowRef.current && !overflowRef.current.contains(e.target)) setShowOverflow(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Filtered list for individual mode ─────────────────────────────────────
  const filteredUsers = useMemo(() => ALL_USERS.filter(u => {
    const q      = search.toLowerCase();
    const matchQ = !q || config.searchFields.some(f => (u[f] ?? "").toLowerCase().includes(q));
    const matchS = statusF === "all"
      || (context === "botusers" ? u.status === statusF : u.status === (statusF === "true"));
    const matchC = creditsF === "all"
      || (creditsF === "zero" && u.credits === 0)
      || (creditsF === "low"  && u.credits > 0 && u.credits <= u.maxCredits * 0.3)
      || (creditsF === "high" && u.credits > u.maxCredits * 0.7);
    const matchR = roleF === "all" || u.role === roleF;
    const matchCf = confirmedF === "all" || u.is_confirmed === (confirmedF === "true");
    return matchQ && matchS && matchC && matchR && matchCf;
  }), [ALL_USERS, search, statusF, creditsF, roleF, confirmedF, context, config]);

  // ── Smart group recipients ─────────────────────────────────────────────────
  const groupUsers = useMemo(() => {
    if (!activeGroup) return [];
    const grp = config.smartGroups.find(g => g.id === activeGroup);
    return grp ? ALL_USERS.filter(grp.filter) : [];
  }, [activeGroup, ALL_USERS, config]);

  const effectiveRecipients = mode === "group" ? groupUsers : ALL_USERS.filter(u => selected.includes(u.id));
  const recipientCount      = effectiveRecipients.length;
  const activeGroupObj      = config.smartGroups.find(g => g.id === activeGroup);

  const visibleChips  = selected.slice(0, MAX_CHIPS);
  const overflowIds   = selected.slice(MAX_CHIPS);
  const overflowCount = overflowIds.length;

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selected.includes(u.id));

  const toggleUser = id => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const removeUser = id => setSelected(prev => prev.filter(x=>x!==id));
  const userById   = id => ALL_USERS.find(u => u.id === id);

  // ── Editor helpers ─────────────────────────────────────────────────────────
  const exec            = (cmd, val=null) => { editorRef.current?.focus(); document.execCommand(cmd,false,val); };
  const handleBold      = () => { exec("bold");             setBold(v=>!v); };
  const handleItalic    = () => { exec("italic");           setItalic(v=>!v); };
  const handleUnderline = () => { exec("underline");        setUnderline(v=>!v); };
  const handleAlign     = a  => { const cmds={left:"justifyLeft",center:"justifyCenter",right:"justifyRight",justify:"justifyFull"}; exec(cmds[a]); setAlign(a); };
  const handleList      = type => { if(type==="ol"){exec("insertOrderedList");setListType(l=>l==="ol"?null:"ol");}else{exec("insertUnorderedList");setListType(l=>l==="ul"?null:"ul");} };
  const handleImageUpload = e => { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>exec("insertImage",ev.target.result); r.readAsDataURL(f); e.target.value=""; };
  const handleAttachment  = e => { const f=e.target.files[0]; if(!f) return; exec("insertHTML",`📎 <a href="#" style="color:${BLUE}">${f.name}</a>&nbsp;`); e.target.value=""; };

  const handleSend = async () => {
    if (sending||sent||recipientCount===0) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    setSending(false); setSent(true);
    setTimeout(()=>onClose?.(), 1500);
  };

  const divider = <div style={{ width:1,height:20,background:"#e0e0e0",margin:"0 4px" }}/>;

  // ── Loading / error state ──────────────────────────────────────────────────
  if (usersLoading || usersError) {
    return (
      <div style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)",fontFamily:FONT }}>
        <div style={{ background:"#fff",borderRadius:16,padding:"32px 40px",textAlign:"center",fontSize:14,color:usersError?"#DC2626":"#6B7280" }}>
          {usersError ? `⚠ Failed to load users: ${usersError}` : "Loading users…"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)",fontFamily:FONT,padding:isMobile?8:16 }}>
      <input ref={fileImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
      <input ref={fileAttRef} type="file" style={{display:"none"}} onChange={handleAttachment}/>

      <div style={{ width:"95%",maxWidth:isMobile?"100%":820,background:"#fff",borderRadius:16,boxShadow:"0 12px 48px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",maxHeight:"96vh",overflow:"hidden",opacity:visible?1:0,transform:visible?"translateY(0) scale(1)":"translateY(12px) scale(0.97)",transition:"opacity 0.22s ease,transform 0.22s ease" }}>

        {/* Accent bar */}
        <div style={{ height:3,background:`linear-gradient(90deg,${BLUE},#06b6d4)`,flexShrink:0 }}/>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #e8eaed",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Ico name="mail" size={19} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:"#202124" }}>Compose a Message</div>
              <div style={{ fontSize:11,color:"#9CA3AF",marginTop:1 }}>
                IQhub.AI · {context === "botusers" ? "Bot Students" : "Dashboard Staff"} · Bulk or Individual email
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#5f6368",display:"flex",padding:4 }}>
            <Ico name="x" size={18}/>
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{ display:"flex",padding:"0 20px",borderBottom:"1px solid #e8eaed",flexShrink:0 }}>
          {[["group","🎯 Smart Groups"],["individual","👤 Individual Select"]].map(([m,lbl])=>(
            <button key={m} type="button" onClick={()=>setMode(m)}
              style={{ padding:"9px 16px",border:"none",borderBottom:`2px solid ${mode===m?BLUE:"transparent"}`,background:"transparent",fontSize:13,fontWeight:mode===m?700:500,color:mode===m?BLUE:"#6B7280",cursor:"pointer",fontFamily:FONT,transition:"all 0.15s" }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Recipients */}
        <div style={{ padding:"10px 20px",borderBottom:"1px solid #e8eaed",flexShrink:0 }}>

          {/* SMART GROUP MODE */}
          {mode==="group" && (
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8 }}>Select a Group</div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {config.smartGroups.map(grp => {
                  const count    = ALL_USERS.filter(grp.filter).length;
                  const isActive = activeGroup === grp.id;
                  return (
                    <button key={grp.id} type="button" onClick={()=>setActiveGroup(isActive?null:grp.id)} title={grp.desc}
                      style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,border:`1.5px solid ${isActive?BLUE:"#E2E6F0"}`,background:isActive?"#dde8fd":"#fff",color:isActive?BLUE:"#374151",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",fontFamily:FONT,transition:"all 0.15s",whiteSpace:"nowrap" }}>
                      <span>{grp.icon}</span>
                      {grp.label}
                      <span style={{ background:isActive?BLUE:"#F0F2F8",color:isActive?"#fff":"#6B7280",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700 }}>{count}</span>
                    </button>
                  );
                })}
              </div>
              {activeGroup && activeGroupObj && (
                <div style={{ marginTop:8,fontSize:12,color:"#6B7280",display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ color:"#17A34A",fontWeight:700 }}>✓</span>
                  <strong style={{color:BLUE}}>{recipientCount} emails</strong> will be sent
                  <span style={{color:"#9CA3AF"}}>— {activeGroupObj.desc}</span>
                </div>
              )}
            </div>
          )}

          {/* INDIVIDUAL MODE */}
          {mode==="individual" && (
            <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap" }}>
              <div style={{ position:"relative",flexShrink:0 }} ref={dropRef}>
                <button type="button" onClick={()=>setShowDrop(v=>!v)}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,background:"#f1f3f4",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:"#202124",fontFamily:FONT,whiteSpace:"nowrap" }}>
                  <Ico name="users" size={14}/>
                  Send to: <Ico name="chev" size={13}/>
                </button>

                {showDrop && (
                  <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,width:310,background:"#fff",borderRadius:12,boxShadow:"0 6px 28px rgba(0,0,0,0.16)",zIndex:300,border:"1px solid #e8eaed",overflow:"hidden" }}>
                    {/* Search + context-driven filters */}
                    <div style={{ padding:"10px 12px 6px",borderBottom:"1px solid #f1f3f4" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,background:"#f1f3f4",borderRadius:8,padding:"6px 10px",marginBottom:7 }}>
                        <Ico name="search" size={13} color="#9CA3AF"/>
                        <input autoFocus type="text" placeholder={`Search by ${config.searchFields.join(", ")}...`} value={search} onChange={e=>setSearch(e.target.value)}
                          style={{ border:"none",background:"transparent",outline:"none",fontSize:13,fontFamily:FONT,color:"#202124",width:"100%" }}/>
                      </div>
                      <IndividualFilters config={config}
                        statusF={statusF}    setStatusF={setStatusF}
                        creditsF={creditsF}  setCreditsF={setCreditsF}
                        roleF={roleF}        setRoleF={setRoleF}
                        confirmedF={confirmedF} setConfirmedF={setConfirmedF}
                      />
                    </div>

                    {/* Select all */}
                    <div onClick={()=>{ allFilteredSelected ? setSelected(prev=>prev.filter(id=>!filteredUsers.find(u=>u.id===id))) : setSelected(prev=>[...new Set([...prev,...filteredUsers.map(u=>u.id)])]); }}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 14px",cursor:"pointer",borderBottom:"1px solid #f1f3f4",background:"#FAFBFF" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f1f3f4"}
                      onMouseLeave={e=>e.currentTarget.style.background="#FAFBFF"}>
                      <span style={{ width:15,height:15,borderRadius:4,border:`2px solid ${allFilteredSelected&&filteredUsers.length>0?BLUE:"#D1D5DB"}`,background:allFilteredSelected&&filteredUsers.length>0?BLUE:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {allFilteredSelected&&filteredUsers.length>0&&<Ico name="check" size={9} color="#fff"/>}
                      </span>
                      <span style={{ fontSize:12,fontWeight:700,color:"#202124" }}>Select all ({filteredUsers.length})</span>
                    </div>

                    {/* User list */}
                    <div style={{ maxHeight:220,overflowY:"auto" }}>
                      {filteredUsers.length===0
                        ? <div style={{ padding:"12px 14px",fontSize:13,color:"#9CA3AF" }}>No users match filters</div>
                        : filteredUsers.map(u => {
                          const isSel = selected.includes(u.id);
                          return (
                            <div key={u.id} onClick={()=>toggleUser(u.id)}
                              style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 14px",cursor:"pointer",background:isSel?"#f0f4ff":"#fff",borderBottom:"1px solid #f9fafb" }}
                              onMouseEnter={e=>e.currentTarget.style.background=isSel?"#dde8fd":"#f8f9fa"}
                              onMouseLeave={e=>e.currentTarget.style.background=isSel?"#f0f4ff":"#fff"}>
                              <span style={{ width:15,height:15,borderRadius:4,border:`2px solid ${isSel?BLUE:"#D1D5DB"}`,background:isSel?BLUE:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.12s" }}>
                                {isSel&&<Ico name="check" size={9} color="#fff"/>}
                              </span>
                              <Avatar name={u.username} size={22}/>
                              <div style={{ flex:1,minWidth:0 }}>
                                <div style={{ fontSize:12,fontWeight:600,color:"#202124",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{config.displayField(u)}</div>
                                <div style={{ fontSize:10,color:"#9CA3AF" }}>{config.subField(u)}</div>
                              </div>
                              <StatusBadge status={u.status}/>
                            </div>
                          );
                        })
                      }
                    </div>

                    {/* Footer */}
                    <div style={{ padding:"7px 14px",borderTop:"1px solid #f1f3f4",background:"#FAFBFF",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <span style={{ fontSize:11,color:"#9CA3AF" }}>{selected.length} selected</span>
                      {selected.length>0&&<button type="button" onClick={()=>setSelected([])} style={{ fontSize:11,color:"#DC2626",background:"none",border:"none",cursor:"pointer",fontFamily:FONT,fontWeight:600 }}>Clear all</button>}
                    </div>
                  </div>
                )}
              </div>

              {/* Chips */}
              <div style={{ display:"flex",alignItems:"center",gap:5,flex:1,overflowX:"auto",minWidth:0 }}>
                {selected.length===0 && <span style={{ fontSize:13,color:"#9CA3AF",fontStyle:"italic",whiteSpace:"nowrap" }}>No recipients selected</span>}
                {visibleChips.map(id=>{ const u=userById(id); return u?<Chip key={id} user={u} config={config} onRemove={removeUser}/>:null; })}
                {overflowCount>0 && (
                  <div style={{ position:"relative",flexShrink:0 }} ref={overflowRef}>
                    <button type="button" onClick={()=>setShowOverflow(v=>!v)}
                      style={{ fontSize:12,color:BLUE,background:"#dde8fd",border:"none",borderRadius:20,padding:"3px 10px",cursor:"pointer",fontWeight:600,fontFamily:FONT,whiteSpace:"nowrap" }}>
                      +{overflowCount} more
                    </button>
                    {showOverflow && (
                      <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",zIndex:300,minWidth:240,border:"1px solid #e8eaed",maxHeight:200,overflowY:"auto" }}>
                        <div style={{ padding:"7px 12px 3px",fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.06em" }}>Other Recipients</div>
                        {overflowIds.map(id=>{ const u=userById(id); if(!u) return null; return (
                          <div key={id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px" }}>
                            <span style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,color:"#202124" }}>
                              <Avatar name={u.username} size={20}/>{config.displayField(u)}
                            </span>
                            <button type="button" onClick={()=>removeUser(id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#5f6368",display:"flex",padding:2 }}>
                              <Ico name="x" size={12}/>
                            </button>
                          </div>
                        );})}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="button" onClick={()=>setShowOverflow(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",color:"#5f6368",display:"flex",padding:4,marginLeft:"auto",flexShrink:0 }}>
                <Ico name="chev" size={15}/>
              </button>
            </div>
          )}
        </div>

        {/* Subject */}
        <div style={{ padding:"12px 20px",borderBottom:"1px solid #e8eaed",background:BG_LIGHT,flexShrink:0 }}>
          <label style={{ fontSize:11,color:"#80868b",fontFamily:FONT,display:"block",marginBottom:4 }}>Message Subject</label>
          <input type="text" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Enter subject..."
            style={{ width:"100%",border:"none",borderBottom:`2px solid ${BLUE}`,background:"transparent",fontSize:15,fontWeight:500,color:"#202124",fontFamily:FONT,outline:"none",paddingBottom:4,boxSizing:"border-box" }}/>
        </div>

        {/* Editor */}
        <div style={{ flex:1,overflowY:"auto",background:BG_LIGHT,minHeight:isMobile?140:180 }}>
          <div ref={editorRef} contentEditable suppressContentEditableWarning
            data-placeholder="Compose your message..."
            style={{ minHeight:isMobile?140:180,padding:"14px 20px",fontSize:14,color:"#202124",fontFamily:FONT,outline:"none",lineHeight:1.6,textAlign:align,fontWeight:bold?"bold":"normal",fontStyle:italic?"italic":"normal",textDecoration:underline?"underline":"none" }}/>
          <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9aa0a6;pointer-events:none}`}</style>
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex",alignItems:"center",gap:4,padding:"7px 14px",borderTop:"1px solid #e8eaed",flexWrap:"wrap",flexShrink:0 }}>
          <button type="button" style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:6,border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontFamily:FONT,color:"#444" }}>
            <Ico name="para" size={14}/> Paragraph <Ico name="chev" size={12}/>
          </button>
          {divider}
          <ToolBtn name="bold"   active={bold}      onClick={handleBold}      title="Bold"/>
          <ToolBtn name="italic" active={italic}    onClick={handleItalic}    title="Italic"/>
          <ToolBtn name="under"  active={underline} onClick={handleUnderline} title="Underline"/>
          {divider}
          <ToolBtn name="alignL" active={align==="left"}    onClick={()=>handleAlign("left")}    title="Align Left"/>
          <ToolBtn name="alignC" active={align==="center"}  onClick={()=>handleAlign("center")}  title="Center"/>
          <ToolBtn name="alignR" active={align==="right"}   onClick={()=>handleAlign("right")}   title="Align Right"/>
          <ToolBtn name="alignJ" active={align==="justify"} onClick={()=>handleAlign("justify")} title="Justify"/>
          {divider}
          <ToolBtn name="listOl" active={listType==="ol"} onClick={()=>handleList("ol")} title="Ordered List"/>
          <ToolBtn name="listUl" active={listType==="ul"} onClick={()=>handleList("ul")} title="Unordered List"/>
          {divider}
          <ToolBtn name="image" active={false} onClick={()=>fileImgRef.current?.click()} title="Insert Image"/>
          <ToolBtn name="clip"  active={false} onClick={()=>fileAttRef.current?.click()} title="Attach File"/>
          <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:8,background:"#dde8fd",border:`1px solid ${BLUE}30`,cursor:"pointer",fontSize:12,fontWeight:600,color:BLUE }}>
            <Ico name="sparkle" size={13} color={BLUE}/> AI Polish
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"12px 20px",borderTop:"1px solid #e8eaed",flexShrink:0 }}>
          <div style={{ fontSize:12,color:recipientCount>0?"#17A34A":"#9CA3AF",fontWeight:500 }}>
            {recipientCount>0
              ? `✓ Ready to send to ${recipientCount} recipient${recipientCount!==1?"s":""}`
              : mode==="group"?"⚠ Select a group above":"⚠ Select at least one recipient"}
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button type="button" onClick={onClose}
              style={{ padding:"9px 22px",borderRadius:8,border:`1.5px solid ${BLUE}`,background:"#fff",color:BLUE,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT }}>
              Cancel
            </button>
            <button type="button" onClick={handleSend} disabled={sending||sent||recipientCount===0}
              style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 22px",borderRadius:8,border:"none",background:sent?"#17A34A":recipientCount===0?"#b8cff8":sending?"#7aadff":BLUE,color:"#fff",fontSize:14,fontWeight:600,cursor:sending||sent||recipientCount===0?"not-allowed":"pointer",fontFamily:FONT,transition:"background 0.2s" }}>
              {sent ? <>✓ Sent!</> : sending ? "Sending..." : <><Ico name="send" size={15} color="#fff"/> Send</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}