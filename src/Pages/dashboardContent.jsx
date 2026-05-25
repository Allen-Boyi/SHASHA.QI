import { useState, useEffect } from "react";

// ─── Design Tokens (matches adminLayout exactly) ──────────────────────────────
const C = {
  blue:    "#4f8ef7",
  blueDim: "#dbeafe",
  navy:    "#141d35",
  navyMid: "#1e2d52",
  muted:   "#7a8fb8",
  green:   "#22d3a8",
  greenDim:"#d1faf3",
  amber:   "#f59e0b",
  amberDim:"#fef3c7",
  red:     "#ef4444",
  redDim:  "#fee2e2",
  purple:  "#8b5cf6",
  purpleDim:"#ede9fe",
  bg:      "#eef2f8",
  card:    "#fff",
  border:  "#e4eaf4",
  text:    "#1e2d4f",
  sub:     "#7a8fb8",
};

// ─── Tiny inline SVG icons ────────────────────────────────────────────────────
const Icons = {
  Users:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/><path d="M19 8v6M22 11h-6" strokeLinecap="round"/></svg>,
  Chat:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Messages: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Resource: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  TrendUp:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  TrendDn:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></svg>,
  Dot:      ({ c }) => <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block", flexShrink:0 }}/>,
  Bot:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="7" r="4"/><path d="M12 3v4M8 14h.01M16 14h.01M9 18h6" strokeLinecap="round"/></svg>,
  Alert:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
  Clock:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Zap:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>,
};

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color, fill }) {
  const W = 80, H = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 4) - 2,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      {fill && <path d={area} fill={color} opacity=".12"/>}
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBar({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:36 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1, borderRadius:"3px 3px 0 0",
          background: i === data.length - 1 ? color : `${color}55`,
          height: `${(v / max) * 100}%`,
          minHeight:4, transition:"height .3s ease",
        }}/>
      ))}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }) {
  const R = 36, cx = 44, cy = 44, stroke = 10;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={stroke}/>
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ / 100 + circ / 4}
            strokeLinecap="butt"
          />
        );
        offset += seg.pct;
        return el;
      })}
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, trendUp, icon: Icon, accent, spark }) {
  return (
    <div style={{
      background: C.card, borderRadius:14, border:`1px solid ${C.border}`,
      padding:"18px 20px", display:"flex", flexDirection:"column", gap:12,
      boxShadow:"0 1px 4px rgba(30,45,80,.06)", minWidth:0, flex:1,
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1, minWidth:0 }}>
          <span style={{ fontSize:11, fontWeight:600, color:C.sub, textTransform:"uppercase", letterSpacing:".7px" }}>{label}</span>
          <span style={{ fontFamily:"Syne, sans-serif", fontSize:26, fontWeight:800, color:C.navy, lineHeight:1 }}>{value}</span>
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:`${accent}18`, display:"flex", alignItems:"center", justifyContent:"center", color:accent, flexShrink:0 }}>
          <Icon/>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:700, color: trendUp ? C.green : C.red }}>
            {trendUp ? <Icons.TrendUp/> : <Icons.TrendDn/>}{trend}
          </span>
          <span style={{ fontSize:11, color:C.sub }}>{sub}</span>
        </div>
        {spark && <Sparkline data={spark} color={accent} fill/>}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <span style={{ fontFamily:"Syne, sans-serif", fontSize:14, fontWeight:800, color:C.navy }}>{title}</span>
      {action && <button style={{ fontSize:11, color:C.blue, fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0 }}>{action}</button>}
    </div>
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background:C.card, borderRadius:14, border:`1px solid ${C.border}`,
      padding:"20px", boxShadow:"0 1px 4px rgba(30,45,80,.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ name, phone, msg, time, status }) {
  const statusMap = {
    active:  { color: C.green,  label: "Active"   },
    waiting: { color: C.amber,  label: "Waiting"  },
    closed:  { color: C.muted,  label: "Closed"   },
  };
  const s = statusMap[status] || statusMap.closed;
  const initial = name.charAt(0).toUpperCase();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},#6c63ff)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
        {initial}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{name}</span>
          <span style={{ fontSize:11, color:C.sub }}>{phone}</span>
        </div>
        <span style={{ fontSize:12, color:C.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{msg}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:s.color }}>
          <Icons.Dot c={s.color}/>{s.label}
        </span>
        <span style={{ fontSize:10, color:C.sub, display:"flex", alignItems:"center", gap:3 }}><Icons.Clock/>{time}</span>
      </div>
    </div>
  );
}

