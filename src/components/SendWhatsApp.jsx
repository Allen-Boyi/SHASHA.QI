import { useState, useRef, useEffect, useMemo } from "react";
import { useUsers, CONTEXT_CONFIG } from "./useUsers";

const FONT      = "'Sora', 'Segoe UI', sans-serif";
const BLUE      = "#4B6EF5";
const WA_GREEN  = "#25D366";
const WA_BG     = "#e5ddd5";
const WA_BUBBLE = "#dcf8c6";
const MAX_CHIPS = 3;

const STATUS_STYLES = {
  Active:    { bg:"#D1FAE5", color:"#065F46", border:"#6EE7B7" },
  Inactive:  { bg:"#E5E7EB", color:"#374151", border:"#9CA3AF" },
  Banned:    { bg:"#FEE2E2", color:"#7F1D1D", border:"#FCA5A5" },
  Pending:   { bg:"#DBEAFE", color:"#1E3A8A", border:"#93C5FD" },
  Suspended: { bg:"#FEF3C7", color:"#78350F", border:"#FCD34D" },
};

const TEMPLATES = [
  { id:"welcome",      name:"Welcome Message",        body:"Hello {{username}}! 👋 Welcome to IQhub.AI. Your account is now active.\n\nReply *HELP* at any time to see available commands.\n\nThank you,\nIQhub.AI",                                                        variables:["username"] },
  { id:"notification", name:"System Notification",    body:"📢 *System Alert*\n\nHello {{username}}, this is an automated notification.\n\n{{message}}\n\nIf you have questions, reply to this message.\n\n— IQhub.AI Bot",                                                  variables:["username","message"] },
  { id:"reminder",     name:"Reminder",               body:"⏰ *Reminder*\n\nHi {{username}}! Just a friendly reminder about: {{reminderText}}.\n\nPlease act before {{deadline}}.\n\nThank you,\nIQhub.AI",                                                                  variables:["username","reminderText","deadline"] },
  { id:"broadcast",    name:"Broadcast Announcement", body:"📣 *Announcement*\n\nDear {{username}},\n\n{{announcementBody}}\n\nReply *INFO* for more details.\n\n— IQhub.AI Admin",                                                                                         variables:["username","announcementBody"] },
  { id:"credits",      name:"Low Credits Warning",    body:"🪙 *Low Credits Alert*\n\nHi {{username}}, your AI credit balance is running low.\n\nCurrent balance: *{{credits}} credits*.\n\nContact your admin to top up.\n\n— IQhub.AI",                                    variables:["username","credits"] },
  { id:"custom",       name:"Custom Message",         body:"",                                                                                                                                                                                                                variables:[] },
];

const SVG = {
  x:       ["M18 6 6 18","M6 6l12 12"],
  chev:    ["M6 9l6 6 6-6"],
  bold:    ["M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z","M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"],
  italic:  ["M19 4h-9","M14 20H5","M15 4 9 20"],
  under:   ["M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3","M4 21h16"],
  sparkle: ["M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"],
  send:    ["M22 2L11 13","M22 2L15 22 11 13 2 9l20-7z"],
  wa:      ["M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"],
  img:     ["M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7","M16 5h6","M19 2v6","M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2","M21 15l-5-5L5 21"],
  file:    ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6"],
  video:   ["M23 7l-7 5 7 5V7z","M1 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1"],
  check:   ["M20 6 9 17 4 12"],
  search:  ["M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"],
  users:   ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
};

function Ico({ name, size=16, color="currentColor", fill="none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(SVG[name]||[]).map((p,i) => <path key={i} d={p}/>)}
    </svg>
  );
}

function ToolBtn({ name, active, onClick, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:30,height:30,borderRadius:6,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:active?"#EEF1FD":hov?"#F0F2F8":"transparent",color:active?BLUE:"#444",transition:"background 0.15s" }}>
      <Ico name={name} size={15}/>
    </button>
  );
}

