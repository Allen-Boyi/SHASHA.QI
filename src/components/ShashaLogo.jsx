// filepath: src/components/ShashaLogo.jsx
import React from 'react';

const ShashaLogo = ({ width = 200, height = 200, className = '' }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <clipPath id="lc">
          <circle cx="250" cy="250" r="232" />
        </clipPath>
        <radialGradient id="bg2" cx="50%" cy="44%" r="58%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e4edf8" />
        </radialGradient>
        <linearGradient id="scrn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2237" />
          <stop offset="100%" stopColor="#071420" />
        </linearGradient>
        <linearGradient id="mong" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c4055" />
          <stop offset="100%" stopColor="#1a2d3e" />
        </linearGradient>
        <linearGradient id="deskgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0dcea" />
          <stop offset="100%" stopColor="#b8c8d8" />
        </linearGradient>
      </defs>

      {/* Background circles */}
      <circle cx="250" cy="250" r="240" fill="#dce7f3" />
      <circle cx="250" cy="250" r="232" fill="url(#bg2)" />

      <g clipPath="url(#lc)">
        {/* Desk surface */}
        <rect x="30" y="338" width="440" height="180" rx="0" fill="#e8f0f8" />
        <rect x="30" y="338" width="440" height="7" rx="0" fill="url(#deskgrad)" />

        {/* Monitor drop shadow */}
        <rect x="74" y="83" width="306" height="214" rx="15" fill="#8aa4be" opacity="0.22" />

        {/* Monitor bezel */}
        <rect x="68" y="77" width="306" height="214" rx="14" fill="url(#mong)" />
        {/* Bezel top highlight */}
        <rect x="68" y="77" width="306" height="4" rx="4" fill="#3e5c78" opacity="0.7" />
        {/* Bezel bottom edge */}
        <rect x="68" y="284" width="306" height="7" rx="3" fill="#152535" />
        {/* Webcam */}
        <circle cx="221" cy="83" r="5" fill="#0d1b28" />
        <circle cx="221" cy="83" r="2.5" fill="#1d3550" opacity="0.7" />
        {/* Power LED */}
        <circle cx="362" cy="284" r="3.5" fill="#00c853" opacity="0.85" />

        {/* Screen */}
        <rect x="80" y="89" width="282" height="188" rx="4" fill="url(#scrn)" />

        {/* Title bar */}
        <rect x="80" y="89" width="282" height="28" rx="4" fill="#0C67A0" />
        <rect x="80" y="103" width="282" height="14" fill="#0C67A0" />
        {/* Traffic light buttons */}
        <circle cx="96" cy="103" r="5.5" fill="#ff5f57" />
        <circle cx="113" cy="103" r="5.5" fill="#febc2e" />
        <circle cx="130" cy="103" r="5.5" fill="#28c840" />
        {/* URL bar */}
        <rect x="150" y="96" width="150" height="14" rx="7" fill="#0a4f80" />
        <text x="225" y="107" fontFamily="Arial,sans-serif" fontSize="9" fill="#9dc8e8" textAnchor="middle">
          shasha.ai/e-learning
        </text>

        {/* Screen content */}
        {/* Left sidebar */}
        <rect x="80" y="117" width="44" height="160" fill="#0b1e30" opacity="0.9" />
        {/* Sidebar icons */}
        <rect x="88" y="127" width="28" height="8" rx="4" fill="#0C67A0" />
        <rect x="88" y="142" width="20" height="6" rx="3" fill="#2d6080" opacity="0.7" />
        <rect x="88" y="154" width="24" height="6" rx="3" fill="#2d6080" opacity="0.7" />
        <rect x="88" y="166" width="18" height="6" rx="3" fill="#2d6080" opacity="0.7" />
        <rect x="88" y="178" width="22" height="6" rx="3" fill="#2d6080" opacity="0.7" />
        <rect x="88" y="190" width="16" height="6" rx="3" fill="#2d6080" opacity="0.7" />
        {/* Sidebar separator */}
        <line x1="124" y1="117" x2="124" y2="277" stroke="#1a3550" strokeWidth="1" />

        {/* Main screen content - Big 'e' */}
        <text
          x="134"
          y="263"
          fontFamily="Georgia,'Times New Roman',serif"
          fontSize="128"
          fontStyle="italic"
          fontWeight="bold"
          fill="#5ba3d9"
          opacity="0.88"
        >
          e
        </text>

        {/* 'learning' label on screen */}
        <text
          x="202"
          y="261"
          fontFamily="Arial,sans-serif"
          fontSize="15"
          fontStyle="italic"
          fontWeight="bold"
          fill="#7ecce8"
          opacity="0.82"
        >
          learning
        </text>

        {/* Grad cap on screen 'e' */}
        <rect x="122" y="134" width="62" height="12" rx="3" fill="#acd4f0" />
        <rect x="107" y="122" width="92" height="14" rx="3" fill="#acd4f0" transform="rotate(-3,153,129)" />
        <circle cx="153" cy="117" r="4" fill="#acd4f0" />
        <line x1="196" y1="124" x2="206" y2="148" stroke="#f9d71c" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="207" cy="151" r="4.5" fill="#f9d71c" />
        <line x1="204" y1="155" x2="200" y2="168" stroke="#f9d71c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="207" y1="155" x2="207" y2="170" stroke="#f9d71c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="210" y1="155" x2="214" y2="168" stroke="#f9d71c" strokeWidth="1.5" strokeLinecap="round" />

        {/* Progress bars (right side of screen) */}
        <text x="232" y="142" fontFamily="Arial,sans-serif" fontSize="8" fill="#4a8aaa" opacity="0.75">
          PROGRESS
        </text>
        <rect x="232" y="146" width="120" height="5" rx="2.5" fill="#0e2d48" />
        <rect x="232" y="146" width="82" height="5" rx="2.5" fill="#0C67A0" />
        <rect x="232" y="158" width="120" height="5" rx="2.5" fill="#0e2d48" />
        <rect x="232" y="158" width="55" height="5" rx="2.5" fill="#27ae60" opacity="0.8" />
        <rect x="232" y="170" width="120" height="5" rx="2.5" fill="#0e2d48" />
        <rect x="232" y="170" width="98" height="5" rx="2.5" fill="#e67e22" opacity="0.8" />
        {/* Stat cards inside screen */}
        <rect x="232" y="182" width="54" height="32" rx="4" fill="#0e2d48" />
        <text x="259" y="194" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="bold" fill="#5ba3d9" textAnchor="middle">
          142
        </text>
        <text x="259" y="207" fontFamily="Arial,sans-serif" fontSize="7" fill="#4a8aaa" textAnchor="middle">
          courses
        </text>
        <rect x="294" y="182" width="54" height="32" rx="4" fill="#0e2d48" />
        <text x="321" y="194" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="bold" fill="#28c840" textAnchor="middle">
          98%
        </text>
        <text x="321" y="207" fontFamily="Arial,sans-serif" fontSize="7" fill="#4a8aaa" textAnchor="middle">
          pass rate
        </text>
        {/* Screen subtle scanline */}
        <rect x="80" y="117" width="282" height="160" fill="url(#scrn)" opacity="0.06" />
        {/* Screen reflection */}
        <path d="M 88 93 L 148 93 L 108 135 Z" fill="white" opacity="0.035" />

        {/* Monitor stand neck */}
        <rect x="207" y="291" width="28" height="48" rx="5" fill="#1a2d3e" />
        <rect x="209" y="291" width="8" height="48" rx="3" fill="#243d52" opacity="0.6" />
        {/* Stand base */}
        <rect x="148" y="339" width="148" height="14" rx="7" fill="#1a2d3e" />
        <rect x="148" y="339" width="148" height="5" rx="4" fill="#243d52" opacity="0.6" />

        {/* Cable from stand to keyboard */}
        <path
          d="M 221 353 C 218 368, 205 372, 195 373"
          stroke="#2a3d52"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ===== KEYBOARD ===== */}
        <rect
          x="60"
          y="358"
          width="210"
          height="58"
          rx="9"
          fill="#ccd5e8"
          stroke="#1a365d"
          strokeWidth="2"
        />
        {/* Keys row 1 */}
        {[70, 87, 104, 121, 138, 155, 172, 189, 206, 223, 240].map((x) => (
          <rect key={`row1-${x}`} x={x} y="367" width="13" height="11" rx="2.5" fill="#1a365d" opacity="0.62" />
        ))}
        {/* Keys row 2 */}
        {[70, 87, 104, 121, 138, 155].map((x) => (
          <rect key={`row2-${x}`} x={x} y="382" width="13" height="11" rx="2.5" fill="#1a365d" opacity="0.62" />
        ))}
        <rect x="172" y="382" width="28" height="11" rx="2.5" fill="#1a365d" opacity="0.62" />
        {/* Spacebar */}
        <rect x="87" y="397" width="135" height="11" rx="3" fill="#1a365d" opacity="0.62" />

        {/* ===== MOUSE ===== */}
        <path
          d="M 270 382 C 283 375, 294 370, 300 368"
          stroke="#1a365d"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="308" cy="376" rx="21" ry="27" fill="#ccd5e8" stroke="#1a365d" strokeWidth="2" />
        <line x1="308" y1="350" x2="308" y2="378" stroke="#1a365d" strokeWidth="1.8" />
        <rect x="302" y="358" width="12" height="14" rx="4.5" fill="#1a365d" opacity="0.45" />

        {/* ===== PENCIL ===== */}
        <g transform="rotate(-20, 370, 265)">
          <rect x="360" y="168" width="18" height="94" rx="2" fill="#f9d71c" />
          <rect x="360" y="168" width="18" height="13" rx="2" fill="#e88c8c" />
          <line x1="360" y1="181" x2="378" y2="181" stroke="#cc6666" strokeWidth="1.2" />
          <polygon points="360,262 378,262 369,286" fill="#f0c060" />
          <polygon points="364,279 374,279 369,289" fill="#333" />
          <line x1="373" y1="178" x2="373" y2="261" stroke="rgba(255,255,255,0.38)" strokeWidth="2.5" />
        </g>

        {/* ===== BOOKS ===== */}
        {/* Book 5 teal */}
        <rect x="366" y="316" width="98" height="20" rx="3" fill="#1a9a8a" />
        <rect x="366" y="316" width="9" height="20" rx="2" fill="#0d6b60" />
        <line x1="366" y1="316" x2="464" y2="316" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        {/* Book 4 red */}
        <rect x="369" y="297" width="95" height="21" rx="3" fill="#c0392b" />
        <rect x="369" y="297" width="9" height="21" rx="2" fill="#922b21" />
        <line x1="369" y1="297" x2="464" y2="297" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        {/* Book 3 orange */}
        <rect x="367" y="278" width="96" height="21" rx="3" fill="#e67e22" />
        <rect x="367" y="278" width="9" height="21" rx="2" fill="#ca6f1e" />
        <line x1="367" y1="278" x2="463" y2="278" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        {/* Book 2 blue */}
        <rect x="370" y="259" width="94" height="21" rx="3" fill="#2c4bc8" />
        <rect x="370" y="259" width="9" height="21" rx="2" fill="#1e3499" />
        <line x1="370" y1="259" x2="464" y2="259" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        {/* Book 1 green */}
        <rect x="368" y="241" width="95" height="20" rx="3" fill="#27ae60" />
        <rect x="368" y="241" width="9" height="20" rx="2" fill="#1e8449" />

        {/* Grad cap on books */}
        <rect x="382" y="228" width="66" height="13" rx="3" fill="#1a365d" />
      </g>
    </svg>
  );
};

export default ShashaLogo;