// ─── Alert Row ────────────────────────────────────────────────────────────────
function AlertRow({ text, level, time }) {
  const lvl = { warn: { bg: C.amberDim, color: C.amber }, info: { bg: C.blueDim, color: C.blue }, ok: { bg: C.greenDim, color: C.green }, error: { bg: C.redDim, color: C.red } };
  const s = lvl[level] || lvl.info;
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:10, background:s.bg, marginBottom:8 }}>
      <span style={{ color:s.color, marginTop:1, flexShrink:0 }}><Icons.Alert/></span>
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ fontSize:12, fontWeight:500, color:C.text }}>{text}</span>
        <div style={{ fontSize:10, color:C.sub, marginTop:2, display:"flex", alignItems:"center", gap:4 }}><Icons.Clock/>{time}</div>
      </div>
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QABtn({ icon:Icon, label, color }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:8,
        padding:"16px 12px", border:`1.5px solid ${hover ? color : C.border}`,
        borderRadius:12, background: hover ? `${color}0d` : C.card,
        cursor:"pointer", fontFamily:"inherit", transition:"all .18s ease",
        flex:1, minWidth:0,
      }}>
      <span style={{ color, display:"flex" }}><Icon/></span>
      <span style={{ fontSize:11, fontWeight:600, color: hover ? color : C.sub, textAlign:"center", lineHeight:1.3 }}>{label}</span>
    </button>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(start);
    }, 25);
    return () => clearInterval(t);
  }, [to]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

