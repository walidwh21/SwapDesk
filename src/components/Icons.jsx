import React from "react";

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const make = (path) => function Icon({ size = 20, ...rest }) {
  return <svg {...base} width={size} height={size} {...rest}>{path}</svg>;
};

export const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <defs>
      <linearGradient id="sd-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="9" fill="url(#sd-g)" />
    <path d="M9 12h12l-3-3M23 20H11l3 3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const IconSettings = make(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>);
export const IconClose = make(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
export const IconChevron = make(<path d="m6 9 6 6 6-6" />);
export const IconSwapVertical = make(<><path d="M7 4v16" /><path d="m3 16 4 4 4-4" /><path d="M17 20V4" /><path d="m13 8 4-4 4 4" /></>);
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const IconPlus = make(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const IconWallet = make(<><path d="M20 7H5a2 2 0 0 1 0-4h13v4" /><path d="M3 5v14a2 2 0 0 0 2 2h15V7" /><circle cx="16.5" cy="14" r="1" /></>);
export const IconCheck = make(<path d="m5 12 5 5L20 7" />);
export const IconArrowLeft = make(<><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>);

/** Round coloured badge used instead of remote token logos. */
export const TokenBadge = ({ token, size = 28 }) => (
  <span
    className="badge"
    style={{ width: size, height: size, background: token?.color || "#64748b", fontSize: size * 0.4 }}
  >
    {(token?.symbol || "?").slice(0, 1)}
  </span>
);
