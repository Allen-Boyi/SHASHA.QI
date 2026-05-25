import React, { useRef } from "react";

// React-17-compatible unique ID — increments once per component mount
let _uidCounter = 0;
function useUniqueId() {
  const ref = useRef(null);
  if (ref.current === null) ref.current = ++_uidCounter;
  return String(ref.current);
}

/**
 * ShashaAiLogo — Reusable SVG logo component for shasha.ai
 *
 * @param {number|string} size      - Width/height of the logo (default: 200). Accepts px numbers or CSS strings like "4rem"
 * @param {string}        className - Extra class names for external styling
 * @param {boolean}       showText  - Toggle visibility of the "shasha.ai" text (default: true)
 * @param {string}        title     - Accessible title for the SVG (default: "shasha.ai logo")
 */
const ShashaAiLogo = ({
  size = 200,
  className = "",
  showText = true,
  title = "shasha.ai e-learning logo",
}) => {
  // Unique ID per instance — prevents ID clashes when multiple logos appear on the same page
  const uid = useUniqueId();
  const gradId    = `bgGrad_${uid}`;
  const clipId    = `logoClip_${uid}`;
  const titleId   = `logoTitle_${uid}`;

  // Support both numeric (px) and string sizes (rem, %, etc.)
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      role="img"
      aria-labelledby={titleId}
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      <title id={titleId}>{title}</title>

      <defs>
        {/* Per-instance clip path */}
        <clipPath id={clipId}>
          <circle cx="250" cy="250" r="232" />
        </clipPath>

        {/* Per-instance gradient */}
        <radialGradient id={gradId} cx="50%" cy="42%" r="55%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef3fa" />
        </radialGradient>
      </defs>

      {/* ── Background ── */}
      <circle cx="250" cy="250" r="240" fill="#e8edf5" />
      <circle cx="250" cy="250" r="232" fill={`url(#${gradId})`} />

      <g clipPath={`url(#${clipId})`}>

        {/* ════════════════════════════════
            LEFT — E-LEARNING ICON
        ════════════════════════════════ */}
        <g>
          {/* Large italic 'e' */}
          <text
            x="105" y="278"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="148"
            fontStyle="italic"
            fontWeight="bold"
            fill="#1a365d"
            opacity="0.92"
          >
            e
          </text>

          {/* 'learning' label */}
          <text
            x="163" y="287"
            fontFamily="Arial, sans-serif"
            fontSize="17"
            fontStyle="italic"
            fontWeight="bold"
            fill="#1a365d"
            opacity="0.72"
          >
            learning
          </text>

          {/* Graduation cap — band */}
          <rect x="107" y="152" width="72" height="14" rx="4" fill="#1a365d" />
          {/* Graduation cap — flat top */}
          <rect
            x="88" y="138" width="110" height="16" rx="3"
            fill="#1a365d"
            transform="rotate(-4,143,146)"
          />
          {/* Cap button */}
          <circle cx="143" cy="133" r="5" fill="#1a365d" />
          {/* Tassel string */}
          <line x1="192" y1="138" x2="205" y2="168" stroke="#1a365d" strokeWidth="2.2" strokeLinecap="round" />
          {/* Tassel knot */}
          <circle cx="206" cy="171" r="5.5" fill="#c8a000" />
          {/* Tassel threads */}
          <line x1="203" y1="175" x2="199" y2="192" stroke="#c8a000" strokeWidth="2"   strokeLinecap="round" />
          <line x1="206" y1="175" x2="206" y2="194" stroke="#c8a000" strokeWidth="2"   strokeLinecap="round" />
          <line x1="209" y1="175" x2="213" y2="192" stroke="#c8a000" strokeWidth="2"   strokeLinecap="round" />

          {/* Cable: 'e' → keyboard */}
          <path
            d="M 148 292 C 145 315,130 322,125 335"
            stroke="#1a365d" strokeWidth="2.8" fill="none" strokeLinecap="round"
          />

          {/* Keyboard body */}
          <rect x="60" y="332" width="178" height="58" rx="7" fill="#ccd5e8" stroke="#1a365d" strokeWidth="2.2" />
          {/* Key row 1 */}
          {[69,88,107,126,145,164,183,202].map((x) => (
            <rect key={x} x={x} y="340" width="15" height="11" rx="2.5" fill="#1a365d" opacity="0.65" />
          ))}
          {/* Key row 2 */}
          {[69,88,107,126,145,164].map((x) => (
            <rect key={x} x={x} y="355" width="15" height="11" rx="2.5" fill="#1a365d" opacity="0.65" />
          ))}
          {/* Wide Enter-style key */}
          <rect x="183" y="355" width="31" height="11" rx="2.5" fill="#1a365d" opacity="0.65" />
          {/* Spacebar */}
          <rect x="88"  y="370" width="132" height="11" rx="2.5" fill="#1a365d" opacity="0.65" />

          {/* Cable: keyboard → mouse */}
          <path
            d="M 238 352 C 254 348,258 340,262 332"
            stroke="#1a365d" strokeWidth="2.4" fill="none" strokeLinecap="round"
          />

          {/* Mouse body */}
          <ellipse cx="268" cy="314" rx="20" ry="27" fill="#ccd5e8" stroke="#1a365d" strokeWidth="2.2" />
          <line x1="268" y1="288" x2="268" y2="315" stroke="#1a365d" strokeWidth="1.8" />
          <rect x="263" y="296" width="10" height="14" rx="4" fill="#1a365d" opacity="0.45" />
        </g>

        {/* ════════════════════════════════
            RIGHT — COLORFUL CLUSTER
        ════════════════════════════════ */}
        <g>
          {/* Pencil */}
          <g transform="rotate(-22,272,272)">
            <rect x="262" y="188" width="20" height="100" rx="2" fill="#f9d71c" />
            <rect x="262" y="188" width="20" height="14"  rx="2" fill="#e88c8c" />
            <line x1="262" y1="202" x2="282" y2="202" stroke="#cc6666" strokeWidth="1.2" />
            <polygon points="262,288 282,288 272,314" fill="#f0c060" />
            <polygon points="266,306 278,306 272,316" fill="#333" />
            <line x1="275" y1="202" x2="275" y2="286" stroke="rgba(255,255,255,0.38)" strokeWidth="3" />
          </g>

          {/* Books — bottom to top */}
          {[
            { y: 316, h: 20, body: "#1a9a8a", spine: "#0d6b60" },
            { y: 297, h: 21, body: "#c0392b", spine: "#922b21" },
            { y: 278, h: 21, body: "#e67e22", spine: "#ca6f1e" },
            { y: 259, h: 21, body: "#2c4bc8", spine: "#1e3499" },
            { y: 241, h: 20, body: "#27ae60", spine: "#1e8449" },
          ].map(({ y, h, body, spine }, i) => (
            <g key={i}>
              <rect x="275" y={y} width="108" height={h} rx="3" fill={body} />
              <rect x="275" y={y} width="9"   height={h} rx="2" fill={spine} />
              <line x1="275" y1={y} x2="383" y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            </g>
          ))}

          {/* Graduation cap on books */}
          <rect x="296" y="227" width="70"  height="13" rx="3" fill="#1a365d" />
          <rect
            x="280" y="215" width="104" height="14" rx="3"
            fill="#1a365d"
            transform="rotate(-3,332,222)"
          />
          <circle cx="332" cy="210" r="4.5" fill="#1a365d" />
          {/* Tassel */}
          <line x1="381" y1="214" x2="393" y2="240" stroke="#1a365d" strokeWidth="2" strokeLinecap="round" />
          <circle cx="394" cy="243" r="5" fill="#c8a000" />
          <line x1="391" y1="247" x2="388" y2="261" stroke="#c8a000" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="394" y1="247" x2="394" y2="263" stroke="#c8a000" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="397" y1="247" x2="400" y2="261" stroke="#c8a000" strokeWidth="1.8" strokeLinecap="round" />

          {/* Light-bulb glow rays */}
          {[
            [363,128,363,116], [391,137,400,128], [400,164,413,164],
            [391,191,400,200], [335,137,326,128], [326,164,313,164],
          ].map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f9d71c" strokeWidth="3.5" strokeLinecap="round" />
          ))}

          {/* Bulb halo */}
          <circle cx="363" cy="163" r="38" fill="#fdf3a0" opacity="0.42" />
          {/* Bulb body */}
          <path
            d="M 333 170 A 30 30 0 1 1 393 170 L 388 193 Q 385 202 376 204 L 350 204 Q 341 202 338 193 Z"
            fill="#f9d71c" stroke="#e0b800" strokeWidth="1.5"
          />
          {/* Filament */}
          <path d="M 348 183 Q 356 172 364 183" stroke="#c8a000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Base rings */}
          <rect x="349" y="203" width="28" height="7" rx="1.5" fill="#aaa" />
          <rect x="350" y="210" width="26" height="6" rx="1.5" fill="#999" />
          <rect x="351" y="216" width="24" height="5" rx="1.5" fill="#bbb" />
          {/* Shine */}
          <ellipse cx="350" cy="153" rx="7" ry="10" fill="rgba(255,255,255,0.55)" transform="rotate(-20,350,153)" />
        </g>

        {/* ════════════════════════════════
            TEXT — shasha.ai
        ════════════════════════════════ */}
        {showText && (
          <text
            x="250" y="422"
            fontFamily="'Arial Black','Arial Bold',Arial,sans-serif"
            fontSize="54"
            fontWeight="900"
            fill="#1a365d"
            textAnchor="middle"
            letterSpacing="-0.5"
          >
            shasha.ai
          </text>
        )}

      </g>

      {/* Outer border ring */}
      <circle cx="250" cy="250" r="232" fill="none" stroke="#c8d4e8" strokeWidth="3" />
    </svg>
  );
};

export default ShashaAiLogo;


/* ─────────────────────────────────────────────
   USAGE EXAMPLES
   ─────────────────────────────────────────────

   // Default — 200 px with text
   <ShashaAiLogo />

   // 80 px icon-only (no text)
   <ShashaAiLogo size={80} showText={false} />

   // Responsive via CSS string
   <ShashaAiLogo size="clamp(60px, 10vw, 180px)" />

   // Custom accessible label
   <ShashaAiLogo title="shasha.ai company logo" />

   // With Tailwind utility classes
   <ShashaAiLogo className="drop-shadow-lg hover:scale-105 transition-transform" />

   ───────────────────────────────────────────── */