import { useState, useEffect, useRef, useMemo } from "react";

// ─── Design Tokens (matches dashboardContent + botUsers exactly) ──────────────
const C = {
  blue:      "#4f8ef7",
  blueDim:   "#dbeafe",
  navy:      "#141d35",
  navyMid:   "#1e2d52",
  muted:     "#7a8fb8",
  green:     "#22d3a8",
  greenDim:  "#d1faf3",
  amber:     "#f59e0b",
  amberDim:  "#fef3c7",
  red:       "#ef4444",
  redDim:    "#fee2e2",
  purple:    "#8b5cf6",
  purpleDim: "#ede9fe",
  coral:     "#f97316",
  coralDim:  "#ffedd5",
  bg:        "#eef2f8",
  card:      "#fff",
  border:    "#e4eaf4",
  text:      "#1e2d4f",
  sub:       "#7a8fb8",
};
const FONT = "'Sora', 'Segoe UI', sans-serif";

// ─── Animated Counter (copied from dashboardContent) ──────────────────────────
function Counter({ to, prefix = "", suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 50);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(start);
    }, 20);
    return () => clearInterval(t);
  }, [to]);
  const display = decimals > 0 ? val.toFixed(decimals) : val.toLocaleString();
  return <>{prefix}{display}{suffix}</>;
}

// ─── Card wrapper (matches dashboardContent exactly) ─────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
      padding: "18px 20px", boxShadow: "0 1px 4px rgba(30,45,80,.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Section header (matches dashboardContent) ────────────────────────────────
function SectionHead({ title, sub, action, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: C.navy }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      {right || (action && (
        <button style={{ fontSize: 11, color: C.blue, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
          {action}
        </button>
      ))}
    </div>
  );
}

// ─── Dot helper ───────────────────────────────────────────────────────────────
const Dot = ({ c, size = 8 }) => (
  <span style={{ width: size, height: size, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0 }} />
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  TrendUp:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  TrendDn:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></svg>,
  Messages: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Users:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Clock:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Api:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>,
  Alert:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Warning:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
  Filter:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>,
  Calendar: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Export:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  CSV:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  Refresh:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  ChevDown: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,9 12,15 18,9"/></svg>,
  Spike:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>,
};

// ─── Sparkline (copied from dashboardContent) ────────────────────────────────
function Sparkline({ data, color, fill, W = 80, H = 32 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 4) - 2,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {fill && <path d={area} fill={color} opacity=".12" />}
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0].toFixed(1)} cy={pts[pts.length - 1][1].toFixed(1)} r="3" fill={color} />
    </svg>
  );
}

