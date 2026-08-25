import { PrivacyBlurConfig } from './types';

export interface PrivacyBlurController {
  destroy: () => void;
  setBlur: (blur: boolean) => void;
}

/**
 * Automatically blurs the page and displays an anti-peeking shield when the user switches tabs or window loses focus.
 */
export function setupPrivacyBlur(
  options?: boolean | PrivacyBlurConfig
): PrivacyBlurController | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const isEnabled =
    typeof options === 'boolean'
      ? options
      : options?.enabled !== undefined
      ? options.enabled
      : true;

  if (!isEnabled) return null;

  const config: PrivacyBlurConfig =
    typeof options === 'object' && options !== null ? options : {};

  const blurAmount = config.blurAmount || '16px';
  const overlayTitle = config.overlayTitle || 'OptiGuard Privacy Shield';
  const overlaySubtitle =
    config.overlaySubtitle ||
    'Tampilan disembunyikan untuk melindungi kerahasiaan data.';
  const unblurOnFocus =
    config.unblurOnFocus !== undefined ? config.unblurOnFocus : true;

  let overlayEl: HTMLDivElement | null = null;
  let isBlurred = false;
  let isDestroyed = false;

  const injectStyles = () => {
    if (document.getElementById('optiguard-privacy-styles')) return;
    const style = document.createElement('style');
    style.id = 'optiguard-privacy-styles';
    style.textContent = `
      body.optiguard-privacy-active > *:not(#optiguard-privacy-overlay):not(#optiguard-lockscreen):not(#optiguard-watermark-overlay) {
        filter: blur(${blurAmount}) saturate(0.6) !important;
        transition: filter 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        user-select: none !important;
        pointer-events: none !important;
      }
      #optiguard-privacy-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 99998 !important;
        background: rgba(10, 15, 29, 0.72) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Plus Jakarta Sans', Inter, system-ui, sans-serif !important;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease !important;
      }
      #optiguard-privacy-overlay.active {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      #optiguard-privacy-overlay .privacy-card {
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.15);
        border-radius: 20px;
        padding: 32px 40px;
        text-align: center;
        max-width: 440px;
        color: #f8fafc;
        transform: translateY(8px);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #optiguard-privacy-overlay.active .privacy-card {
        transform: translateY(0);
      }
      #optiguard-privacy-overlay .shield-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2));
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #60a5fa;
      }
      #optiguard-privacy-overlay h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      #optiguard-privacy-overlay p {
        margin: 0 0 16px;
        font-size: 13.5px;
        color: #94a3b8;
        line-height: 1.5;
      }
      #optiguard-privacy-overlay .hint {
        font-size: 12px;
        font-weight: 600;
        color: #38bdf8;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(56, 189, 248, 0.1);
        padding: 6px 14px;
        border-radius: 9999px;
      }
    `;
    document.head.appendChild(style);
  };

  const createOverlay = () => {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.id = 'optiguard-privacy-overlay';
    overlayEl.innerHTML = `
      <div class="privacy-card">
        <div class="shield-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <rect x="9" y="8" width="6" height="4" rx="1"/>
          </svg>
        </div>
        <h3>${overlayTitle}</h3>
        <p>${overlaySubtitle}</p>
        <div class="hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          Klik di mana saja atau fokus ke tab untuk membuka kembali
        </div>
      </div>
    `;

    overlayEl.addEventListener('click', () => {
      if (unblurOnFocus) {
        setBlur(false);
      }
    });

    document.body.appendChild(overlayEl);
  };

  const setBlur = (blur: boolean) => {
    if (isDestroyed) return;
    isBlurred = blur;

    if (blur) {
      document.body.classList.add('optiguard-privacy-active');
      if (overlayEl) overlayEl.classList.add('active');
    } else {
      document.body.classList.remove('optiguard-privacy-active');
      if (overlayEl) overlayEl.classList.remove('active');
    }
  };

  injectStyles();
  createOverlay();

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      setBlur(true);
    } else if (document.visibilityState === 'visible' && unblurOnFocus) {
      setBlur(false);
    }
  };

  const handleWindowBlur = () => {
    setBlur(true);
  };

  const handleWindowFocus = () => {
    if (unblurOnFocus) {
      setBlur(false);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  return {
    destroy: () => {
      isDestroyed = true;
      setBlur(false);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      if (overlayEl && overlayEl.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
      }
      const style = document.getElementById('optiguard-privacy-styles');
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
      overlayEl = null;
    },
    setBlur,
  };
}