// ─── Weekly chart (horizontal bar) ───────────────────────────────────────────
function WeeklyBar({ day, val, max, color }) {
  const pct = (val / max) * 100;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
      <span style={{ width:28, fontSize:11, color:C.sub, fontWeight:600, flexShrink:0 }}>{day}</span>
      <div style={{ flex:1, height:8, background:C.border, borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color},${color}99)`, borderRadius:99, transition:"width .6s ease" }}/>
      </div>
      <span style={{ width:32, fontSize:11, color:C.text, fontWeight:600, textAlign:"right", flexShrink:0 }}>{val}</span>
    </div>
  );
}

// ─── DashboardContent ─────────────────────────────────────────────────────────
export default function DashboardContent({ isMobile, isTablet }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const stats = [
    { label:"Bot Users",        value: <Counter to={1284}/>, sub:"vs last month", trend:"+12%", trendUp:true,  icon:Icons.Users,    accent:C.blue,   spark:[40,55,45,60,52,70,68,82] },
    { label:"Active Sessions",  value: <Counter to={47}/>,   sub:"right now",     trend:"+8%",  trendUp:true,  icon:Icons.Chat,     accent:C.green,  spark:[20,18,30,25,40,38,45,47] },
    { label:"Messages Today",   value: <Counter to={3290}/>, sub:"vs yesterday",  trend:"-3%",  trendUp:false, icon:Icons.Messages, accent:C.purple, spark:[500,420,480,510,390,440,400,380] },
    { label:"Resources",        value: <Counter to={86}/>,   sub:"total uploaded",trend:"+5%",  trendUp:true,  icon:Icons.Resource, accent:C.amber,  spark:[60,65,68,72,75,78,82,86] },
  ];

  const conversations = [
    { name:"Karim B.",    phone:"+213 555 0101", msg:"Asking about product availability",       time:"2m ago",  status:"active"  },
    { name:"Sara M.",     phone:"+213 555 0182", msg:"Requested invoice for last order",        time:"7m ago",  status:"waiting" },
    { name:"Youcef A.",   phone:"+213 555 0234", msg:"Bot couldn't understand voice note",      time:"15m ago", status:"waiting" },
    { name:"Nadia L.",    phone:"+213 555 0319", msg:"Conversation ended after FAQ resolution", time:"22m ago", status:"closed"  },
    { name:"Omar T.",     phone:"+213 555 0447", msg:"Booking confirmed via WhatsApp flow",     time:"31m ago", status:"closed"  },
  ];

  const alerts = [
    { text:"API response latency above 800ms — check webhook health",    level:"warn",  time:"5 min ago"  },
    { text:"New admin user 'support_team' added to dashboard",           level:"info",  time:"1 hr ago"   },
    { text:"Flow 'Onboarding v2' published successfully",                level:"ok",    time:"3 hrs ago"  },
    { text:"Resource 'pricing_2025.pdf' failed to process",              level:"error", time:"5 hrs ago"  },
  ];

  const weeklyMsgs = [
    { day:"Mon", val:420 }, { day:"Tue", val:580 }, { day:"Wed", val:510 },
    { day:"Thu", val:690 }, { day:"Fri", val:750 }, { day:"Sat", val:390 }, { day:"Sun", val:310 },
  ];
  const weekMax = Math.max(...weeklyMsgs.map(d => d.val));

  const donutSegs = [
    { pct:52, color:C.blue,   label:"Resolved",  val:"52%" },
    { pct:28, color:C.amber,  label:"In-flow",   val:"28%" },
    { pct:12, color:C.green,  label:"Escalated", val:"12%" },
    { pct:8,  color:C.muted,  label:"Dropped",   val:"8%"  },
  ];

  const hourlyBar = [30,45,62,80,55,70,90,110,130,95,85,70,60,55,78,105,120,145,130,110,95,75,55,38];

  const quickActions = [
    { icon:Icons.Users,    label:"Add User",       color:C.blue   },
    { icon:Icons.Bot,      label:"New Flow",       color:C.purple },
    { icon:Icons.Resource, label:"Upload Doc",     color:C.amber  },
    { icon:Icons.Zap,      label:"Test Bot",       color:C.green  },
  ];

  // ── Layout helpers ────────────────────────────────────────────────────────
  const gap = isMobile ? 12 : 16;
  const col2 = { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap };
  const col4 = { display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)", gap };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap }}>

      {/* ── Live pulse banner ─────────────────────────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
        background:C.card, borderRadius:12, border:`1px solid ${C.border}`,
        boxShadow:"0 1px 3px rgba(30,45,80,.05)",
      }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:C.green, flexShrink:0, boxShadow:`0 0 ${pulse?"8px":"4px"} ${C.green}`, transition:"box-shadow .5s ease" }}/>
        <span style={{ fontSize:12, fontWeight:600, color:C.green }}>System Online</span>
        <span style={{ fontSize:12, color:C.sub }}>·</span>
        <span style={{ fontSize:12, color:C.sub }}>WhatsApp webhook connected</span>
        <span style={{ marginLeft:"auto", fontSize:11, color:C.sub, display:"flex", alignItems:"center", gap:4 }}>
          <Icons.Clock/>Last sync: just now
        </span>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div style={col4}>
        {stats.map((s, i) => <StatCard key={i} {...s}/>)}
      </div>

      {/* ── Row 2: Activity + Donut ───────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "2fr 1fr", gap }}>

        {/* Active Conversations */}
        <Card>
          <SectionHead title="Active Conversations" action="View All →"/>
          <div>
            {conversations.map((c, i) => <ActivityRow key={i} {...c}/>)}
          </div>
        </Card>

        {/* Conversation Outcomes Donut */}
        <Card style={{ display:"flex", flexDirection:"column" }}>
          <SectionHead title="Session Outcomes"/>
          <div style={{ display:"flex", alignItems:"center", gap:20, flex:1 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <DonutChart segments={donutSegs}/>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"Syne, sans-serif", fontSize:15, fontWeight:800, color:C.navy }}>100%</span>
                <span style={{ fontSize:9, color:C.sub, fontWeight:600 }}>TODAY</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1, minWidth:0 }}>
              {donutSegs.map((seg, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Icons.Dot c={seg.color}/>
                  <span style={{ fontSize:12, color:C.sub, flex:1 }}>{seg.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{seg.val}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 3: Weekly + Hourly + Alerts ──────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1.4fr 1fr", gap }}>

        {/* Weekly messages */}
        <Card>
          <SectionHead title="Messages This Week"/>
          {weeklyMsgs.map((d, i) => <WeeklyBar key={i} day={d.day} val={d.val} max={weekMax} color={C.blue}/>)}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            <span style={{ fontSize:11, color:C.sub }}>Total this week</span>
            <span style={{ fontSize:13, fontWeight:700, color:C.navy }}>{weeklyMsgs.reduce((a,b)=>a+b.val,0).toLocaleString()}</span>
          </div>
        </Card>

        {/* Hourly bar chart */}
        <Card>
          <SectionHead title="Messages by Hour (Today)"/>
          <div style={{ display:"flex", alignItems:"flex-end", gap:isMobile?2:3, height:80, marginBottom:8 }}>
            {hourlyBar.map((v, i) => {
              const maxV = Math.max(...hourlyBar);
              const isNow = i === 14;
              return (
                <div key={i} style={{
                  flex:1, borderRadius:"3px 3px 0 0",
                  background: isNow ? C.blue : `${C.blue}44`,
                  height:`${(v/maxV)*100}%`, minHeight:4,
                  position:"relative",
                }}>
                  {isNow && (
                    <div style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", background:C.blue, color:"#fff", borderRadius:4, fontSize:9, padding:"1px 4px", whiteSpace:"nowrap", fontWeight:700 }}>NOW</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:10, color:C.sub }}>12AM</span>
            <span style={{ fontSize:10, color:C.sub }}>12PM</span>
            <span style={{ fontSize:10, color:C.sub }}>11PM</span>
          </div>
          <div style={{ display:"flex", gap:16, marginTop:12 }}>
            <div style={{ flex:1, background:C.bg, borderRadius:10, padding:"10px 14px" }}>
              <div style={{ fontSize:10, color:C.sub, marginBottom:4 }}>Peak Hour</div>
              <div style={{ fontFamily:"Syne, sans-serif", fontSize:16, fontWeight:800, color:C.navy }}>6 PM</div>
            </div>
            <div style={{ flex:1, background:C.bg, borderRadius:10, padding:"10px 14px" }}>
              <div style={{ fontSize:10, color:C.sub, marginBottom:4 }}>Peak Volume</div>
              <div style={{ fontFamily:"Syne, sans-serif", fontSize:16, fontWeight:800, color:C.navy }}>145</div>
            </div>
          </div>
        </Card>

        {/* System Alerts */}
        <Card>
          <SectionHead title="System Alerts" action="All alerts →"/>
          {alerts.map((a, i) => <AlertRow key={i} {...a}/>)}
        </Card>
      </div>

      {/* ── Row 4: Top Flows + Quick Actions ─────────────────────────────── */}
      <div style={col2}>

        {/* Top Active Flows */}
        <Card>
          <SectionHead title="Top Active Flows"/>
          {[
            { name:"Welcome & Onboarding", sessions:284, pct:78, color:C.blue },
            { name:"Product Inquiry",      sessions:196, pct:54, color:C.purple },
            { name:"Order Tracking",       sessions:143, pct:39, color:C.green },
            { name:"FAQ & Support",        sessions: 97, pct:27, color:C.amber },
            { name:"Escalation Handler",   sessions: 38, pct:10, color:C.red },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{f.name}</span>
                <span style={{ fontSize:12, color:C.sub }}>{f.sessions} sessions</span>
              </div>
              <div style={{ height:6, background:C.border, borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:`${f.pct}%`, height:"100%", background:`linear-gradient(90deg,${f.color},${f.color}88)`, borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </Card>

        {/* Quick Actions + Bot Health */}
        <div style={{ display:"flex", flexDirection:"column", gap }}>
          <Card>
            <SectionHead title="Quick Actions"/>
            <div style={{ display:"flex", gap:10 }}>
              {quickActions.map((a, i) => <QABtn key={i} {...a}/>)}
            </div>
          </Card>

          <Card>
            <SectionHead title="Bot Health"/>
            {[
              { label:"Webhook Uptime",     val:"99.8%", ok:true  },
              { label:"Avg. Response Time", val:"420ms", ok:true  },
              { label:"API Error Rate",     val:"1.2%",  ok:false },
              { label:"Queue Depth",        val:"3 msgs",ok:true  },
            ].map((h, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i<3 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ color: h.ok ? C.green : C.amber }}>
                  {h.ok ? <Icons.Check/> : <Icons.Alert/>}
                </span>
                <span style={{ flex:1, fontSize:13, color:C.text }}>{h.label}</span>
                <span style={{ fontSize:13, fontWeight:700, color: h.ok ? C.navy : C.amber }}>{h.val}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

    </div>
  );
}