/**
 * Redirect or action behavior when DevTools / inspection is detected.
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
 * Main configuration options for OptiGuard Security protection.
 */
export interface SecurityConfig {
  /**
   * Enable or disable the entire security protection.
   * Default: true
   */
  enabled?: boolean;

  /**
   * If true, disable protection on development environments (localhost, 127.0.0.1, ::1, import.meta.env.DEV).
   * Default: true
   */
  disableInDev?: boolean;

  /**
   * Action to perform when developer tools are detected.
   * Options: 'logout' | 'back' | 'google' | 'home' | 'blank' | custom URL
   * Default: 'logout'
   */
  redirectBehavior?: RedirectBehavior;

  /**
   * Prevent mouse right-click context menu.
   * Default: true
   */
  blockContextMenu?: boolean;

  /**
   * Prevent keyboard shortcuts like F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S.
   * Default: true
   */
  blockShortcuts?: boolean;

  /**
   * Devtools detection polling delay in milliseconds.
   * Default: 200
   */
  detectDelay?: number;

  /**
   * Periodic inspection check interval in milliseconds.
   * Default: 300
   */
  checkInterval?: number;

  /**
   * URL to redirect to when redirectBehavior is 'logout' or custom.
   * Default: '/login'
   */
  redirectUrl?: string;

  /**
   * Custom branding configuration for the lock screen modal.
   */
  branding?: SecurityBrandingConfig;

  /**
   * Custom callback invoked immediately when DevTools / inspector is detected.
   * If this function returns `false`, default redirect/lock screen behavior is skipped.
   */
  onDetect?: (details?: { reason?: string }) => boolean | void;

  /**
   * Custom router or navigation hook listener (e.g. Inertia, Next.js, Vue Router).
   */
  onRouteChanged?: (callback: () => void) => (() => void) | void;
}

declare global {
  interface Window {
    __SECURITY_CONFIG__?: SecurityConfig;
  }
}
