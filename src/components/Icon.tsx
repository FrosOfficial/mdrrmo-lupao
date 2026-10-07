import React, { ReactNode } from "react";

export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    alert: <><path d="M10.3 3.7 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    truck: <><path d="M10 17h4V5H2v12h3M14 9h4l4 4v4h-3" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /></>,
    box: <><path d="m21 8-9 5-9-5 9-5 9 5Z" /><path d="m3 8 9 5v9M21 8l-9 5M21 8v9l-9 5" /></>,
    scan: <><path d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4" /><path d="M8 8h8v8H8z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    radio: <><path d="M5.6 18.4a9 9 0 0 1 0-12.8M8.5 15.5a5 5 0 0 1 0-7" /><circle cx="12" cy="12" r="2" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.4 5.6a9 9 0 0 1 0 12.8" /></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 19v2h16v-2" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4 4L19 6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    cloud: <><path d="M17.5 19H6a4 4 0 0 1-.5-8 6.5 6.5 0 0 1 12.6-1.5A4.8 4.8 0 0 1 17.5 19Z" /><path d="M9 15h6M12 12v6" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    refresh: <><path d="M21.5 2v6h-6M2.5 22v-6h6" /><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  };

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  );
}