// ─── Bar Chart SVG (full width, labelled) ────────────────────────────────────
function BarChart({ data, color, height = 100, labels, animated = true }) {
  const [ready, setReady] = useState(!animated);
  useEffect(() => { if (animated) { const t = setTimeout(() => setReady(true), 150); return () => clearTimeout(t); } }, [animated]);
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height, position: "relative" }}>
      {data.map((d, i) => {
        const pct = (d.v / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%",
                height: ready ? `${pct}%` : "4%",
                minHeight: 4,
                borderRadius: "4px 4px 0 0",
                background: d.highlight ? color : `${color}55`,
                transition: "height .5s ease",
                position: "relative",
              }}>
                {d.highlight && (
                  <div style={{
                    position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                    background: color, color: "#fff", borderRadius: 4,
                    fontSize: 9, padding: "2px 5px", whiteSpace: "nowrap", fontWeight: 700,
                  }}>
                    {d.v}
                  </div>
                )}
              </div>
            </div>
            {labels && <span style={{ fontSize: 9, color: C.sub, whiteSpace: "nowrap" }}>{d.l}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Line Chart SVG ───────────────────────────────────────────────────────────
function LineChart({ series, W = 340, H = 120, labels }) {
  const [ready, setReady] = useState(false);
  const pathRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  const allVals = series.flatMap(s => s.data);
  const min = Math.min(...allVals), max = Math.max(...allVals);
  const range = max - min || 1;
  const padL = 28, padB = 20, padT = 10, padR = 10;
  const cW = W - padL - padR, cH = H - padB - padT;

  const toXY = (d, i, len) => [
    padL + (i / (len - 1)) * cW,
    padT + cH - ((d - min) / range) * cH,
  ];

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round(min + (i / gridLines) * range)
  );

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      {/* Grid */}
      {yTicks.map((t, i) => {
        const y = padT + cH - ((t - min) / range) * cH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={C.border} strokeWidth="0.5" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="8" fill={C.sub}>{t}</text>
          </g>
        );
      })}

      {/* X labels */}
      {labels && labels.map((l, i) => {
        const [x] = toXY(0, i, labels.length);
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="8" fill={C.sub}>{l}</text>
        );
      })}

      {/* Series */}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => toXY(v, i, s.data.length));
        const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
        const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${padT + cH} L${padL},${padT + cH} Z`;
        const totalLen = pts.reduce((acc, p, i) => {
          if (i === 0) return 0;
          const pp = pts[i - 1];
          return acc + Math.hypot(p[0] - pp[0], p[1] - pp[1]);
        }, 0);
        return (
          <g key={si}>
            <path d={areaPath} fill={s.color} opacity=".08" />
            <path
              d={linePath}
              stroke={s.color} strokeWidth="2" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={ready ? "none" : totalLen}
              strokeDashoffset={ready ? 0 : totalLen}
              style={{ transition: "stroke-dashoffset .9s ease" }}
            />
            {pts.map((p, i) => (
              <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="3" fill={s.color}
                style={{ opacity: ready ? 1 : 0, transition: `opacity .3s ease ${i * 0.05}s` }} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut Chart (copied from dashboardContent) ───────────────────────────────
function DonutChart({ segments, size = 88, stroke = 11 }) {
  const R = size / 2 - stroke;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={C.border} strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const el = (
          <circle key={i}
            cx={size / 2} cy={size / 2} r={R}
            fill="none" stroke={seg.color} strokeWidth={stroke}
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

// ─── Heatmap (Predictive Insights) ───────────────────────────────────────────
function HeatMap({ data, cols, rows }) {
  const max = Math.max(...data.flat());
  const colors = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
      {data.flat().map((v, i) => {
        const idx = Math.min(Math.floor((v / max) * (colors.length - 1)), colors.length - 1);
        return (
          <div key={i} title={`Value: ${v}`} style={{
            height: 16, borderRadius: 3,
            background: colors[idx],
            transition: "background .3s",
          }} />
        );
      })}
    </div>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ label, pct, color, sub }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 200); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</span>
        <span style={{ fontSize: 12, color: C.sub }}>{sub}</span>
      </div>
      <div style={{ height: 7, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          width: `${w}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          borderRadius: 99, transition: "width .7s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Alert Type Badge ─────────────────────────────────────────────────────────
function AlertBadge({ type }) {
  const cfg = {
    Error:       { bg: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5", dot: C.red },
    Warning:     { bg: C.amberDim, color: "#92400E", border: "#FCD34D", dot: C.amber },
    Notification:{ bg: C.blueDim, color: "#1E40AF", border: "#93C5FD", dot: C.blue },
  };
  const c = cfg[type] || cfg.Notification;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 99,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {type}
    </span>
  );
}

// ─── Toolbar Button (matches botUsers/alerts) ─────────────────────────────────
function TbBtn({ icon: IconComp, label, color, active, onClick, extraStyle = {} }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "6px 12px", borderRadius: 8,
      border: `1.5px solid ${active ? (color || C.blue) : C.border}`,
      background: active ? (color ? `${color}14` : C.blueDim) : C.card,
      color: active ? (color || C.blue) : C.text,
      fontSize: 12, fontFamily: FONT, fontWeight: 500,
      cursor: "pointer", whiteSpace: "nowrap",
      ...extraStyle,
    }}>
      {IconComp && <IconComp />}{label}
    </button>
  );
}

