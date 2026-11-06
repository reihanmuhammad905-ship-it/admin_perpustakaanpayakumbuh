// Simple stroke-based icon set (24x24, currentColor) — consistent line style across the app.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconGrid({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </svg>
  )
}

export function IconBook({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 4.6C4 3.7 4.7 3 5.6 3H11v17H5.6C4.7 20 4 19.3 4 18.4V4.6Z" />
      <path d="M20 4.6c0-.9-.7-1.6-1.6-1.6H13v17h5.4c.9 0 1.6-.7 1.6-1.6V4.6Z" />
    </svg>
  )
}

export function IconExchange({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 8h13.5l-3.2-3.2" />
      <path d="M20 16H6.5l3.2 3.2" />
    </svg>
  )
}

export function IconUsers({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.3 19c0-3.1 2.6-5.2 5.7-5.2s5.7 2.1 5.7 5.2" />
      <circle cx="17.2" cy="9" r="2.5" />
      <path d="M15.4 14.1c2.5.3 4.2 2.2 4.2 4.6" />
    </svg>
  )
}

export function IconBarChart({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="4" y="11" width="3.6" height="9" rx="1" />
      <rect x="10.2" y="5" width="3.6" height="15" rx="1" />
      <rect x="16.4" y="8.5" width="3.6" height="11.5" rx="1" />
    </svg>
  )
}

export function IconGear({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.2v2.6M12 18.2v2.6M4.7 4.7l1.9 1.9M17.4 17.4l1.9 1.9M3.2 12h2.6M18.2 12h2.6M4.7 19.3l1.9-1.9M17.4 6.6l1.9-1.9" />
    </svg>
  )
}

export function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.3" y1="15.3" x2="20" y2="20" />
    </svg>
  )
}

export function IconBell({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 9.5a6 6 0 1 1 12 0c0 4.2 1.6 5.8 1.6 5.8H4.4S6 13.7 6 9.5Z" />
      <path d="M10.2 18.3a2 2 0 0 0 3.6 0" />
    </svg>
  )
}

export function IconPlus({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function IconUpload({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 15.5V4.5" />
      <path d="M7.5 9 12 4.5 16.5 9" />
      <path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export function IconSliders({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <line x1="4" y1="6.5" x2="20" y2="6.5" />
      <circle cx="9.5" cy="6.5" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="14.5" cy="12" r="2" />
      <line x1="4" y1="17.5" x2="20" y2="17.5" />
      <circle cx="9.5" cy="17.5" r="2" />
    </svg>
  )
}

export function IconChevronDown({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function IconMoreVertical({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconEdit({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20l.9-3.9L15.6 5.4a1.8 1.8 0 0 1 2.5 0l1.5 1.5a1.8 1.8 0 0 1 0 2.5L8.9 20.1 4 20Z" />
      <path d="M14 6.8l3.2 3.2" />
    </svg>
  )
}

export function IconEye({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M2.5 12S6 5.6 12 5.6 21.5 12 21.5 12 18 18.4 12 18.4 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4.5 6.5h15" />
      <path d="M8.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v1.5" />
      <path d="M6.5 6.5 7.3 19a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l.8-12.5" />
      <path d="M10.2 10.5v6.5M13.8 10.5v6.5" />
    </svg>
  )
}

export function IconX({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

export function IconLock({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="5" y="10.5" width="14" height="9" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function IconImagePlaceholder({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 17.5 9.5 12.5 12.5 15.5 16 12l3.5 3.5" />
    </svg>
  )
}

export function IconFileText({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 3.5h7.2L18 7.3v13.2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3" />
      <path d="M9 13h6M9 16.2h6" />
    </svg>
  )
}

export function IconDownload({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 4.5v11" />
      <path d="M7.5 11l4.5 4.5L16.5 11" />
      <path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export function IconCheckCircle({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.6 2.6L16 9.4" />
    </svg>
  )
}

export function IconClock({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  )
}

export function IconAlertTriangle({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 4.2 21 19.5H3L12 4.2Z" />
      <path d="M12 9.5v4.4" />
      <circle cx="12" cy="16.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconTrendingUp({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3.5 16.5 10 10l4 4 6.5-6.5" />
      <path d="M15 7h5.5v5.5" />
    </svg>
  )
}

export function IconArrowUp({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 15 12 8l7 7" />
      <path d="M12 9v9" />
    </svg>
  )
}

export function IconArrowDown({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="m5 9 7 7 7-7" />
      <path d="M12 15V6" />
    </svg>
  )
}

export function IconUserCircle({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10.3" r="3" />
      <path d="M5.7 18.3a6.7 6.7 0 0 1 12.6 0" />
    </svg>
  )
}

export function IconLogOut({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9 4.5H6.2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H9" />
      <path d="M14 15.7 18.2 12 14 8.3" />
      <path d="M18 12H9.5" />
    </svg>
  )
}

export function IconPrinter({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6.5 8.5V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v4.5" />
      <rect x="3.5" y="8.5" width="17" height="8" rx="1.6" />
      <path d="M6.5 15.5h11V21a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-5.5Z" />
      <path d="M7 12h1.5" />
    </svg>
  )
}
