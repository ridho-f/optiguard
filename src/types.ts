/**
 * Redirect or action behavior when DevTools / inspection / security breach is detected.
 */
export type RedirectBehavior =
  | 'logout'
  | 'back'
  | 'google'
  | 'home'
  | 'blank'
  | string;

/**
 * Custom branding configuration for the lock screen.
 */
export interface SecurityBrandingConfig {
  /** Title of the lock screen dialog. Default: "Developer Tools Terdeteksi" */
  title?: string;
  /** Description message text. Default: "Sesi Anda telah dihentikan secara otomatis demi menjaga integritas..." */
  message?: string;
  /** Badge label at the top of the card. Default: "OptiGuard Security Protocol" */
  badgeText?: string;
  /** Organization or company footer text. Default: "OptiGuard Security Protocol • PT Tata Optima Property" */
  footerText?: string;
  /** Brand Logo image URL. If null or false, logo is hidden. If undefined, built-in vector logo is shown. */
  logoUrl?: string | null | false;
  /** Primary action button label. Default: "Kembali ke Portal Login" */
  buttonText?: string;
  /** Action button URL link. Default: "/login" */
  buttonUrl?: string;
  /** Custom HTML renderer if full replacement is desired. */
  customHtml?: (config: SecurityConfig) => string;
}

/**
 * Dynamic Forensic Watermark configuration options.
 */
export interface WatermarkConfig {
  /**
   * Watermark text or array of strings to display (e.g. ['User: John Doe', 'IP: 192.168.1.1', 'Confidential']).
   * Can also be a function returning dynamic string or array.
   */
  text: string | string[] | (() => string | string[]);
  /** Watermark opacity (0.01 - 1.0). Default: 0.08 */
  opacity?: number;
  /** Watermark text font size in pixels. Default: 14 */
  fontSize?: number;
  /** Watermark text font family. Default: "Inter, system-ui, -apple-system, sans-serif" */
  fontFamily?: string;
  /** Watermark text color (hex, rgb, rgba). Default: "#000000" (or "#ffffff" in dark mode) */
  color?: string;
  /** Rotation angle in degrees. Default: -25 */
  rotate?: number;
  /** Horizontal and vertical gap/spacing between watermarks in pixels. Default: [180, 100] */
  gap?: [number, number];
  /** Z-index of the watermark overlay. Default: 9999 */
  zIndex?: number;
  /** Parent container selector or element. Default: document.body */
  container?: HTMLElement | string;
  /** Automatically append dynamic real-time timestamp (YYYY-MM-DD HH:mm:ss). Default: false */
  appendTimestamp?: boolean;
  /** Enforce anti-tampering MutationObserver to recreate watermark if deleted by DOM inspector. Default: true */
  antiTamper?: boolean;
}

/**
 * Tab-Switch Privacy Screen / Anti-Peeking configuration.
 */
export interface PrivacyBlurConfig {
  /** Enable or disable privacy blur on tab switch. Default: true */
  enabled?: boolean;
  /** CSS filter blur intensity (e.g. '12px', '20px'). Default: '15px' */
  blurAmount?: string;
  /** Floating overlay badge/title text when blurred. Default: "OptiGuard Privacy Shield" */
  overlayTitle?: string;
  /** Subtitle message text when blurred. Default: "Tampilan disembunyikan untuk menjaga kerahasiaan data." */
  overlaySubtitle?: string;
  /** Show dark translucent backdrop overlay on top of blur. Default: true */
  showBackdrop?: boolean;
  /** Automatically unblur and reveal screen when window regains focus. Default: true */
  unblurOnFocus?: boolean;
}

/**
 * Inactivity & Idle Auto-Lock configuration.
 */
export interface IdleLockConfig {
  /** Enable inactivity auto-lock. Default: false */
  enabled?: boolean;
  /** Inactivity timeout in milliseconds before locking screen. Default: 300000 (5 minutes) */
  timeout?: number;
  /** Action on idle: 'lockscreen' | 'logout' | 'redirect' | custom callback */
  action?: 'lockscreen' | 'logout' | 'redirect' | ((controller: any) => void);
  /** Custom warning callback triggered before lock (e.g., 30s before timeout). */
  onWarning?: (secondsRemaining: number) => void;
  /** Seconds before timeout to trigger onWarning. Default: 30 */
  warnBeforeSeconds?: number;
}

/**
 * Anti-Print and Anti-PDF Save configuration.
 */
export interface PrintBlockConfig {
  /** Block print dialog and shortcut Ctrl+P / Cmd+P. Default: true */
  enabled?: boolean;
  /** Completely blank/hide document content when printing. Default: true */
  hideContent?: boolean;
  /** Custom warning message to show in print preview if content is hidden. */
  printMessage?: string;
}

/**
 * Copy, Cut, Selection, and Drag-and-Drop protection configuration.
 */
