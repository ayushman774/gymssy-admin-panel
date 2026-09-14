function Icon({ children, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  );
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </Icon>
  );
}

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Icon>
  );
}

export function ProvidersIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <circle cx="12" cy="13" r="2.4" />
    </Icon>
  );
}