function applyVars(tpl, vars) {
  let r = tpl;
  Object.entries(vars).forEach(([k,v]) => { r = r.replaceAll(`{{${k}}}`, v ? `*${v}*` : `[${k}]`); });
  return r;
}

function PreviewText({ text }) {
  return (
    <div>
      {text.split("\n").map((line,i) => (
        <div key={i} style={{ minHeight:line===""?10:"auto" }}>
          {line.split(/(\*[^*]+\*)/g).map((p,j) =>
            p.startsWith("*")&&p.endsWith("*") ? <strong key={j}>{p.slice(1,-1)}</strong> : <span key={j}>{p}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Avatar({ name, size=22 }) {
  const cols = ["#4B6EF5","#25D366","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];
  const c = cols[(name?.charCodeAt(0) ?? 0) % cols.length];
  return (
    <span style={{ width:size,height:size,borderRadius:"50%",background:c,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:size*0.44,color:"#fff",fontWeight:700,flexShrink:0 }}>
      {(name?.[0] ?? "?").toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }) {
  const label = status === true ? "Active" : status === false ? "Inactive" : status;
  const s = STATUS_STYLES[label] || STATUS_STYLES.Inactive;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:99,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:10,fontWeight:600,fontFamily:FONT,whiteSpace:"nowrap" }}>
      <span style={{ width:4,height:4,borderRadius:"50%",background:s.color,display:"inline-block" }}/>{label}
    </span>
  );
}

function Chip({ user, config, onRemove }) {
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"#F0F2F8",borderRadius:20,padding:"3px 8px 3px 4px",fontSize:12,color:"#202124",fontFamily:FONT,border:"1px solid #E2E6F0",whiteSpace:"nowrap",flexShrink:0 }}>
      <Avatar name={user.username} size={18}/>
      {config.displayField(user)}
      <button type="button" onClick={()=>onRemove(user.id)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",color:"#6B7280",marginLeft:1 }}>
        <Ico name="x" size={11}/>
      </button>
    </span>
  );
}

function IndividualFilters({ config, statusF, setStatusF, creditsF, setCreditsF, roleF, setRoleF, confirmedF, setConfirmedF }) {
  const filters    = config.individualFilters;
  const selectStyle = { height:26,padding:"0 22px 0 8px",borderRadius:7,border:"1px solid #E2E6F0",background:"#fff",fontFamily:FONT,fontSize:11,color:"#374151",outline:"none",appearance:"none",cursor:"pointer" };
  const wrap        = { position:"relative",display:"inline-flex",alignItems:"center" };
  const chevron     = <span style={{ position:"absolute",right:5,pointerEvents:"none",color:"#9CA3AF",display:"flex" }}><Ico name="chev" size={10}/></span>;

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
export default function SendWhatsApp({ context = "botusers", onClose }) {
  const config = CONTEXT_CONFIG[context];
  const { users: ALL_USERS, loading: usersLoading, error: usersError } = useUsers(
    config.fetchUrl, config.normalise, config.paginates
  );

  // ── Recipients ─────────────────────────────────────────────────────────────
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

  // ── Composer ───────────────────────────────────────────────────────────────
  const [selectedTplId, setSelectedTplId] = useState("");
  const [templateBody, setTemplateBody]   = useState("");
  const [varValues, setVarValues]         = useState({});
  const [currentVars, setCurrentVars]     = useState([]);
  const [bold, setBold]         = useState(false);
  const [italic, setItalic]     = useState(false);
  const [underline, setUnderline] = useState(false);
  const [showTplDrop, setShowTplDrop] = useState(false);
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [visible, setVisible]   = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  const editorRef   = useRef(null);
  const fileImgRef  = useRef(null);
  const fileDocRef  = useRef(null);
  const fileVidRef  = useRef(null);
  const dropRef     = useRef(null);
  const overflowRef = useRef(null);
  const tplRef      = useRef(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  useEffect(() => {
    const fn = e => {
      if (dropRef.current     && !dropRef.current.contains(e.target))     setShowDrop(false);
      if (overflowRef.current && !overflowRef.current.contains(e.target)) setShowOverflow(false);
      if (tplRef.current      && !tplRef.current.contains(e.target))      setShowTplDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => ALL_USERS.filter(u => {
    const q      = search.toLowerCase();
    const matchQ = !q || config.searchFields.some(f => (u[f] ?? "").toLowerCase().includes(q));
    const matchS = statusF === "all"
      || (context === "botusers" ? u.status === statusF : u.status === (statusF === "true"));
    const matchC = creditsF === "all"
      || (creditsF === "zero" && u.credits === 0)
      || (creditsF === "low"  && u.credits > 0 && u.credits <= u.maxCredits * 0.3)
      || (creditsF === "high" && u.credits > u.maxCredits * 0.7);
    const matchR  = roleF === "all" || u.role === roleF;
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
  const selectedTpl         = TEMPLATES.find(t => t.id === selectedTplId);

  const visibleChips  = selected.slice(0, MAX_CHIPS);
  const overflowIds   = selected.slice(MAX_CHIPS);
  const overflowCount = overflowIds.length;

  const toggleUser = id => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const removeUser = id => setSelected(prev => prev.filter(x=>x!==id));
  const userById   = id => ALL_USERS.find(u => u.id === id);

  const pickTemplate = tpl => {
    setSelectedTplId(tpl.id);
    setTemplateBody(tpl.body);
    setCurrentVars(tpl.variables);
    const init = {};
    tpl.variables.forEach(v => { init[v] = ""; });
    setVarValues(init);
    setShowTplDrop(false);
    if (editorRef.current) editorRef.current.innerText = tpl.body;
  };

  const previewText = applyVars(templateBody, varValues);
  const now         = new Date();
  const timeStr     = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
  const exec        = cmd => { editorRef.current?.focus(); document.execCommand(cmd,false,null); };

  const handleFileInsert = (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    if (type==="image") { const r=new FileReader(); r.onload=ev=>document.execCommand("insertImage",false,ev.target.result); r.readAsDataURL(file); }
    else exec("insertHTML", `📎 <a href="#" style="color:${BLUE}">${file.name}</a>&nbsp;`);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (sending||sent||recipientCount===0) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    setSending(false); setSent(true);
    setTimeout(()=>onClose?.(), 1500);
  };

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
      <input ref={fileImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFileInsert(e,"image")}/>
      <input ref={fileDocRef} type="file" style={{display:"none"}} onChange={e=>handleFileInsert(e,"doc")}/>
      <input ref={fileVidRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>handleFileInsert(e,"video")}/>

      <div style={{ width:"95%",maxWidth:isMobile?"100%":900,background:"#fff",borderRadius:16,boxShadow:"0 12px 48px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",maxHeight:"96vh",overflow:"hidden",opacity:visible?1:0,transform:visible?"translateY(0) scale(1)":"translateY(12px) scale(0.97)",transition:"opacity 0.22s,transform 0.22s" }}>

        {/* Accent bar */}
        <div style={{ height:3,background:`linear-gradient(90deg,${WA_GREEN},#128C7E)`,flexShrink:0 }}/>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid #E2E6F0",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:WA_GREEN,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Ico name="wa" size={20} color="#fff" fill="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:"#111827" }}>Send WhatsApp Message</div>
              <div style={{ fontSize:11,color:"#9CA3AF",marginTop:1 }}>
                IQhub.AI · {context === "botusers" ? "Bot Students" : "Dashboard Staff"} · Bulk or Individual
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#6B7280",display:"flex",padding:4 }}>
            <Ico name="x" size={18}/>
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{ display:"flex",padding:"0 20px",borderBottom:"1px solid #E2E6F0",flexShrink:0 }}>
          {[["group","🎯 Smart Groups"],["individual","👤 Individual Select"]].map(([m,lbl])=>(
            <button key={m} type="button" onClick={()=>setMode(m)}
              style={{ padding:"9px 16px",border:"none",borderBottom:`2px solid ${mode===m?WA_GREEN:"transparent"}`,background:"transparent",fontSize:13,fontWeight:mode===m?700:500,color:mode===m?WA_GREEN:"#6B7280",cursor:"pointer",fontFamily:FONT,transition:"all 0.15s" }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Recipients */}
        <div style={{ padding:"10px 20px",borderBottom:"1px solid #E2E6F0",flexShrink:0 }}>

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
                      style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,border:`1.5px solid ${isActive?WA_GREEN:"#E2E6F0"}`,background:isActive?"#E6F9EF":"#fff",color:isActive?WA_GREEN:"#374151",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",fontFamily:FONT,transition:"all 0.15s",whiteSpace:"nowrap" }}>
                      <span>{grp.icon}</span>
                      {grp.label}
                      <span style={{ background:isActive?WA_GREEN:"#F0F2F8",color:isActive?"#fff":"#6B7280",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700 }}>{count}</span>
                    </button>
                  );
                })}
              </div>
              {activeGroup && activeGroupObj && (
                <div style={{ marginTop:8,fontSize:12,color:"#6B7280",display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ color:"#17A34A",fontWeight:700 }}>✓</span>
                  <strong style={{color:WA_GREEN}}>{recipientCount} messages</strong> will be sent
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
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,background:"#F0F2F8",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:"#111827",fontFamily:FONT,whiteSpace:"nowrap" }}>
                  <Ico name="users" size={14}/>
                  Send to: <Ico name="chev" size={13}/>
                </button>

                {showDrop && (
                  <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,width:310,background:"#fff",borderRadius:12,boxShadow:"0 6px 28px rgba(0,0,0,0.16)",zIndex:300,border:"1px solid #E2E6F0",overflow:"hidden" }}>
                    {/* Search + context-driven filters */}
                    <div style={{ padding:"10px 12px 6px",borderBottom:"1px solid #F1F5F9" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,background:"#F0F2F8",borderRadius:8,padding:"6px 10px",marginBottom:7 }}>
                        <Ico name="search" size={13} color="#9CA3AF"/>
                        <input autoFocus type="text" placeholder={`Search by ${config.searchFields.join(", ")}...`} value={search} onChange={e=>setSearch(e.target.value)}
                          style={{ border:"none",background:"transparent",outline:"none",fontSize:13,fontFamily:FONT,color:"#111827",width:"100%" }}/>
                      </div>
                      <IndividualFilters config={config}
                        statusF={statusF}    setStatusF={setStatusF}
                        creditsF={creditsF}  setCreditsF={setCreditsF}
                        roleF={roleF}        setRoleF={setRoleF}
                        confirmedF={confirmedF} setConfirmedF={setConfirmedF}
                      />
                    </div>

                    {/* Select all */}
                    <div onClick={()=>{ filteredUsers.every(u=>selected.includes(u.id)) ? setSelected(prev=>prev.filter(id=>!filteredUsers.find(u=>u.id===id))) : setSelected(prev=>[...new Set([...prev,...filteredUsers.map(u=>u.id)])]); }}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:"#FAFBFF" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#F0F2F8"}
                      onMouseLeave={e=>e.currentTarget.style.background="#FAFBFF"}>
                      <span style={{ width:15,height:15,borderRadius:4,border:`2px solid ${filteredUsers.every(u=>selected.includes(u.id))&&filteredUsers.length>0?BLUE:"#D1D5DB"}`,background:filteredUsers.every(u=>selected.includes(u.id))&&filteredUsers.length>0?BLUE:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {filteredUsers.every(u=>selected.includes(u.id))&&filteredUsers.length>0&&<Ico name="check" size={9} color="#fff"/>}
                      </span>
                      <span style={{ fontSize:12,fontWeight:700,color:"#111827" }}>Select all ({filteredUsers.length})</span>
                    </div>

                    {/* User list */}
                    <div style={{ maxHeight:210,overflowY:"auto" }}>
                      {filteredUsers.length===0
                        ? <div style={{ padding:"12px 14px",fontSize:13,color:"#9CA3AF" }}>No users match filters</div>
                        : filteredUsers.map(u => {
                          const isSel = selected.includes(u.id);
                          const pct   = u.maxCredits > 0 ? Math.round(u.credits/u.maxCredits*100) : 0;
                          return (
                            <div key={u.id} onClick={()=>toggleUser(u.id)}
                              style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 14px",cursor:"pointer",background:isSel?"#F0F4FF":"#fff",borderBottom:"1px solid #F9FAFB" }}
                              onMouseEnter={e=>e.currentTarget.style.background=isSel?"#EEF1FD":"#F9FAFB"}
                              onMouseLeave={e=>e.currentTarget.style.background=isSel?"#F0F4FF":"#fff"}>
                              <span style={{ width:15,height:15,borderRadius:4,border:`2px solid ${isSel?BLUE:"#D1D5DB"}`,background:isSel?BLUE:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.12s" }}>
                                {isSel&&<Ico name="check" size={9} color="#fff"/>}
                              </span>
                              <Avatar name={u.username} size={22}/>
                              <div style={{ flex:1,minWidth:0 }}>
                                <div style={{ fontSize:12,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{config.displayField(u)}</div>
                                <div style={{ fontSize:10,color:"#9CA3AF" }}>{config.subField(u)}</div>
                              </div>
                              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2 }}>
                                <StatusBadge status={u.status}/>
                                {context === "botusers" && (
                                  <span style={{ fontSize:10,color:pct<=30?"#DC2626":pct<=70?BLUE:"#17A34A",fontWeight:600 }}>{u.credits}cr</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>

                    {/* Footer */}
                    <div style={{ padding:"7px 14px",borderTop:"1px solid #F1F5F9",background:"#FAFBFF",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
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
                      style={{ fontSize:12,color:BLUE,background:"#EEF1FD",border:"none",borderRadius:20,padding:"3px 10px",cursor:"pointer",fontWeight:600,fontFamily:FONT,whiteSpace:"nowrap" }}>
                      +{overflowCount} more
                    </button>
                    {showOverflow && (
                      <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",zIndex:300,minWidth:220,border:"1px solid #E2E6F0",maxHeight:200,overflowY:"auto" }}>
                        <div style={{ padding:"7px 12px 3px",fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em" }}>Other Recipients</div>
                        {overflowIds.map(id=>{ const u=userById(id); if(!u) return null; return (
                          <div key={id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px" }}>
                            <span style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,color:"#111827" }}>
                              <Avatar name={u.username} size={20}/>{config.displayField(u)}
                            </span>
                            <button type="button" onClick={()=>removeUser(id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6B7280",display:"flex",padding:2 }}>
                              <Ico name="x" size={12}/>
                            </button>
                          </div>
                        );})}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="button" onClick={()=>setShowOverflow(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6B7280",display:"flex",padding:4,marginLeft:"auto",flexShrink:0 }}>
                <Ico name="chev" size={15}/>
              </button>
            </div>
          )}
        </div>

        {/* Body — Composer + Preview */}
        <div style={{ display:"flex",flexDirection:isMobile?"column":"row",flex:1,overflow:"hidden" }}>

          {/* LEFT — Composer */}
          <div style={{ flex:1,display:"flex",flexDirection:"column",borderRight:isMobile?"none":"1px solid #E2E6F0",minWidth:0,overflow:"hidden" }}>

            {/* Template picker */}
            <div style={{ padding:"12px 18px 8px",borderBottom:"1px solid #F1F5F9",flexShrink:0 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6 }}>Template & Smart Composer</div>
              <div style={{ position:"relative" }} ref={tplRef}>
                <button type="button" onClick={()=>setShowTplDrop(v=>!v)}
                  style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,border:"1px solid #E2E6F0",background:"#fff",fontSize:13,color:selectedTpl?"#111827":"#9CA3AF",fontFamily:FONT,cursor:"pointer" }}>
                  {selectedTpl ? selectedTpl.name : "Select Message Template"}
                  <Ico name="chev" size={14}/>
                </button>
                {showTplDrop && (
                  <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.14)",zIndex:200,border:"1px solid #E2E6F0",overflow:"hidden" }}>
                    {TEMPLATES.map(t => (
                      <div key={t.id} onClick={()=>pickTemplate(t)}
                        style={{ padding:"9px 14px",cursor:"pointer",fontSize:13,color:"#111827",borderBottom:"1px solid #F9FAFB",fontFamily:FONT }}
                        onMouseEnter={e=>e.currentTarget.style.background="#F0F2F8"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{ fontWeight:600 }}>{t.name}</div>
                        {t.variables.length>0&&<div style={{ fontSize:11,color:"#9CA3AF",marginTop:1 }}>Variables: {t.variables.join(", ")}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Variable inputs */}
            {currentVars.length>0 && (
              <div style={{ padding:"8px 18px 6px",borderBottom:"1px solid #F1F5F9",display:"flex",flexDirection:"column",gap:7,flexShrink:0 }}>
                {currentVars.map((v,i) => (
                  <div key={v} style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:12,fontWeight:600,color:"#6B7280",minWidth:76,flexShrink:0 }}>Variable {i+1}</span>
                    <input type="text" placeholder={`[${v}]`} value={varValues[v]||""} onChange={e=>setVarValues(p=>({...p,[v]:e.target.value}))}
                      style={{ flex:1,border:"1px solid #E2E6F0",borderRadius:8,padding:"6px 10px",fontSize:13,fontFamily:FONT,outline:"none",color:"#111827" }}/>
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div style={{ display:"flex",alignItems:"center",gap:4,padding:"6px 14px",borderBottom:"1px solid #F1F5F9",flexWrap:"wrap",flexShrink:0 }}>
              <ToolBtn name="bold"   active={bold}      onClick={()=>{exec("bold");setBold(v=>!v);}}          title="Bold"/>
              <ToolBtn name="italic" active={italic}    onClick={()=>{exec("italic");setItalic(v=>!v);}}     title="Italic"/>
              <ToolBtn name="under"  active={underline} onClick={()=>{exec("underline");setUnderline(v=>!v);}} title="Underline"/>
              <div style={{ width:1,height:20,background:"#E2E6F0",margin:"0 4px" }}/>
              <ToolBtn name="img"   active={false} onClick={()=>fileImgRef.current?.click()} title="Insert Image"/>
              <ToolBtn name="file"  active={false} onClick={()=>fileDocRef.current?.click()} title="Attach Document"/>
              <ToolBtn name="video" active={false} onClick={()=>fileVidRef.current?.click()} title="Attach Video"/>
              <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:8,background:"#EEF1FD",border:`1px solid ${BLUE}30`,cursor:"pointer",fontSize:12,fontWeight:600,color:BLUE }}>
                <Ico name="sparkle" size={13} color={BLUE}/> AI Polish
              </div>
            </div>

            {/* Editor */}
            <div style={{ flex:1,overflowY:"auto",minHeight:isMobile?90:120 }}>
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                onInput={e=>setTemplateBody(e.currentTarget.innerText)}
                data-placeholder="Type your WhatsApp message here..."
                style={{ minHeight:isMobile?90:120,padding:"12px 18px",fontSize:13,color:"#111827",fontFamily:FONT,outline:"none",lineHeight:1.6,fontWeight:bold?"bold":"normal",fontStyle:italic?"italic":"normal",textDecoration:underline?"underline":"none" }}/>
              <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9CA3AF;pointer-events:none}`}</style>
            </div>

            {/* Credit row — only shown in botusers context */}
            {context === "botusers" && (
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 18px",borderTop:"1px solid #F1F5F9",background:"#FAFBFF",flexShrink:0 }}>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:"#374151" }}>Credit Awareness</div>
                  <div style={{ fontSize:11,color:"#9CA3AF" }}>
                    Est. Cost: <strong style={{color:BLUE}}>{recipientCount} AI Credit{recipientCount!==1?"s":""}</strong>
                    {recipientCount>0&&<span style={{color:"#9CA3AF"}}> · {recipientCount} recipient{recipientCount!==1?"s":""}</span>}
                  </div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  {[["img",fileImgRef],["file",fileDocRef],["video",fileVidRef]].map(([n,r])=>(
                    <button key={n} type="button" onClick={()=>r.current?.click()} style={{ width:32,height:32,borderRadius:8,border:"1px solid #E2E6F0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7280" }}>
                      <Ico name={n} size={14}/>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Preview */}
          {!isMobile && (
            <div style={{ width:265,flexShrink:0,display:"flex",flexDirection:"column" }}>
              <div style={{ padding:"10px 14px 8px",fontSize:11,fontWeight:700,color:"#374151",borderBottom:"1px solid #E2E6F0",display:"flex",alignItems:"center",justifyContent:"space-between",textTransform:"uppercase",letterSpacing:"0.06em" }}>
                <span>Real-Time Preview</span>
                {recipientCount>0&&<span style={{ fontSize:11,color:WA_GREEN,fontWeight:700,textTransform:"none",letterSpacing:"normal" }}>{recipientCount} recipient{recipientCount!==1?"s":""}</span>}
              </div>
              <div style={{ flex:1,overflowY:"auto",background:WA_BG,padding:12 }}>
                {previewText ? (
                  <div style={{ display:"flex",justifyContent:"flex-end" }}>
                    <div style={{ maxWidth:"88%",background:WA_BUBBLE,borderRadius:"12px 2px 12px 12px",padding:"8px 12px 4px",boxShadow:"0 1px 2px rgba(0,0,0,0.1)",fontSize:13,color:"#111827",fontFamily:FONT,lineHeight:1.5 }}>
                      <PreviewText text={previewText}/>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:4,fontSize:10,color:"#667781" }}>
                        {timeStr} <Ico name="check" size={14} color="#4fc3f7"/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:12,color:"#9CA3AF",textAlign:"center",padding:20 }}>
                    Select a template or type a message to preview
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"12px 20px",borderTop:"1px solid #E2E6F0",flexShrink:0 }}>
          <div style={{ fontSize:12,color:recipientCount>0?"#17A34A":"#9CA3AF",fontWeight:500 }}>
            {recipientCount>0
              ? `✓ Ready to send to ${recipientCount} user${recipientCount!==1?"s":""}`
              : mode==="group"?"⚠ Select a group above":"⚠ Select at least one recipient"}
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button type="button" onClick={onClose}
              style={{ padding:"8px 20px",borderRadius:8,border:`1.5px solid ${BLUE}`,background:"#fff",color:BLUE,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT }}>
              Cancel
            </button>
            <button type="button" onClick={handleSend} disabled={sending||sent||recipientCount===0}
              style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:8,border:"none",background:sent?"#17A34A":recipientCount===0?"#C5D5FB":sending?"#7aadff":WA_GREEN,color:"#fff",fontSize:13,fontWeight:600,cursor:sending||sent||recipientCount===0?"not-allowed":"pointer",fontFamily:FONT,transition:"background 0.2s" }}>
              {sent ? <><Ico name="check" size={15} color="#fff"/> Sent!</> : sending ? "Sending..." : <><Ico name="send" size={15} color="#fff"/> Send Message</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}