export interface ContentProtectionConfig {
  /** Prevent text selection (user-select: none). Default: false */
  blockTextSelection?: boolean;
  /** Prevent copying content (Ctrl+C, Cmd+C, contextmenu copy). Default: false */
  blockCopy?: boolean;
  /** Prevent cutting content (Ctrl+X, Cmd+X). Default: false */
  blockCut?: boolean;
  /** Prevent dragging images, links, or text selections. Default: false */
  blockDragDrop?: boolean;
}

/**
 * Security Incident Event Details.
 */
export interface SecurityIncident {
  type:
    | 'devtools_opened'
    | 'debugger_detected'
    | 'shortcut_blocked'
    | 'contextmenu_blocked'
    | 'copy_blocked'
    | 'print_blocked'
    | 'idle_timeout'
    | 'watermark_tampered'
    | 'storage_cleared'
    | 'custom';
  timestamp: string;
  reason?: string;
  url?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Telemetry and incident reporting configuration.
 */
export interface TelemetryConfig {
  /** Backend API endpoint URL to send security incident reports via POST (e.g. '/api/security/incident'). */
  endpoint?: string;
  /** HTTP headers to send along with telemetry requests (e.g. Authorization or CSRF tokens). */
  headers?: Record<string, string>;
  /** Custom additional metadata to append to every incident payload. */
  metadata?: Record<string, any> | (() => Record<string, any>);
  /** Custom callback invoked whenever any security incident is triggered. */
  onIncident?: (incident: SecurityIncident) => void;
}

/**
 * Storage wiping options on security breach.
 */
export interface StorageWipeConfig {
  /** Wipe localStorage on security breach. Default: true */
  localStorage?: boolean;
  /** Wipe sessionStorage on security breach. Default: true */
  sessionStorage?: boolean;
  /** Wipe specific cookie keys or all document cookies. Default: false */
  cookies?: boolean | string[];
  /** Specific localStorage or sessionStorage key names to selectively delete. */
  keys?: string[];
}

/**
 * Main configuration options for OptiGuard Security protection.
 */
export interface SecurityConfig {
  /** Enable or disable the entire security protection. Default: true */
  enabled?: boolean;

  /** If true, disable protection on development environments (localhost, 127.0.0.1, ::1, import.meta.env.DEV). Default: true */
  disableInDev?: boolean;

  /** Action to perform when developer tools are detected. Options: 'logout' | 'back' | 'google' | 'home' | 'blank' | custom URL. Default: 'logout' */
  redirectBehavior?: RedirectBehavior;

  /** Prevent mouse right-click context menu. Default: true */
  blockContextMenu?: boolean;

  /** Prevent keyboard shortcuts like F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S. Default: true */
  blockShortcuts?: boolean;

  /** Prevent text selection (user-select: none & selectstart block). Default: true */
  blockTextSelection?: boolean;

  /** Prevent copying content (Ctrl+C, Cmd+C). Default: true */
  blockCopy?: boolean;

  /** Prevent cutting content (Ctrl+X, Cmd+X). Default: true */
  blockCut?: boolean;

  /** Prevent dragging images, links, or text selections. Default: true */
  blockDragDrop?: boolean;

  /** Content copy & selection protection options. */
  contentProtection?: ContentProtectionConfig;

  /** Block print dialog (Ctrl+P) and hide content on print preview. Default: false */
  blockPrint?: boolean | PrintBlockConfig;

  /** Dynamic forensic watermark configuration. */
  watermark?: boolean | WatermarkConfig;

  /** Privacy Screen / Anti-Peeking on tab switch and window blur. */
  privacyBlur?: boolean | PrivacyBlurConfig;

  /** Inactivity / Idle auto-lock configuration. */
  idleLock?: boolean | IdleLockConfig;

  /** Telemetry and security incident reporting configuration or webhook URL. */
  telemetry?: string | TelemetryConfig;

  /** Storage wiping on security breach (DevTools detection). Default: false */
  wipeStorageOnDetect?: boolean | StorageWipeConfig;

  /** Devtools detection polling delay in milliseconds. Default: 200 */
  detectDelay?: number;

  /** Periodic inspection check interval in milliseconds. Default: 300 */
  checkInterval?: number;

  /** URL to redirect to when redirectBehavior is 'logout' or custom. Default: '/login' */
  redirectUrl?: string;

  /** Custom branding configuration for the lock screen modal. */
  branding?: SecurityBrandingConfig;

  /** Custom callback invoked immediately when DevTools / inspector is detected. If returns `false`, default redirect is skipped. */
  onDetect?: (details?: { reason?: string }) => boolean | void;

  /** Custom router or navigation hook listener (e.g. Inertia, Next.js, Vue Router). */
  onRouteChanged?: (callback: () => void) => (() => void) | void;
}

declare global {
  interface Window {
    __SECURITY_CONFIG__?: SecurityConfig;
    __OPTIGUARD_INSTANCE__?: any;
  }
}