// ─── Stat Card (matches dashboardContent + botUsers) ──────────────────────────
function StatCard({ icon: IconComp, label, value, sub, trend, trendUp, accent, spark }) {
  return (
    <div style={{
      background: C.card, borderRadius: 12,
      padding: "15px 18px",
      boxShadow: "0 1px 6px rgba(15,23,41,0.07)",
      flex: 1, minWidth: 0,
      borderBottom: `3px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
          <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</span>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}>
          <IconComp />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: trendUp ? C.green : C.red }}>
            {trendUp ? <Icons.TrendUp /> : <Icons.TrendDn />}{trend}
          </span>
          <span style={{ fontSize: 11, color: C.sub }}>{sub}</span>
        </div>
        {spark && <Sparkline data={spark} color={accent} fill />}
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MSG_VOL = [
  { l: "Mon", v: 290 }, { l: "Tue", v: 420, highlight: false }, { l: "Wed", v: 370 },
  { l: "Thu", v: 510 }, { l: "Fri", v: 480 }, { l: "Sat", v: 340, highlight: false },
  { l: "Sun", v: 260 }, { l: "Mon", v: 390 }, { l: "Tue", v: 430 }, { l: "Wed", v: 500 },
  { l: "Thu", v: 560, highlight: true }, { l: "Fri", v: 490 },
];

const RESP_TIME = [4.2, 3.8, 5.1, 3.2, 2.9, 4.0, 6.4, 3.3, 2.7, 3.8, 4.5, 2.3];
const FORECAST  = [18, 22, 20, 25, 28, 24, 30, 35, 32, 38, 40, 44];
const ANOMALY   = [12, 14, 11, 13, 12, 10, 28, 12, 11, 13, 14, 45, 15, 12, 11];

const WEEK_LABELS = ["Aun", "Mun", "Mun", "Mun", "Mun", "Nun", "Mun"];
const RESP_LABELS = ["Aun", "Mun", "Mun", "Mun", "Mun", "Mun", "Mun"];

const ERRORS_TABLE = [
  { id: 1, type: "Error",        msg: "Tsunge failed to download physics test, it was not found.", time: "2024-05-01 10:15", count: 12 },
  { id: 2, type: "Warning",      msg: "Bot has gone offline.",                                      time: "2024-05-01 10:15", count:  8 },
  { id: 3, type: "Error",        msg: "Gennin API key failed.",                                     time: "2024-05-01 10:05", count: 21 },
  { id: 4, type: "Notification", msg: "The bot has been powered off by Allex.",                    time: "2024-05-01 02:00", count:  3 },
  { id: 5, type: "Error",        msg: "Recource not found. 404 error.",                            time: "2024-06-01 06:00", count: 17 },
  { id: 6, type: "Error",        msg: "API request failed. Timeout error.",                        time: "2024-05-01 06:00", count:  9 },
];

const ERROR_DONUT = [
  { pct: 42, color: C.red,    label: "API Errors",  val: "42%" },
  { pct: 24, color: C.amber,  label: "Resource",    val: "24%" },
  { pct: 22, color: C.blue,   label: "Offline",     val: "22%" },
  { pct: 12, color: C.green,  label: "Errors",      val: "12%" },
];

const ENGAGEMENT_SERIES = [
  { color: C.blue,   label: "Sessions",    data: [40, 55, 48, 70, 62, 80, 75, 90, 84, 100, 96, 110] },
  { color: C.coral,  label: "Messages",    data: [20, 30, 22, 45, 35, 55, 50, 62, 58, 72,  68,  80] },
];

const HEATMAP_DATA = [
  [3, 7, 12, 8, 15, 6],
  [5, 14, 22, 18, 25, 12],
  [8, 19, 31, 14, 13, 9],
  [2, 11, 16, 20, 18, 7],
  [6, 9,  13, 24, 31, 15],
];

const TOP_ERRORS = [
  { label: "API Key Failure", count: 21, pct: 68, color: C.red    },
  { label: "404 Not Found",   count: 17, pct: 55, color: C.amber  },
  { label: "Bot Offline",     count: 12, pct: 39, color: C.coral  },
  { label: "Timeout Error",   count:  9, pct: 29, color: C.purple },
  { label: "Webhook Error",   count:  5, pct: 16, color: C.blue   },
];

const DATE_RANGES = ["Last 7d", "Last 30d", "Last 90d", "Custom"];
const ALERT_TYPES = ["All Types", "Error", "Warning", "Notification"];

// ─── Main Analytics Component ─────────────────────────────────────────────────
export default function Analytics({ isMobile = false }) {
  const [pulse,      setPulse]     = useState(false);
  const [dateRange,  setDateRange] = useState("Last 7d");
  const [alertType,  setAlertType] = useState("All Types");
  const [selRows,    setSelRows]   = useState([]);
  const [bulkOpen,   setBulkOpen]  = useState(false);
  const [tab,        setTab]       = useState("volume");

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1800);
    return () => clearInterval(t);
  }, []);

  const filteredErrors = useMemo(() =>
    alertType === "All Types"
      ? ERRORS_TABLE
      : ERRORS_TABLE.filter(r => r.type === alertType),
  [alertType]);

  const toggleRow = id => setSelRows(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = e => setSelRows(e.target.checked ? filteredErrors.map(r => r.id) : []);

  const gap = isMobile ? 12 : 16;
  const col2 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap };
  const col4 = { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap };

  return (
    <div style={{
      fontFamily: FONT,
      background: C.bg,
      width: "100%",
      height: isMobile ? "auto" : "100%",
      minHeight: isMobile ? "100vh" : undefined,
      display: "flex", flexDirection: "column",
      padding: isMobile ? "12px" : "20px",
      boxSizing: "border-box",
      overflow: isMobile ? "visible" : "auto",
      gap,
    }}>

      {/* ── Live pulse banner ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", background: C.card,
        borderRadius: 12, border: `1px solid ${C.border}`,
        boxShadow: "0 1px 3px rgba(30,45,80,.05)", flexShrink: 0,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: C.green, flexShrink: 0,
          boxShadow: `0 0 ${pulse ? "10px" : "4px"} ${C.green}`,
          transition: "box-shadow .5s ease",
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Analytics Live</span>
        <span style={{ fontSize: 12, color: C.sub }}>·</span>
        <span style={{ fontSize: 12, color: C.sub }}>Real-time data · Last sync: just now</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {DATE_RANGES.map(r => (
            <button key={r} onClick={() => setDateRange(r)} style={{
              padding: "4px 10px", borderRadius: 7, fontSize: 11, fontFamily: FONT,
              border: `1px solid ${dateRange === r ? C.blue : C.border}`,
              background: dateRange === r ? C.blueDim : C.card,
              color: dateRange === r ? C.blue : C.sub,
              cursor: "pointer", fontWeight: dateRange === r ? 700 : 500,
            }}>{r}</button>
          ))}
        </span>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: C.navy, letterSpacing: "-0.4px", fontFamily: FONT }}>
          System Analytics
        </h1>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: C.sub }}>
          WhatsApp bot performance, error trends, and usage insights.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — Quick Summary Cards
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ ...col4, flexShrink: 0 }}>
        <StatCard icon={Icons.Messages} label="Total Messages Processed" value={<Counter to={12450} />}
          sub="vs last week" trend="+8%" trendUp accent={C.blue}
          spark={[7000, 8200, 7800, 9100, 8600, 10200, 11400, 12450]} />
        <StatCard icon={Icons.Users} label="Active Users" value={<Counter to={320} />}
          sub="online now" trend="+12%" trendUp accent={C.green}
          spark={[200, 220, 210, 245, 260, 280, 300, 320]} />
        <StatCard icon={Icons.Clock} label="Avg. Response Time" value={<Counter to={2.3} decimals={1} suffix=" sec" />}
          sub="vs 3.1s last week" trend="+26%" trendUp={false} accent={C.coral}
          spark={[5.2, 4.8, 4.1, 3.9, 3.4, 2.9, 2.5, 2.3]} />
        <StatCard icon={Icons.Api} label="API Success / Failure"
          value={<><span style={{ color: C.green }}><Counter to={85} suffix="%" /></span><span style={{ color: C.red, fontSize: 16 }}>/<Counter to={15} suffix="%" /></span></>}
          sub="API call health" trend="+4%" trendUp accent={C.purple}
          spark={[70, 73, 76, 78, 80, 82, 83, 85]} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Charts & Graphs (right column in image)
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap }}>

        {/* Left: Message Volume + Avg Response Time stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          <Card>
            <SectionHead title="Message Volume"
              right={
                <div style={{ display: "flex", gap: 5 }}>
                  {["volume", "response"].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: 11,
                      border: `1px solid ${tab === t ? C.blue : C.border}`,
                      background: tab === t ? C.blueDim : C.card,
                      color: tab === t ? C.blue : C.sub,
                      cursor: "pointer", fontWeight: tab === t ? 700 : 400,
                    }}>{t === "volume" ? "Volume" : "Response"}</button>
                  ))}
                </div>
              }
            />
            {tab === "volume" ? (
              <>
                <BarChart data={MSG_VOL} color={C.blue} height={110} labels />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: C.sub }}>Aun</span>
                  <span style={{ fontSize: 10, color: C.sub }}>Mun</span>
                  <span style={{ fontSize: 10, color: C.sub }}>Mun</span>
                </div>
              </>
            ) : (
              <>
                <BarChart
                  data={RESP_TIME.map((v, i) => ({ l: RESP_LABELS[i % 7], v: Math.round(v * 10) / 10, highlight: v === Math.max(...RESP_TIME) }))}
                  color={C.coral} height={110} labels
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: C.sub }}>0</span>
                  <span style={{ fontSize: 10, color: C.sub }}>6</span>
                  <span style={{ fontSize: 10, color: C.sub }}>12</span>
                </div>
              </>
            )}
          </Card>

          <Card>
            <SectionHead title="Average Response Time" sub="Seconds per message interaction" />
            <LineChart
              series={[{ color: C.blue, label: "Response Time", data: RESP_TIME.map(v => Math.round(v * 10) / 10) }]}
              labels={RESP_LABELS}
              H={110}
            />
          </Card>
        </div>

        {/* Right: Error Distribution donut + User Engagement line */}
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          <Card>
            <SectionHead title="Error Distribution" />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <DonutChart segments={ERROR_DONUT} size={96} stroke={12} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: C.navy }}>Errors</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {ERROR_DONUT.map((seg, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Dot c={seg.color} />
                    <span style={{ fontSize: 11, color: C.sub, flex: 1 }}>{seg.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{seg.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <SectionHead title="User Engagement" />
            <LineChart series={ENGAGEMENT_SERIES} H={110} labels={WEEK_LABELS} />
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {ENGAGEMENT_SERIES.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Dot c={s.color} />
                  <span style={{ fontSize: 11, color: C.sub }}>{s.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Performance Insights (error table)
      ════════════════════════════════════════════════════════════════════ */}
     
      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — Filters & Export Options
      ════════════════════════════════════════════════════════════════════ */}
     

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — Predictive Insights
      ════════════════════════════════════════════════════════════════════ */}
      <div style={col2}>
        {/* Top errors + heatmap */}
        <Card>
          <SectionHead title="Predictive Insights" sub="Top 5 Frequent Errors" />
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              {TOP_ERRORS.map((e, i) => (
                <ProgressBar key={i} label={e.label} pct={e.pct} sub={`${e.count} events`} color={e.color} />
              ))}
            </div>
            <div style={{ flexShrink: 0, width: 120 }}>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 8, fontWeight: 600 }}>Activity Heatmap</div>
              <HeatMap data={HEATMAP_DATA} cols={6} rows={5} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {[0, 12, 13, 14, 14, 31].map((v, i) => (
                  <span key={i} style={{ fontSize: 8, color: C.sub }}>{v}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* API Call Statistics */}
        <Card>
          <SectionHead title="API Call Statistics" />
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Successful Calls</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.navy }}>
                  <Counter to={1230} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>86%</span>
              </div>
            </div>
            <div style={{ flex: 1, background: C.redDim, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Failed Calls</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.navy }}>
                  <Counter to={200} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>14%</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, marginBottom: 6 }}>Success Rate Trend</div>
            <Sparkline data={[70, 74, 77, 79, 81, 83, 84, 86]} color={C.green} fill W={220} H={44} />
          </div>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — Forecast + Anomaly Detection
      ════════════════════════════════════════════════════════════════════ */}
      <div style={col2}>
        <Card>
          <SectionHead title="Next Week's Message Forecast" sub="Predicted volume based on 30-day trend" />
          <LineChart
            series={[
              { color: C.blue,  label: "Predicted",  data: FORECAST },
              { color: C.green, label: "Optimistic", data: FORECAST.map(v => Math.round(v * 1.15)) },
            ]}
            labels={["6.0Jw", "1000k", "10:00", "16:00", "16:00"]}
            H={130}
          />
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {[{ c: C.blue, l: "Predicted" }, { c: C.green, l: "Optimistic" }].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Dot c={s.c} /><span style={{ fontSize: 11, color: C.sub }}>{s.l}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHead title="Anomaly Detection"
            right={<span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.red, fontWeight: 700 }}><Icons.Spike /> 1 spike detected</span>}
          />
          <div style={{ position: "relative" }}>
            <LineChart
              series={[{
                color: C.red, label: "Traffic",
                data: ANOMALY,
              }]}
              labels={["10:00", "01:00", "01:00", "01:00"]}
              H={130}
            />
            {/* Spike label overlay */}
            <div style={{
              position: "absolute", top: 14, right: 48,
              background: C.red, color: "#fff",
              fontSize: 9, fontWeight: 700, padding: "2px 7px",
              borderRadius: 6, pointerEvents: "none",
            }}>
              Spike Detected
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <Dot c={C.red} />
            <span style={{ fontSize: 11, color: C.sub }}>Unusual traffic spike on Apr 30 at 23:40</span>
          </div>
        </Card>
      </div>

    </div>
  );
}
